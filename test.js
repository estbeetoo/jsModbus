var modbus = require('./src/ModbusTCPMaster');

// create a modbus client
var client = modbus.create(502, '127.0.0.1', function (err) {
    if (err) {
        console.log("!!!"+err);
//        exit(0);
    } else {
        console.log("!!!"+"connect ok");
    }
});


// make some calls
client.readInputRegister(0, 10, function (resp, err) {
    console.log(resp);
    // resp will look like { fc: 4, byteCount: 20, register: [ values 0 - 10 ] }
});

client.readCoils(0,10, function(resp, err){
    console.log(resp);
});

client.writeSingleCoil(1,1, function(resp, err) {
    console.log(resp);
});

client.writeSingleRegister(2,6, function(resp, err) {
    console.log(resp);
});