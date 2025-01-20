const mongoose = require('mongoose');

const dataSchema = new mongoose.Schema({
    _id: {type: string, require: true},
    data: {type: string, require: true},
    tempo: {type: string, require: true},
    tempA: {type: mongoose.SchemaTypes.Mixed, require: true},
    tempB: {type: mongoose.SchemaTypes.Mixed, require: true},
    tensao: {type: mongoose.SchemaTypes.Mixed, require: true},
    corrente: {type: mongoose.SchemaTypes.Mixed, require: true},
    potencia: {type: mongoose.SchemaTypes.Int32, require: true},
    energia: {type: mongoose.SchemaTypes.Mixed, require: true},
    hora: {type: string, require: true},
    dia: {type: string, require: true},
    mes: {type: string, require: true},
    ano: {type: string, require: true}
})

const Data = mongoose.model('data', dataSchema);
module.exports = Data;
