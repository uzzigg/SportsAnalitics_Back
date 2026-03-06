const axios = require('axios');
require('dotenv').config();

const API_KEY = process.env.FOOTBALL_DATA_API_KEY;
const BASE_URL = process.env.FOOTBALL_DATA_BASE_URL || 'https://api.football-data.org/v4';

const apiClient = axios.create({
    baseURL: BASE_URL,
    headers: {
        'X-Auth-Token': API_KEY,
    },
});

async function run() {
    try {
        console.log('Fetching', BASE_URL + '/players/');
        const res = await apiClient.get('/players/');
        console.log('Success!', res.data.count, 'players');
    } catch (e) {
        console.error('Error fetching API:', e.message);
        if (e.response) {
            console.error('Status:', e.response.status);
            console.error('Data:', JSON.stringify(e.response.data));
        } else {
            console.error('No response object. Code:', e.code);
        }
    }
}

run();
