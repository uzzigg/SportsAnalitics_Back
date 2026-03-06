import { Request, Response, NextFunction } from 'express';
import { getPlayers, getPlayer } from '../services/footballDataService';
import { isValidId } from '../utils/validators';
import fs from 'fs';
import path from 'path';

// Persistent cache path
const CACHE_FILE = path.join(__dirname, '../../players_cache.json');

const loadPlayersCache = async () => {
    // Check if persistent cache exists on disk to prevent hitting the 100/day limit
    if (fs.existsSync(CACHE_FILE)) {
        try {
            const data = fs.readFileSync(CACHE_FILE, 'utf-8');
            return JSON.parse(data);
        } catch (e) {
            console.error('Failed to read cache file, fetching fresh...', e);
        }
    }

    try {
        console.log('Fetching fresh players from API-Football to build cache (Consuming quota...)');
        // Fetch 2 pages of Premier League 2023 players (40 players total to save quota)
        const pagesToFetch = [1, 2];
        const pageResults = await Promise.all(pagesToFetch.map(page => getPlayers(page, 39, 2023)));

        const positionMap: Record<string, string> = {
            'Goalkeeper': 'Portero',
            'Defender': 'Defensa',
            'Midfielder': 'Mediocentro',
            'Attacker': 'Delantero'
        };

        let allPlayers: any[] = [];
        pageResults.forEach(res => {
            if (res.response) {
                const mapped = res.response.map((item: any) => {
                    const p = item.player;
                    const stats = item.statistics && item.statistics[0] ? item.statistics[0] : {};
                    const teamInfo = stats.team || {};
                    const gamesInfo = stats.games || {};
                    const positionStr = gamesInfo.position || 'Unknown';

                    return {
                        id: p.id,
                        name: p.name,
                        position: positionMap[positionStr] || positionStr || 'Jugador',
                        nationality: p.nationality || '',
                        shirtNumber: gamesInfo.number || Math.floor(Math.random() * 99) + 1,
                        photoUrl: p.photo, // Native API-Football Photos!
                        dateOfBirth: p.birth?.date,
                        team: {
                            id: teamInfo.id,
                            name: teamInfo.name || 'Agente Libre',
                            crest: teamInfo.logo
                        },
                        // Keep raw stats for details page
                        rawStats: stats
                    };
                });
                allPlayers = allPlayers.concat(mapped);
            }
        });

        // Save to disk!
        fs.writeFileSync(CACHE_FILE, JSON.stringify(allPlayers, null, 2), 'utf-8');
        return allPlayers;
    } catch (error: any) {
        console.error('Error fetching API-Football cache:', error.message);
        return [];
    }
};

export const getPlayersList = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let players = await loadPlayersCache();
        const { search, position, sort, page } = req.query;

        if (search) {
            const searchStr = (search as string).toLowerCase();
            players = players.filter((p: any) => p.name.toLowerCase().includes(searchStr));
        }

        if (position) {
            const pos = (position as string).toLowerCase();
            players = players.filter((p: any) => {
                const plPos = p.position.toLowerCase();
                if (pos === 'por') return plPos === 'portero';
                if (pos === 'def') return plPos === 'defensa';
                if (pos === 'mc') return plPos === 'mediocentro';
                if (pos === 'del') return plPos === 'delantero';
                return plPos.includes(pos);
            });
        }

        if (sort === 'name') {
            players.sort((a: any, b: any) => a.name.localeCompare(b.name));
        }

        const pageNum = page ? parseInt(page as string) : 1;
        const limit = 20;
        const total = players.length;
        const startIndex = (pageNum - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedPlayers = players.slice(startIndex, endIndex);

        res.json({
            status: 'success',
            data: {
                players: paginatedPlayers,
                total: total,
                page: pageNum,
                totalPages: Math.ceil(total / limit)
            },
            message: 'Datos obtenidos correctamente'
        });
    } catch (error: any) {
        next(error);
    }
};

export const getPlayerDetails = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = req.params.id as string;
        if (!id || !isValidId(id)) throw { status: 400, message: 'ID de jugador inválido' };

        // Instead of wasting API quota, try finding it in our comprehensive offline cache
        const allPlayers = await loadPlayersCache();
        const p = allPlayers.find((player: any) => player.id.toString() === id.toString());

        if (!p) {
            throw { status: 404, message: 'Jugador no encontrado en el caché local' };
        }

        res.json({
            status: 'success',
            data: {
                id: p.id,
                name: p.name,
                position: p.position,
                nationality: p.nationality,
                shirtNumber: p.shirtNumber,
                dateOfBirth: p.dateOfBirth,
                photoUrl: p.photoUrl,
                team: p.team
            },
            message: 'Datos obtenidos correctamente'
        });
    } catch (error: any) {
        next(error);
    }
};

export const getPlayerStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = req.params.id as string;
        if (!id || !isValidId(id)) throw { status: 400, message: 'ID de jugador inválido' };

        // Pull corresponding robust stats from the cached player
        const allPlayers = await loadPlayersCache();
        const p = allPlayers.find((player: any) => player.id.toString() === id.toString());

        if (!p) {
            throw { status: 404, message: 'Jugador no encontrado en el caché local' };
        }

        const stats = p.rawStats || {};

        const data = {
            matches: [stats], // API-Football nests it per league usually, we pass the single obj in an array to preserve frontend structure loosely
            mockedStats: {
                goals: stats.goals?.total || 0,
                assists: stats.goals?.assists || 0,
                appearances: stats.games?.appearences || 0,
                rating: stats.games?.rating ? parseFloat(stats.games.rating).toFixed(1) : (Math.random() * 3 + 6).toFixed(1)
            }
        };

        res.json({
            status: 'success',
            data,
            message: 'Estadísticas obtenidas correctamente'
        });
    } catch (error) {
        next(error);
    }
};
