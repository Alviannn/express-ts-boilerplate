import morgan from 'morgan';
import logger from '../utils/logger.util';

const LOGGING_FORMAT =
    '":method :url" :status - ' +
    ':response-time ms ":user-agent"';

const handleLogging = morgan(
    LOGGING_FORMAT,
    {
        stream: {
            write(str) {
                logger.info(str.trim());
            }
        }
    }
);

export default handleLogging;