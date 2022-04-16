import { authService } from '../services/auth.service';
import { Errors } from '../utils/api.util';

import type { NextFunction, Request, Response } from 'express';
import type { TokenType } from '../typings/auth';

/**
 * Handles user authentication
 *
 * @param tokenType the kind of to token should be check
 */
function authenticate(
    tokenType: TokenType = 'ACCESS') {

    return async (req: Request, _: Response, next: NextFunction) => {
        const payload = await authService.getPayloadFromHeader(req, tokenType);
        if (!payload) {
            throw Errors.NO_SESSION;
        }

        return next();
    };
}

export default authenticate;