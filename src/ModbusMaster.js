var Put              = require('bufferput');

var dummy            = function () { };

var ModbusMaster = function(){
    if (!(this instanceof ModbusMaster)) {
        return new ModbusMaster();
    }

    // package and callback queues
    this._pipe = [];
};

ModbusMaster.prototype.readCoils = function (start, quantity, cb) {
    var fc  = 1,
        pdu = this._pduWithTwoParameter(fc, start, quantity);

    this._makeRequest(fc, pdu, !cb?dummy:cb);
};

ModbusMaster.prototype.readDiscreteInputs = function (start, quantity, cb) {
    var fc = 2,
        pdu = this._pduWithTwoParameter(fc, start, quantity);
    this._makeRequest(fc, pdu, !cb ? dummy : cb);
};

ModbusMaster.prototype.readHoldingRegisters = function (start, quantity, cb) {
    var fc = 3,
        pdu = this._pduWithTwoParameter(fc, start, quantity);
    this._makeRequest(fc, pdu, !cb ? dummy : cb);
};

ModbusMaster.prototype.readInputRegister = function(start, quantity, cb) {
    var fc = 4,
        pdu = this._pduWithTwoParameter(fc, start, quantity);
    this._makeRequest(fc, pdu, !cb ? dummy : cb);
};

ModbusMaster.prototype.writeSingleCoil = function(address, value, cb) {
    var fc = 5,
        pdu = this._pduWithTwoParameter(fc, address, value ? 0xff00 : 0x0000);
    this._makeRequest(fc, pdu, !cb ? dummy : cb);
};

ModbusMaster.prototype.writeSingleRegister = function(address, value, cb) {
    var fc = 6,
        pdu = this._pduWithTwoParameter(fc, address, value);
    this._makeRequest(fc, pdu, !cb ? dummy : cb);
};

ModbusMaster.prototype.writeMultipleCoils = function(address, values, cb) {
    var fc = 15,
        pdu = this._pduWithTwoParameter(fc, address, values);
    this._makeRequest(fc, pdu, !cb ? dummy : cb);
};

ModbusMaster.prototype.writeMultipleRegisters = function(address, values, cb) {
    var fc = 16,
        pdu = this._pduWithTwoParameter(fc, address, values);
    this._makeRequest(fc, pdu, !cb ? dummy : cb);
};


/**
 * Pack up the pdu and the handler function
 * and pipes both. Calls flush in the end.
 */
ModbusMaster.prototype._makeRequest = function (fc, pdu, cb) {

    var req = { fc: fc, cb: cb, pdu: pdu };

    this._pipe.push(req);
};

/**
 *  Many requests look like this so I made
 *  this an extra function.
 */
ModbusMaster.prototype._pduWithTwoParameter = function (fc, start, quantity) {
    return Put()
        .word8(fc)
        .word16be(start)
        .word16be(quantity)
        .buffer();
};

module.exports = ModbusMaster;
