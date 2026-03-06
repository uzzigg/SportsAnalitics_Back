import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const API_KEY = process.env.FOOTBALL_DATA_API_KEY;
const BASE_URL = process.env.FOOTBALL_DATA_BASE_URL || 'https://v3.football.api-sports.io';

const apiClient = axios.create({
    baseURL: BASE_URL,
    headers: {
        'x-apisports-key': API_KEY,
    },
});

export const getPlayers = async (page: number = 1, league: number = 39, season: number = 2023) => {
    const response = await apiClient.get(`/players?league=${league}&season=${season}&page=${page}`);
    return response.data;
};

export const getPlayer = async (playerId: number | string, season: number = 2023) => {
    const response = await apiClient.get(`/players?id=${playerId}&season=${season}`);
    return response.data;
};
