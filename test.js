var modbus = require('./src/modbustcpmaster');

// create a modbus client
var client = modbus.create(502, '127.0.0.1', function (err) {
    if (err) {
        console.log("!!!"+err);
//        exit(0);
    } else {
        console.log("!!!"+"connect ok");
    }
});

client.on('Data.Coil.2', function(val){
    console.log("Value of Coil2: "+val);
});

client.on('Data.HoldingRegister.2', function(val){
    console.log("Value of HoldingRegister2: "+val);
});


// make some calls
client.readInputRegisters(0, 10, function (resp, err) {
    console.log(resp);
    // resp will look like { fc: 4, byteCount: 20, register: [ values 0 - 10 ] }
});

client.readHoldingRegisters(0, 10, function (resp, err) {
    console.log(resp);
    // resp will look like { fc: 4, byteCount: 20, register: [ values 0 - 10 ] }
});

client.readCoils(0,8, function(resp, err){
    console.log(resp);
});

client.readDiscreteInputs(0,8, function(resp, err){
    console.log(resp);
});

client.writeSingleCoil(2, 0, function(resp, err) {
    console.log(resp);
});

client.writeSingleCoil(2, 1, function(resp, err) {
    console.log(resp);
});

client.writeSingleRegister(2,6, function(resp, err) {
    console.log(resp);
});

client.addPollingCoils(1, 10);
client.addPollingCoils(15, 2);
