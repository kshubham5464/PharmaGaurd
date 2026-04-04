import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'path';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes Placeholder
app.get('/', (req, res) => {
    res.send('PharmaGuard Backend Running');
});

// Import Routes
import patientRoutes from './routes/patientRoutes';
import uploadRoutes from './routes/uploadRoutes';

app.use('/api/patients', patientRoutes);
app.use('/api/upload', uploadRoutes);

export default app;
