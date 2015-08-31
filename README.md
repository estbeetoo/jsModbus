**[deprecated]** Do not use this package anymore, for an actively maintained source for the node.js modbus client got to [https://github.com/Cloud-Automation/modbus](https://github.com/Cloud-Automation/modbus)
and the modbus client for chrome apps visit [[https://github.com/Cloud-Automation/chrome-modbus](https://github.com/Cloud-Automation/chrome-modbus).

A simple an easy to use Modbus TCP client implementation.

ModbusTCPMaster
===============

ModbusTCPMaster is a simple Modbus TCP Client with a 
selfexplaining API.

Installation
------------

Since this module is part of npm simply type `npm install jsmodbus` and you are ready to go.


Client example
--------------

	var jsModbus = require('./ModbusTCPMaster');
	
	// create a modbus client
	var client = jsModbus.createTCPClient(502, '127.0.0.1', function (err) {
        if (err) {
            console.log(err);
            exit(0);
        }
    });
	
	// make some calls
	client.readInputRegister(0, 10, function (resp, err) {
	  // resp will look like { fc: 4, byteCount: 20, register: [ values 0 - 10 ] }
	});
	
	client.readCoils(5, 3, function (resp, err) {
	  // resp will look like { fc: 1, byteCount: 1, register: [ true, false, true ] }
	});
	
	client.writeSingleCoil(5, true, function (resp, err) {
	  // resp will look like { fc: 5, byteCount: 4, outputAddress: 5, outputValue: true }
	});

  	client.writeSingleRegister(13, 42, function (resp, err) {
	  // resp will look like { fc: 6, byteCount: 4, registerAddress: 13, registerValue: 42 }
	});


License
-------

Copyright (C) 2012 Stefan Poeter (Stefan.Poeter[at]gmail.com)

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
