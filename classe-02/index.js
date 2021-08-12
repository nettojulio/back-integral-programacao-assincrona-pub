const fs = require('fs/promises');
const express = require('express');
const axios = require('axios');

const app = express();
app.use(express.json());

app.get('/enderecos/:cep', async (req, res) => {
    const cep = req.params.cep;
    const cepConsulta = `${cep.substr(0, 5)}-${cep.substr(5, 3)}`
    const enderecos = JSON.parse(await fs.readFile('enderecos.json'));
    const enderecoArquivo = enderecos.find(x => x.cep === cepConsulta);

    if (enderecoArquivo) {
        console.log('Encontrado no DB. Busca feita em:', new Date())
        return res.json(enderecoArquivo);
    } else {
        const responderCep = await axios.get(`https://viacep.com.br/ws/${cep}/json/`);

        if (responderCep.data && !responderCep.data.erro) {
            enderecos.push(responderCep.data);
            await fs.writeFile('enderecos.json', JSON.stringify(enderecos, null, 2));
            console.log('Encontrado no Via Cep. Busca feita em:', new Date());
            res.json(responderCep.data);
        } else {
            res.status(404);
            res.json({ erro: 'Não encontrado nem no Via Cep' });
            console.log('Não encontrado nem no Via Cep. Busca feita em:', new Date());
        }
    }
});

app.get('/enderecos/:uf/:cidade/:logradouro', async (req, res) => {
    const { uf, cidade, logradouro } = req.params;

    const enderecos = JSON.parse(await fs.readFile('enderecos-log.json'));
    const enderecoArquivo = enderecos.find(x => x.logradouro.includes(logradouro));

    if (enderecoArquivo) {
        const catalog = enderecos.filter(x => x.logradouro.includes(logradouro));
        console.log('Encontrado no DB. Busca feita em:', new Date())
        return res.json(catalog);
    } else {
        const responderConsulta = await axios.get(`https://viacep.com.br/ws/${uf}/${cidade}/${logradouro}/json/`);
        const rcOK = responderConsulta.data;

        if (responderConsulta.data && !responderConsulta.data.erro) {
            for (const endereco of rcOK) {
                enderecos.push(endereco);
            }
            await fs.writeFile('enderecos-log.json', JSON.stringify(enderecos, null, 2));
            console.log('Encontrado no Via Cep. Busca feita em:', new Date());
            res.json(rcOK);
        } else {
            res.status(404);
            res.json({ erro: 'Não encontrado nem no Via Cep' });
            console.log('Não encontrado nem no Via Cep. Busca feita em:', new Date());
        }
    }
});


app.listen(8000);