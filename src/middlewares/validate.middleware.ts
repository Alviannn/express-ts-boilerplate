import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { ResponseError } from '../utils/api.util';
import { ObjectSchema } from 'joi';

/**
 * Validates a request from client
 * within the middleware instead of from each controllers.
 *
 * @param schema the schema to be validated
 * @param isParams go for `true` to validate `params` property, or
 *          go `false` to validate `body` property
 *          within the {@link Request request}.
 */
function validate(schema: ObjectSchema, isParams = false) {
    return (req: Request, _: Response, next: NextFunction) => {

        const targetToValidate = (isParams ? req.params : req.body);
        const { value, error } = schema.validate(targetToValidate);

        if (error) {
            throw new ResponseError(error.message, StatusCodes.BAD_REQUEST);
        }

        if (isParams) {
            req.params = value;
        } else {
            req.body = value;
        }

        return next();
    };
}

export default validate;