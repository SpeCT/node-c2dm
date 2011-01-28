Android Cloud to Device Messaging
============

An interface to the Android Cloud to Device Messaging (C2DM) service for Node.js


Usage
============

    var C2DM = require('node-c2dm').C2DM;
    
    var c2dm = new C2DM({
    // see [Request section of 'ClientLogin for Installed Applications'](http://code.google.com/apis/accounts/docs/AuthForInstalledApps.html#Request) for details
    
    	user: 'bla-blah-blah@gmail.com',
    	password: 'your-huge-very-very-strong-password',
       	source: 'yourCompany-yourMegaApp-version', 
    });
    
    c2dm.login(function(err, token) {
	    var message = {
        // see [c2dm documentation](http://code.google.com/android/c2dm/index.html#push) for details
        	registration_id: 'device-regitration-id',
	    	collapse_key: 'collapse_key',
	    	'data.key1': 'value1',
	    	'data.key2': 'value2',
	    	delay_while_idle: '1' // remove if not needed
	    };
	    
	    c2dm.send(message, function(err, messageId){
    
	    });
    });


License
============

may be MIT or something. will update later.