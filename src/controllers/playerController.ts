import { Request, Response, NextFunction } from 'express';
import { getPlayers, getPlayer } from '../services/footballDataService.js';
import { isValidId } from '../utils/validators.js';

const positionMap: Record<string, string> = {
    'Goalkeeper': 'Portero',
    'Defender': 'Defensa',
    'Midfielder': 'Mediocentro',
    'Attacker': 'Delantero'
};

const mapPlayer = (item: any) => {
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
        rawStats: stats
    };
};

export const getPlayersList = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const pageStr = req.query.page as string;
        const pageNum = pageStr ? parseInt(pageStr) : 1;

        const { search, position } = req.query;
        const searchStr = search ? (search as string).toLowerCase() : '';

        // Fetch live from the API instead of offline cache. 
        // We pass the search term directly to API-Football!
        const apiRes = await getPlayers(pageNum, searchStr);

        let mappedPlayers: any[] = [];
        if (apiRes.response) {
            mappedPlayers = apiRes.response.map(mapPlayer);
        }

        // Apply local filtering for position as the API doesn't always support granular position filtering natively
        let finalPlayers = mappedPlayers;

        if (position) {
            const pos = (position as string).toLowerCase();
            finalPlayers = finalPlayers.filter((p: any) => {
                const plPos = p.position.toLowerCase();
                if (pos === 'por') return plPos === 'portero';
                if (pos === 'def') return plPos === 'defensa';
                if (pos === 'mc') return plPos === 'mediocentro';
                if (pos === 'del') return plPos === 'delantero';
                return plPos.includes(pos);
            });
        }

        res.json({
            status: 'success',
            data: {
                players: finalPlayers,
                total: apiRes.paging ? apiRes.paging.total * 20 : finalPlayers.length,
                page: apiRes.paging ? apiRes.paging.current : pageNum,
                totalPages: apiRes.paging ? apiRes.paging.total : 1
            },
            message: 'Datos obtenidos correctamente de la API'
        });
    } catch (error: any) {
        next(error);
    }
};

export const getPlayerDetails = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = req.params.id as string;
        if (!id || !isValidId(id)) throw { status: 400, message: 'ID de jugador inválido' };

        const apiRes = await getPlayer(id);
        if (!apiRes.response || apiRes.response.length === 0) {
            throw { status: 404, message: 'Jugador no encontrado' };
        }

        const p = mapPlayer(apiRes.response[0]);

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

        const apiRes = await getPlayer(id);
        if (!apiRes.response || apiRes.response.length === 0) {
            throw { status: 404, message: 'Jugador no encontrado' };
        }

        const p = mapPlayer(apiRes.response[0]);
        const stats = p.rawStats || {};

        const data = {
            matches: [stats], // Keep nested structure inside array
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
