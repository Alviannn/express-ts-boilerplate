import app from './app';
import errorHandling from './middlewares/error-handler.middleware';
import logger from './utils/logger.util';

import { appDataSource } from './database/datasource';
import { createGlobalRouter } from './routes';

const port = process.env.PORT ?? 5000;

app.listen(port, async () => {
    const globalRouter = await createGlobalRouter();

    app.use('/', globalRouter);
    app.use(errorHandling);

    await appDataSource.initialize();

    console.log();
    logger.info(`Server is hosted at http://localhost:${port}/`);
});