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
        source: 'yourCompany-yourMegaApp-version', 
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
        collapse_key: 'Collapse key',
        'data.key1': 'value1',
        'data.key2': 'value2',
        delay_while_idle: '1' // remove if not needed
    };
    
    c2dm.send(message, function(err, messageId){

    });

### Avoiding login procedure
You can avoid login procedure by manually setting Google ClientLogin Auth tokin in config for connection.
First of all you need to get this token by executing next command after replacing `ROLE_EMAIL`, `ROLE_PASSWORDPASS` and `YOURCOMPANY-YOURAPP-Version` with your data:

    $ curl -X POST https://www.google.com/accounts/ClientLogin -d Email=ROLE_EMAIL -d Passwd=ROLE_PASSWORDPASS -d accountType=HOSTED_OR_GOOGLE -d service=ac2dm -d source=YOURCOMPANY-YOURAPP-Version	

You will receive three lines. Skip `SID` and `LSID` and copy line starting with `Auth=`. Next include 'token' property into config data and fill it with this `Auth=...` line:

    var config = {
        token: 'Auth=VVVVEEERY-HUDE-TOKEN',  // N.B. include with Auth= prefix
    };
    var c2dm = new C2DM(config);

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