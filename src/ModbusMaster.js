var Put              = require('bufferput');
var EventEmitter     = require('events').EventEmitter;
var Util             = require('util');

var dummy            = function () { };

function ModbusMaster(){
    if (!(this instanceof ModbusMaster)) {
        return new ModbusMaster();
    }

    ModbusMaster.super_.call(this);

    this._coils = [];
    this._dInputs = [];
    this._holdingRegisters = [];
    this._inputRegisters = [];
    this.pollTimeOut = 1000;

    // package and callback queues
    this._readingPipe = [];
    this._writingPipe = [];
}

Util.inherits(ModbusMaster, EventEmitter);

ModbusMaster.prototype.readCoils = function (start, quantity, cb) {
    var fc  = 1,
        pdu = this._pduWithTwoParameter(fc, start, quantity);

    this._makeReadingRequest(fc, pdu, !cb?dummy:cb);
};

ModbusMaster.prototype.readDiscreteInputs = function (start, quantity, cb) {
    var fc = 2,
        pdu = this._pduWithTwoParameter(fc, start, quantity);
    this._makeReadingRequest(fc, pdu, !cb ? dummy : cb);
};

ModbusMaster.prototype.readHoldingRegisters = function (start, quantity, cb) {
    var fc = 3,
        pdu = this._pduWithTwoParameter(fc, start, quantity);
    this._makeReadingRequest(fc, pdu, !cb ? dummy : cb);
};

ModbusMaster.prototype.readInputRegisters = function(start, quantity, cb) {
    var fc = 4,
        pdu = this._pduWithTwoParameter(fc, start, quantity);
    this._makeReadingRequest(fc, pdu, !cb ? dummy : cb);
};

ModbusMaster.prototype.writeSingleCoil = function(address, value, cb) {
    var fc = 5,
        pdu = this._pduWithTwoParameter(fc, address, value ? 0xff00 : 0x0000);
    this._makeWritingRequest(fc, pdu, !cb ? dummy : cb);
};

ModbusMaster.prototype.writeSingleRegister = function(address, value, cb) {
    var fc = 6,
        pdu = this._pduWithTwoParameter(fc, address, value);
    this._makeWritingRequest(fc, pdu, !cb ? dummy : cb);
};

ModbusMaster.prototype.writeMultipleCoils = function(address, values, cb) {
    var fc = 15,
        pdu = this._pduWithTwoParameter(fc, address, values);
    this._makeWritingRequest(fc, pdu, !cb ? dummy : cb);
};

ModbusMaster.prototype.writeMultipleRegisters = function(address, values, cb) {
    var fc = 16,
        pdu = this._pduWithTwoParameter(fc, address, values);
    this._makeWritingRequest(fc, pdu, !cb ? dummy : cb);
};

ModbusMaster.prototype.addPollingCoils = function(start, quantity) {
    if (typeof start === 'undefined'){
        return;
    }

    for (var i=start; i<start+(quantity || 1); i++){
        this._coils[i] = true;
    }
};

ModbusMaster.prototype.addPollingInputs = function(start, quantity) {
    if (typeof start === 'undefined'){
        return;
    }

    for (var i=start; i<start+(quantity || 1); i++){
        this._dInputs[i] = true;
    }
};

ModbusMaster.prototype.addPollingHoldingRegisters = function(start, quantity) {
    if (typeof start === 'undefined'){
        return;
    }

    for (var i=start; i<start+(quantity || 1); i++){
        this._holdingRegisters[i] = true;
    }
};

ModbusMaster.prototype.addPollingInputRegisters = function(start, quantity) {
    if (typeof start === 'undefined'){
        return;
    }

    for (var i=start; i<start+(quantity || 1); i++){
        this._inputRegisters[i] = true;
    }
};

/**
 * Pack up the pdu and the handler function
 * and pipes both. Calls flush in the end.
 */
ModbusMaster.prototype._makeReadingRequest = function (fc, pdu, cb) {

    var req = { fc: fc, cb: cb, pdu: pdu };

    this._readingPipe.push(req);
};

ModbusMaster.prototype._makeWritingRequest = function (fc, pdu, cb) {

    var req = { fc: fc, cb: cb, pdu: pdu };

    this._writingPipe.push(req);
};

/**
 *  Many requests look like this so I made
 *  this an extra function.
 */
ModbusMaster.prototype._pduWithTwoParameter = function (fc, start, quantity) {
    return new Put()
        .word8(fc)
        .word16be(start)
        .word16be(quantity)
        .buffer();
};

module.exports = ModbusMaster;
