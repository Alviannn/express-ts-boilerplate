import logger from '../utils/logger.util';

import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import {
    ResponseError,
    sendResponse, Errors
} from '../utils/api.util';

function errorHandling(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    err: Error, req: Request, res: Response, _: NextFunction) {

    let error;
    if (err.name === ResponseError.name) {
        error = err as ResponseError;
    } else {
        error = Errors.SERVER;
        error.stack = err.stack;
    }

    if (error.statusCode === StatusCodes.INTERNAL_SERVER_ERROR) {
        logger.error(`${error}\n${error.stack}`);
    }

    return sendResponse(res, ResponseError.toResponseBody(error));
}

export default errorHandling;