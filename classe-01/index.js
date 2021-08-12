const express = require('express');
const {search, searchId} = require('./funcoes');

const app = express();

app.get('/pokemon', search);
app.get('/pokemon/:idOuNome', searchId);

app.listen(8000);