import { NextFunction, Request, Response } from 'express';
import { authService } from '../services/auth.service';
import { TokenType } from '../typings/auth';
import { Errors } from '../utils/api.util';

/**
 * Handles user authentication
 *
 * @param tokenType the kind of to token should be check
 */
function authenticate(
    tokenType: TokenType = 'ACCESS') {

    return (req: Request, _: Response, next: NextFunction) => {
        const payload = authService.getPayloadFromHeader(req, tokenType);
        if (!payload) {
            throw Errors.NO_SESSION;
        }

        return next();
    };
}

export default authenticate;