import { NextFunction, Request, Response } from 'express';
import { Errors } from '../utils/api.util';
import { getPayloadFromHeader, TokenType } from '../utils/auth.util';

/**
 * Handles user authentication
 *
 * @param tokenType the kind of to token should be check
 */
function authenticate(
    tokenType: TokenType = 'ACCESS') {

    return (req: Request, _: Response, next: NextFunction) => {
        const payload = getPayloadFromHeader(req, tokenType);
        if (!payload) {
            throw Errors.NO_SESSION;
        }

        return next();
    };
}

export default authenticate;