# node-c2dm
An interface for [Android Cloud to Device Messaging][1] push notification service for Node.js

## Installation

Via [npm][4]:

    $ npm install c2dm

As a submodule of your project

    $ git submodule add http://github.com/SpeCT/node-c2dm.git c2dm
    $ git submodule update --init

## Usage
### Load in the module

    var C2DM = require('c2dm').C2DM;

### Create a connection
See [Google Client Login documentation][2] for details.

    var config = {
        user: 'bla-blah-blah@gmail.com',
        password: 'your-huge-very-very-strong-password',
        source: 'com.company.app-name',
    };
    var c2dm = new C2DM(config);

### Login into c2dm

    c2dm.login(function(err, token){
        // err - error, received from Google ClientLogin api
        // token - Auth token
    });
    
### Send message to device
See [C2DM documentation][3] for details.

    var message = {
        registration_id: 'Device registration id',
        collapse_key: 'Collapse key', // required
        'data.key1': 'value1',
        'data.key2': 'value2',
        delay_while_idle: '1' // remove if not needed
    };
    
    c2dm.send(message, function(err, messageId){
        if (err) {
            console.log("Something has gone wrong!");
        } else {
            console.log("Sent with message ID: ", messageId);
        }
    });

### Avoiding login procedure
You can avoid the login procedure by manually setting Google ClientLogin Auth token in the connection config.
First of all you need to fetch the token by executing the following command. Replace `ROLE_EMAIL`, `ROLE_PASSWORDPASS` and `YOURCOMPANY-YOURAPP-Version` with your data:

    $ curl -X POST https://www.google.com/accounts/ClientLogin -d Email=ROLE_EMAIL -d Passwd=ROLE_PASSWORDPASS -d accountType=HOSTED_OR_GOOGLE -d service=ac2dm -d source=YOURCOMPANY-YOURAPP-Version	

You will receive three lines. Skip `SID` and `LSID` and copy line starting with `Auth=`. Next include 'token' property into config data and fill it with this `Auth=...` line:

    var config = {
        token: 'Auth=VVVVEEERY-HUDE-TOKEN',  // N.B. include with Auth= prefix
    };
    var c2dm = new C2DM(config);

However, Google will occaisionally require the token to be updated before further requests can be accepted. If this happens, the `Update-Client-Auth` header will automatically be used to update the current configurations token, but obviously will not be stored on the next reload. A `token` event will be triggered if this happens so you can update a local configuration file, but its probably easier to perform a login each time the application is started:

    c2dm.on('token', function(err, token) {
      // Do something with the new token
    });

### Testing sending a message
If it looks like things aren't going your way, try sending a request manually using the following curl command and see what google sends back to you:

    $ curl -H "Authorization: GoogleLogin auth=YOUR-LONG-TOKEN" -X POST https://android.apis.google.com/c2dm/send -d "registration_id=DESTINATION-TOKEN" -d "collapse_key=key" -d "data.event=hire" -v

You should get back the header details along with a message id if sending has been successful. For example:

    .... sending headers and SSL stuff .....
    < HTTP/1.1 200 OK
    < Content-Type: text/plain
    < Date: Wed, 18 Jan 2012 11:18:01 GMT
    < Expires: Wed, 18 Jan 2012 11:18:01 GMT
    < Cache-Control: private, max-age=0
    < X-Content-Type-Options: nosniff
    < X-Frame-Options: SAMEORIGIN
    < X-XSS-Protection: 1; mode=block
    < Server: GSE
    < Transfer-Encoding: chunked
    <
    id=0:1326885481081626%900b347100019e5f
    .... more SSL stuff ....

### Keep-alive connection
This module supports Connection: keep-alive header too keep connection to c2dm gate established. You could use it by simply including property in config:

    var config = {
        ...
        keepAlive: true,  // it is false by default
    };


## Credits

Written and maintained by [Yury Proshchenko][5].

## License

The MIT License

Copyright (c) 2011 Yury Proshchenko (spect.man@gmail.com)

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

[1]: http://code.google.com/android/c2dm/index.html
[2]: http://code.google.com/apis/accounts/docs/AuthForInstalledApps.html#Request
[3]: http://code.google.com/android/c2dm/index.html#push
[4]: http://github.com/isaacs/npm
[5]: mailto:spect.man@gmail.com

## Changelog

1.1.0

 - [#2](http://github.com/SpeCT/node-c2dm/issues/2) – Exponential backoff retry on quota and temporary errors (thanks Olivier Poitrey aka [rs](https://github.com/rs))
 - Handle auth_token refresh (Update-Client-Auth header) (thanks [Sam Lown](https://github.com/samlown))

1.0.4

  - Handle scenario where 'close' event is emitted before 'end' event (node 0.4.x)

1.0.3

  - Converted internal subscription method from on(2) to once(2)
  - Published to npm

1.0.2

  - Fixed 'Content-length missing' error

1.0.1

  - Fixed package.json (thanks Mohd Faruq aka ruqqq)
  - Fixed 'socked hang up' error (once again thanks Mohd Faruq aka ruqqq)

1.0.0:

  - Initial release