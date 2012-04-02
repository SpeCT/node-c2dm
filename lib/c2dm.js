var util = require('util');
var https = require('https');
var querystring = require('querystring');
var emitter = require('events').EventEmitter;
var retry = require('retry');

function C2DM(config) {
    if (config) {
        if ('user' in config)
            this.user = config.user;
        if ('password' in config)
            this.password = config.password;
        this.source = 'source' in config ? config.source : 'node-c2dm-client';
        this.token = 'token' in config ? config.token : null;
        this.keepAlive = 'keepAlive' in config ? config.keepAlive : false;
    } else {
        throw Error('No config given.');
    }
    this.loginOptions = {
        host: 'www.google.com',
        port: 443,
        path: '/accounts/ClientLogin',
        method: 'POST',
        headers: {'Content-Type': 'application/x-www-form-urlencoded'}
    };
    this.c2dmOptions = {
        host: 'android.apis.google.com',
        port: 443,
        path: '/c2dm/send',
        method: 'POST',
        headers: {}
    };
    this.on('token', this.captureToken);
}

util.inherits(C2DM, emitter);

exports.C2DM = C2DM;

C2DM.prototype.captureToken = function(err, token) {
    this.token = token;
};

C2DM.prototype.login = function(cb) {
    var self = this;

    if (cb) this.once('token', cb);

    var postData = {
        Email: this.user,
        Passwd: this.password,
        accountType: 'HOSTED_OR_GOOGLE',
        source: this.source,
        service: 'ac2dm'
    };

    var request = https.request(this.loginOptions, function(res) {
        var data = '';
        function respond() {
            var idx = data.indexOf('Auth=');
            if (idx < 0) {
                self.emit('token', data, null);
            } else {
                self.emit('token', null, data.substring(idx).replace('Auth', 'auth').replace(/(\n)+$/, ''));
            }
        }
        res.on('data', function(chunk) {
            data += chunk;
        });
        res.on('end', respond);
        res.on('close', respond);
    });
    request.end(querystring.stringify(postData));
};

C2DM.prototype.send = function(packet, cb) {
    var self = this;
    if (cb) this.once('sent', cb);

    var operation = retry.operation();

    operation.attempt(function(currentAttempt) {
        var postData = querystring.stringify(packet);
        var headers = {
            //'Connection': 'keep-alive',
            'Host': 'android.apis.google.com',
            'Authorization': 'GoogleLogin ' + self.token,
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-length': postData.length
        };
        self.c2dmOptions.headers = headers;
        if (self.keepAlive)
            headers.Connection = 'keep-alive';

        var request = https.request(self.c2dmOptions, function(res) {
            var data = '';

            if (res.statusCode == 503) {
                // If the server is temporary unavailable, the C2DM spec requires that we implement exponential backoff
                // and respect any Retry-After header
                if (res.headers['retry-after']) {
                    var retrySeconds = res.headers['retry-after'] * 1; // force number
                    if (isNaN(retrySeconds)) {
                        // The Retry-After header is a HTTP-date, try to parse it
                        retrySeconds = new Date(res.headers['retry-after']).getTime() - new Date().getTime();
                    }
                    if (!isNaN(retrySeconds) && retrySeconds > 0) {
                        operation._timeouts['minTimeout'] = retrySeconds;
                    }
                }
                if (!operation.retry('TemporaryUnavailable')) {
                    self.emit('sent', operation.mainError(), null);
                }
                // Ignore all subsequent events for this request
                return;
            }

            // Check if we need to update the headers and try again
            var newToken = res.headers['update-client-auth'];
            if (newToken) {
                self.emit('token', null, newToken);
                self.send(packet, cb);
                return; // ignore any other events from this request
            }

            function respond() {
                var error = null, id = null;

                if (data.indexOf('Error=') === 0) {
                    error = data.substring(6).trim();
                }
                else if (data.indexOf('id=') === 0) {
                    id = data.substring(3).trim();
                }
                else {
                    // No id nor error?
                    error = 'InvalidServerResponse';
                }

                // Only retry if error is QuotaExceeded or DeviceQuotaExceeded
                if (operation.retry(['QuotaExceeded', 'DeviceQuotaExceeded', 'InvalidServerResponse'].indexOf(error) >= 0 ? error : null)) {
                    return;
                }

                // Success, return message id (without id=)
                self.emit('sent', error, id);
            }

            res.on('data', function(chunk) {
                data += chunk;
            });
            res.on('end', respond);
            res.on('close', respond);
        });
        request.end(postData);
    });
};
