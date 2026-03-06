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

export const getPlayers = async (page: number = 1, search: string = '') => {
    let url = `/players?page=${page}`;
    if (search && search.length >= 3) {
        url += `&search=${search}`;
    } else {
        url += `&league=39&season=2023`;
    }
    const response = await apiClient.get(url);
    return response.data;
};

export const getPlayer = async (playerId: number | string, season: number = 2023) => {
    const response = await apiClient.get(`/players?id=${playerId}&season=${season}`);
    return response.data;
};
