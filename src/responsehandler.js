
var Put = require('bufferput');
var util = require('util');

var log = function (msg) {  }

exports.setLogger = function (logger) {
  log = logger;
};

exports.ExceptionMessage = {

  0x01 : 'ILLEGAL FUNCTION',
  0x02 : 'ILLEGAL DATA ADDRESS',
  0x03 : 'ILLEGAL DATA VALE',
  0x04 : 'SLAVE DEVICE FAILURE',
  0x05 : 'ACKNOWLEDGE',
  0x06 : 'SLAVE DEVICE BUSY',
  0x08 : 'MEMORY PARITY ERROR',
  0x0A : 'GATEWAY PATH UNAVAILABLE',
  0x0B : 'GATEWAY TARGET DEVICE FAILED TO RESPOND'

};

exports.FC = {
  readCoils		: 1,
  readInputRegister	: 4
};

exports.Server = { };

/**
 *  Server response handler. Put new function call
 *  responses in here. The parameters for the function
 *  are defined by the handle that has been delivered to 
 *  the server objects addHandler function.
 */
exports.Server.ResponseHandler = {
  // read coils
  1:  function (register) {
        var flr = Math.floor(register.length / 8),
	    len = register.length % 8 > 0 ? flr + 1 : flr,
	    res =new Put().word8(1).word8(len);

        var cntr = 0;
        for (var i = 0; i < len; i += 1 ) {
	  var cur = 0;
   	  for (var j = 0; j < 8; j += 1) {
 	    var h = 1 << j;
	    
	    if (register[cntr]) {
	      cur += h;
 	    }

	    cntr += 1;
 	  }
	  res.word8(cur);
   	}

        return res.buffer();
      },
  // read input register
  4:  function (register) {

        var res =new Put().word8(4).word8(register.length * 2);

	for (var i = 0; i < register.length; i += 1) {
	  res.word16be(register[i]);
	}

	return res.buffer();
  },
  5:  function (outputAddress, outputValue) {

        var res =new Put().word8(5).word16be(outputAddress)
		.word16be(outputValue?0xFF00:0x0000).buffer();

        return res;
  },
  6: function (outputAddress, outputValue) {
  
      var res =new Put().word8(5).word16be(outputAddress).word16be(outputValue).buffer();

      return res;
  
  }

};

/**
 *  The RequestHandler on the server side. The
 *  functions convert the incoming pdu to a 
 *  usuable set of parameter that can be handled
 *  from the server objects user handler (see addHandler 
 *  function in the servers api).
 */
exports.Server.RequestHandler = {

    // ReadCoils
    1:  function (pdu) {

        var fc = pdu.readUInt8(0), // never used, should just be an example
            startAddress = pdu.readUInt16BE(1),
            quantity = pdu.readUInt16BE(3),
            param = [ startAddress, quantity ];

        return param;	
    },

    // ReadInputRegister
    4: function (pdu) {

        var startAddress = pdu.readUInt16BE(1),
            quantity = pdu.readUInt16BE(3),
            param = [ startAddress, quantity ];

        return param;
    },
    5: function (pdu) {
      
        var outputAddress = pdu.readUInt16BE(1),
            outputValue = pdu.readUInt16BE(3),
            boolValue = outputValue===0xFF00?true:outputValue===0x0000?false:undefined,
        param = [ outputAddress, boolValue ];

        return param;
    },
    6: function (pdu) {
     
        var outputAddress   = pdu.readUInt16BE(1),
            outputValue     = pdu.readUInt16BE(3),
            param = [ outputAddress, outputValue ];

        return param; 
     
     }
  };


exports.Client = { };

/**
 *  The response handler for the client
 *  converts the pdu's delivered from the server
 *  into parameters for the users callback function.
 */
exports.Client.ResponseHandler = {
    // ReadCoils
    1:	function (pdu, cb) {

        //log("handeling read coils response.");

        var fc = pdu.readUInt8(0),
	      byteCount = pdu.readUInt8(1),
	      bitCount = byteCount * 8;

        var resp = {
            fc: fc,
            byteCount: byteCount,
            coils: []
        };

        var cntr = 0;
        for (var i = 0; i < byteCount; i+=1) {
            var h = 1, cur = pdu.readUInt8(2 + i);
            for (var j = 0; j < 8; j+=1) {
                resp.coils[cntr] = (cur & h) > 0 ;
                h = h << 1;
                cntr += 1;
            }
        }

        cb(resp);

        return resp;
	},

    // ReadDiscreteInputs
    2:	function (pdu, cb) {

        //log("handeling read discrete inputs response.");

        var fc = pdu.readUInt8(0),
            byteCount = pdu.readUInt8(1),
            bitCount = byteCount * 8;

        var resp = {
            fc: fc,
            byteCount: byteCount,
            dInputs: []
        };

        var cntr = 0;
        for (var i = 0; i < byteCount; i+=1) {
            var h = 1, cur = pdu.readUInt8(2 + i);
            for (var j = 0; j < 8; j+=1) {
                resp.dInputs[cntr] = (cur & h) > 0 ;
                h = h << 1;
                cntr += 1;
            }
        }

        cb(resp);

        return resp;
    },

    // ReadHoldingRegisters
    3:  function (pdu, cb) {

        //log("handling read holding registers response.");

        var fc = pdu.readUInt8(0),
            byteCount = pdu.readUInt8(1);

        var resp = {
            fc: fc,
            byteCount: byteCount,
            registers: []
        };

        var registersCount = byteCount / 2;

        for (var i = 0; i < registersCount; i += 1) {
            resp.registers.push(pdu.readUInt16BE(2 + (i * 2)));
        }

        cb(resp);

        return resp;
    },

    // ReadInputRegisters
    4:  function (pdu, cb) {

        //log("handling read input registers response.");

        var fc = pdu.readUInt8(0),
            byteCount = pdu.readUInt8(1);

        var resp = {
            fc: fc,
            byteCount: byteCount,
            registers: []
        };

        var registerCounts = byteCount / 2;

        for (var i = 0; i < registerCounts; i += 1) {
            resp.registers.push(pdu.readUInt16BE(2 + (i * 2)));
        }

        cb(resp);

        return resp;
    },

    // WriteSingleCoil
    5:  function (pdu, cb) {

        //log("handling write single coil response.");

        var fc = pdu.readUInt8(0),
            outputAddress = pdu.readUInt16BE(1),
            outputValue = pdu.readUInt16BE(3);

        var resp = {
            fc: fc,
            outputAddress: outputAddress,
            outputValue: outputValue === 0x0000?false:outputValue===0xFF00?true:undefined
        };

        cb(resp);

        return resp;
    },

    // WriteSingleRegister
    6:    function (pdu, cb) {

        //log("handling write single register response.");

        var fc = pdu.readUInt8(0),
            registerAddress = pdu.readUInt16BE(1),
            registerValue = pdu.readUInt16BE(3);

        var resp = {
            fc: fc,
            registerAddress: registerAddress,
            registerValue: registerValue
	    };

 	    cb(resp);

        return resp;
    }
        
};


