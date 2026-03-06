import { Request, Response, NextFunction } from 'express';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack);

    const statusCode = err.status || 500;
    const message = err.message || 'Error interno del servidor';

    res.status(statusCode).json({
        status: 'error',
        message: message,
        code: `ERROR_${statusCode}`
    });
};
