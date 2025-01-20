import express from 'express';
const mongoose = require('./db');
const Data = require('./dataModel');
const cors = require('cors');
const later = require('later')
const dateETime = require('date-and-time');

const app = express();

app.use(express.json());
app.use(cors());


const updateDate = (original, days) => {
    const date = new Date(original);
    date.setDate(original.getDay() + days);

    var str = dateETime.format(date, 'DD/MM/YYYY HH:mm:ss').split(' ')
    return str[0];

}


//insere dados no banco de dados
app.get('/insert',( req, res) => {
    const data = new Data({
        data:req.query.data, 
        tempo:req.query.hora, 
        _id:`${req.query.data}|${req.query.hora}`,
        hora: req.query.hora.split(':')[0],
        dia: req.query.data.split('/')[0],
        mes: req.query.data.split('/')[1],
        ano: req.query.data.split('/')[2],
        tempA: parseFloat(req.query.tempA),
        tempB: parseFloat(req.query.tempB),
        tensao: parseFloat(req.query.tensao),
        corrente: parseFloat(req.query.corrente),
        potencia: parseFloat(req.query.potencia),
        energia: parseFloat(req.query.energia),
    });
    data.save().then(data => res.status(201).json(data))
    .catch(err => res.status(400).json({erro: err.message}))
})

//retorna todos os dados do banco de dados
app.get('/data', (req, res) => {
    Data.find().then(data => res.status(200).json(data))
    .catch(err => res.status(500).json({erro: err.message}))
})


//retorna dados de um periodo de dias especifico
app.get('/data/date', (req, res) => {
    var startTime, endTime;
    var dataBeforeFilter;
    var dataAfterFilter = []
    start = req.query.start.split('/');
    end = req.query.end.split('/');

    dataBeforeFilter = Data.find({mes:startTime[1], ano:startTime[2]}).then(data => {return data}).catch(
        err => res.status(500).json({erro: err.message})
    )

    //pega todos os dados dos dias posteriores a startTime[0]
    dataAfterFilter.push(dataBeforeFilter.map(i => 
        {return (parseInt(i.dia) >= parseInt(startTime[0])) & i}
    ))

    dataBeforeFilter = Data.find({mes:endTime[1], ano:endTime[2]}).then(data => {return data}).catch(
        err => res.status(500).json({erro: err.message})
    )

    //pega todos os dados dos dias anteriores a endTime[0}
    dataAfterFilter.push(dataBeforeFilter.map(i => 
        {return (parseInt(i.dia) <= parseInt(endTime[0])) & i}
    ))

    res.status(200).json(dataAfterFilter)
    .catch(err => res.status(500).json({erro: err.message}))
})

app.get('/data/day' , (req, res) => {
    Data.find({dia: req.query.dia}).then(data => res.status(200).json(data))
    .catch(err => res.status(500).json({erro: err.message})) 
})

app.get('/data/month', (req, res) => {
    var startData = req.query.dataStart;
    var endData = req.query.dataFinish;
    var data;
    var dataToReturn = []

    dataToReturn.push(Data.find({data:startData}).then(data => {return data}).catch(
        err => res.status(500).json({erro: err.message})
    ))
    
    


})