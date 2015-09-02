var Util             = require('util');
var Put              = require('bufferput');
var TCPClient        = require('tcpClient');
var Handler          = require('./responsehandler');
var ModbusMaster     = require('./modbusmaster');

var PROTOCOL_VERSION = 0;
var UNIT_ID          = 1;

function ModbusTCPMaster (port, host, callback){
    if (!(this instanceof ModbusTCPMaster)) {
        return new ModbusTCPMaster(port, host, callback);
    }

    ModbusTCPMaster.super_.call(this);
    //ModbusMaster.call(this);

    // package and callback queues
    this._current = null;
    this._reqId = 0;

    this._resHandler = Handler.Client.ResponseHandler;
    this._tcpClient = TCPClient.create(host, port, callback);
    this._tcpClient.on('data', this._handleData(this));
    this._tcpClient.on('connect', this._handleConnection(this));

    this._tcpClient.connect();
    this.state = 'ready'; // ready or waiting (for response)
};

Util.inherits(ModbusTCPMaster, ModbusMaster);

/**
 * Pack up the pdu and the handler function
 * and pipes both. Calls flush in the end.
 */
ModbusTCPMaster.prototype._makeRequest = function (fc, pdu, cb) {

    ModbusMaster.prototype._makeRequest.apply(this, arguments);

    if (this.state === 'ready') {
        this._flushPipe();
    }
};

/**
 *  Iterates through the package pipe and
 *  sends the requests
 */
ModbusTCPMaster.prototype._flushPipe = function () {
    if (!this._tcpClient.isConnected) {
        return;
    }

    if (this._pipe.length > 0 && !this._current) {

        this._current = this._pipe.shift();

        var pkt = new Put()
            .word16be(this._reqId++)                 // transaction id
            .word16be(PROTOCOL_VERSION)             // protocol version
            .word16be(this._current.pdu.length + 1) // pdu length
            .word8(UNIT_ID)                         // unit id
            .put(this._current.pdu)                 // the actual pdu
            .buffer();

        this._tcpClient.send(pkt);
        this.state = "waiting";
    }
};

ModbusTCPMaster.prototype._handleConnection = function(that){
    return function() {
        that._flushPipe();
    }
};

/**
 *  Handle the incoming data, cut out the mbap
 *  packet and send the pdu to the listener
 */
ModbusTCPMaster.prototype._handleData = function (that) {

    return function (data) {

        console.log('received data');

        var cnt = 0;

        while (cnt < data.length) {

            // 1. extract mbap

            var mbap = data.slice(cnt, cnt + 7),
                len = mbap.readUInt16BE(4);

            cnt += 7;

            console.log('MBAP extracted');

            // 2. extract pdu

            var pdu = data.slice(cnt, cnt + len - 1);

            cnt += pdu.length;

            console.log('PDU extracted: '+pdu);

            // emit data event and let the
            // listener handle the pdu

            //that.emit('data', pdu);

            //-----------------------
            if (!that._current) {
                return;
            }

            // 1. check pdu for errors

            console.log("Checking pdu for errors");
            if (that._handleErrorPDU(pdu, that._current.cb)) {
                that.state = "ready";
                that._current = null;
                that._flushPipe();
                return;
            }

            // 2. handle pdu

            console.log("Calling Callback with pdu.");
            var handler = that._resHandler[that._current.fc];
            if (!handler) {
                throw "No handler implemented.";
            }
            handler(pdu, that._current.cb);

            that._current = null;
            that.state = "ready";
            that._flushPipe();
        }

    };

};


/**
 *  Check if the given pdu contains fc > 0x84 (error code)
 *  and return false if not, otherwise handle the error,
 *  call cb(null, err) and return true
 */
ModbusTCPMaster.prototype._handleErrorPDU = function (pdu, cb) {

    var errorCode = pdu.readUInt8(0);

    // if error code is smaller than 0x80
    // the pdu describes no error
    if (errorCode < 0x80) {
        return false;
    }

    console.log("PDU describes an error.");
    var exceptionCode = pdu.readUInt8(1);
    var message = Handler.ExceptionMessage[exceptionCode];

    var err = {
        errorCode: errorCode,
        exceptionCode: exceptionCode,
        message: message
    };

    // call the desired callback with
    // err parameter set
    cb(null, err);

    return true;
};

ModbusTCPMaster.prototype.reconnect = function(){
    this._tcpClient.connect();
};


exports.create = ModbusTCPMaster;