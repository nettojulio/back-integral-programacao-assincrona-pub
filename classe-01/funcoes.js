const axios = require('axios');

async function search (req, res) {
    const offset = req.query.offset;
    const limit = req.query.limit;

    const pokeList = await axios.get(`https://pokeapi.co/api/v2/pokemon/?offset=${offset}&limit=${limit}`);

    if (pokeList.data.results.length === 0) {
        res.json('NO RESULTS');
        console.log('NOT FOUND');
        return
    }

    res.json(pokeList.data.results);
    console.log('FOUND');
};

async function searchId (req, res) {
    const search = req.params.idOuNome;

    const pokeSearch = await axios.get(`https://pokeapi.co/api/v2/pokemon/${search}/`).catch((err) => {
        res.json(err.message);
        console.log('NOT FOUND');
    });

    if (!pokeSearch) return;

    const { id, name, height, weight, base_experience, forms, abilities, species } = pokeSearch.data;

    res.json({ id, name, height, weight, base_experience, forms, abilities, species });
    console.log('FOUND');
};

module.exports = { search, searchId }