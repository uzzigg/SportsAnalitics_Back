import cors from 'cors';

const corsOptions = {
    origin: '*', // En un entorno local dejamos *, en prod se restringe
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
};

export default cors(corsOptions);
