const fs = require('fs/promises');
const axios = require('axios');
const express = require('express');

const app = express();
app.use(express.json());


async function digitaCEP(req, res) {
    const cep = req.params.cep;
    const cepConsulta = `${cep.substr(0, 5)}-${cep.substr(5, 3)}`
    const enderecosDB = JSON.parse(await fs.readFile('../enderecos.json'));
    const enderecoArquivo = enderecosDB.find(x => x.cep === cepConsulta);

    if (enderecoArquivo) {
        console.log('Encontrado no DB. Busca feita em:', new Date())
        return res.json(enderecoArquivo);
    } else {
        const responderCep = await axios.get(`https://viacep.com.br/ws/${cep}/json/`);

        if (responderCep.data && !responderCep.data.erro) {
            enderecosDB.push(responderCep.data);
            await fs.writeFile('../enderecos.json', JSON.stringify(enderecosDB, null, 2));
            console.log('Encontrado no Via Cep. Busca feita em:', new Date());
            res.json(responderCep.data);
        } else {
            res.status(404);
            res.json({ erro: 'Não encontrado nem no Via Cep' });
            console.log('Não encontrado nem no Via Cep. Busca feita em:', new Date());
        }
    }
}

async function digitaLOG(req, res) {
    const { uf, cidade, logradouro } = req.params;

    const enderecosDB = JSON.parse(await fs.readFile('../enderecos-log.json'));
    const enderecoArquivo = enderecosDB.find(x => x.logradouro.includes(logradouro));

    if (enderecoArquivo) {
        const catalogo = enderecosDB.filter(x => x.logradouro.includes(logradouro));
        console.log('Encontrado no DB. Busca feita em:', new Date())
        return res.json(catalogo);
    } else {
        const responderConsulta = await axios.get(`https://viacep.com.br/ws/${uf}/${cidade}/${logradouro}/json/`);
        const catalogoEnderecos = responderConsulta.data;

        if (responderConsulta.data && !responderConsulta.data.erro) {
            for (const endereco of catalogoEnderecos) {
                enderecosDB.push(endereco);
            }
            await fs.writeFile('../enderecos-log.json', JSON.stringify(enderecosDB, null, 2));
            console.log('Encontrado no Via Cep. Busca feita em:', new Date());
            res.json(catalogoEnderecos);
        } else {
            res.status(404);
            res.json({ erro: 'Não encontrado nem no Via Cep' });
            console.log('Não encontrado nem no Via Cep. Busca feita em:', new Date());
        }
    }
}

module.exports = { digitaCEP, digitaLOG }