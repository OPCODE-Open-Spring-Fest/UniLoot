import express, { Application } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import healthRoutes from './routes/healthRoutes';

const app: Application = express();


// Middleware setup
app.use(cors());
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


// API Routes
app.use('/api/health', healthRoutes);

export default app;