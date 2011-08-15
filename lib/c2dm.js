var sys = require('sys')
  , https = require('https')
  , querystring = require('querystring')
  , emitter = require('events').EventEmitter;

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
};

sys.inherits(C2DM, emitter);

exports.C2DM = C2DM;

C2DM.prototype.captureToken = function(err, token) {
	this.token = token;
};

C2DM.prototype.login = function(cb) {
	var self = this;
	this.once('token', this.captureToken);

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
        res.on('data', function(chunk) {
                data += chunk;
        });
        res.on('end', function() {
                var idx = data.indexOf('Auth=');
                if (idx < 0) {
                        self.emit('token', data, null);
                } else {
                        self.emit('token', null, data.substring(idx).replace('Auth', 'auth').replace(/(\n)+$/, ''));
                }
        });
	});
	request.end(querystring.stringify(postData));
};

C2DM.prototype.send = function(packet, cb) {
	var self = this;
	if (cb) this.once('sent', cb);

	var postData = querystring.stringify(packet);
	var headers = {
		//'Connection': 'keep-alive',
		'Host': 'android.apis.google.com',
		'Authorization': 'GoogleLogin ' + this.token,
		'Content-Type': 'application/x-www-form-urlencoded',
		'Content-length': postData.length
	};
	this.c2dmOptions.headers = headers;
	if (this.keepAlive)
		headers.Connection = 'keep-alive';

	var request = https.request(this.c2dmOptions, function(res){
		var data = '';
        res.on('data', function(chunk) {
                data += chunk;
        });
        res.on('end', function() {
                var idx = data.indexOf('id=');
                if (idx < 0) {
                        self.emit('sent', data, null);
                } else {
                        self.emit('sent', null, data.substring(idx));
                }
        });
	});
	request.end(postData);
};
