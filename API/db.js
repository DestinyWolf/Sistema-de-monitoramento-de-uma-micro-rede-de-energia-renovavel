const mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/meuBanco', 
    {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }
).then(
    () => {
        console.log('Conectado ao banco de dados');
    }
)
.catch(err => console.log('fail to connect, raise: ', err));

module.exports = mongoose;

