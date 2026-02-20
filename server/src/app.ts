import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes';
import masterDataRoutes from './routes/masterDataRoutes';
import requestRoutes from './routes/requestRoutes';

const app = express();

const corsOptions = {
    origin: '*', // For demo. Change to your Vercel URL in production for security.
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
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
