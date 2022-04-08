import cors from 'cors';
import helmet from 'helmet';
import express from 'express';
import handleLogging from './middlewares/logger.middleware';
import config from './configs/config';

const app = express();

// global middlewares
app.use(helmet());
app.use(cors(config.cors));
app.use(express.json());
app.use(handleLogging);

export default app;