import { Router } from 'express';
import { getPlayersList, getPlayerDetails, getPlayerStats } from '../controllers/playerController';

const router = Router();

router.get('/', getPlayersList);
router.get('/:id', getPlayerDetails);
router.get('/:id/stats', getPlayerStats);

export default router;
