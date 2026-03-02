import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes';
import masterDataRoutes from './routes/masterDataRoutes';
import requestRoutes from './routes/requestRoutes';

const app = express();

const corsOptions = {
    origin: [
        'https://quicklab-demo-pro.vercel.app',
        'http://localhost:5173'
    ],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', masterDataRoutes);
app.use('/api/requests', requestRoutes);

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date() });
});

export default app;
