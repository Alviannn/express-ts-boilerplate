import authenticate from '../middlewares/authenticate.middleware';

import { validate } from '../middlewares/validate.middleware';
import { Request, Response } from 'express';
import { Controller, Route } from '../decorators/express.decorator';
import { sendResponse } from '../utils/api.util';
import { StatusCodes } from 'http-status-codes';
import { authService } from '../services/auth.service';
import {
    generateToken,
    getPayloadFromHeader,
    getTokenFromHeader,
} from '../utils/auth.util';
import {
    loginSchema, registerSchema,
    LoginType, RegisterType
} from '../validations/user.validation';

@Route({ path: 'auth' })
export class AuthRoute {

    @Controller('POST', '/login', validate(loginSchema))
    async login(req: Request, res: Response) {
        const body = req.body as LoginType;
        const tokens = await authService.login(body);

        return sendResponse(res, {
            message: 'Successfully logged in as a user',
            data: { ...tokens }
        });
    }

    @Controller('POST', '/register', validate(registerSchema))
    async register(req: Request, res: Response) {
        const body = req.body as RegisterType;
        await authService.register(body);

        return sendResponse(res, {
            statusCode: StatusCodes.CREATED,
            message: 'Successfully registered new user'
        });
    }

    @Controller('POST', '/refresh', authenticate('REFRESH'))
    async refresh(req: Request, res: Response) {
        const userPayload = await getPayloadFromHeader(req, 'REFRESH');
        const accessToken = generateToken(userPayload!, 'ACCESS');

        return sendResponse(res, {
            message: 'Successfully refreshed new token',
            data: { accessToken }
        });
    }

    @Controller('DELETE', '/logout', authenticate('REFRESH'))
    async logout(req: Request, res: Response) {
        const token = getTokenFromHeader(req)!;
        await authService.logout(token);

        return sendResponse(res, {
            statusCode: StatusCodes.ACCEPTED,
            message: 'Successfully logged out'
        });
    }

}