import { StatusCodes } from 'http-status-codes';
import { ResponseError } from './api.util';

import type { Request } from 'express';
import type { ObjectSchema } from 'joi';

type ValidationType = 'params' | 'query' | 'body';

export function validate<T>(
    req: Request,
    schema: ObjectSchema<T>,
    type: ValidationType = 'body') {

    const content = req[type];
    const { value, error } = schema.validate(content);

    if (error) {
        throw new ResponseError(error.message, StatusCodes.BAD_REQUEST);
    }

    return value;
}