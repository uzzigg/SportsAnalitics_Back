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

// In-Memory Cache to respect API-Football's 10 requests/minute limit
const cache: Record<string, { timestamp: number, data: any }> = {};
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

export const getPlayers = async (page: number = 1, search: string = '') => {
    let url = `/players?page=${page}`;
    if (search && search.length >= 3) {
        url += `&search=${search}`;
    } else {
        url += `&league=39&season=2023`;
    }

    // Serve from cache if available and not expired
    const cached = cache[url];
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        console.log(`[Cache Hit] ${url}`);
        return cached.data;
    }

    console.log(`[API Request] ${url}`);
    const response = await apiClient.get(url);

    // Only cache successful responses (avoid caching rate-limit errors)
    if (response.data && !response.data.errors?.rateLimit && Array.isArray(response.data.response) && response.data.response.length > 0) {
        cache[url] = { timestamp: Date.now(), data: response.data.response };
    }
    return response.data?.response || [];
};

export const getPlayer = async (playerId: number | string, season: number = 2023) => {
    const url = `/players?id=${playerId}&season=${season}`;

    const cached = cache[url];
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        console.log(`[Cache Hit] ${url}`);
        return cached.data;
    }

    console.log(`[API Request] ${url}`);
    const response = await apiClient.get(url);

    if (response.data && !response.data.errors?.rateLimit && Array.isArray(response.data.response) && response.data.response.length > 0) {
        cache[url] = { timestamp: Date.now(), data: response.data.response };
    }
    return response.data?.response || [];
};
