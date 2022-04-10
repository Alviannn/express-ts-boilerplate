import bcrypt from 'bcrypt';
import authenticate from '../middlewares/authenticate.middleware';

import { validate } from '../middlewares/validate.middleware';
import { Request, Response } from 'express';
import { Controller, Route } from '../decorators/express.decorator';
import { User } from '../database/entities/user.entity';
import { RefreshToken } from '../database/entities/refresh-token.entity';
import { sendResponse, ResponseError } from '../utils/api.util';
import { StatusCodes } from 'http-status-codes';
import {
    generateToken,
    getPayloadFromHeader,
    getTokenFromHeader,
    hashPassword
} from '../utils/auth.util';
import {
    loginSchema, registerSchema,
    LoginType, RegisterType
} from '../validations/user.validations';

@Route({ path: 'auth' })
export class AuthRoute {

    @Controller('POST', '/login', validate(loginSchema))
    async login(req: Request, res: Response) {
        const body = req.body as LoginType;

        const foundUser = await User.findOneBy({ email: body.email });
        if (!foundUser) {
            throw new ResponseError(
                'Account is not registered!',
                StatusCodes.BAD_REQUEST);
        }

        const isPasswordValid = await bcrypt.compare(
            body.password,
            foundUser.password);

        if (!isPasswordValid) {
            throw new ResponseError(
                'Incorrect password',
                StatusCodes.BAD_REQUEST);
        }

        return sendResponse(res, {
            message: 'Successfully logged in as a user',
            data: {
                accessToken: generateToken(foundUser, 'ACCESS'),
                refreshToken: generateToken(foundUser, 'REFRESH')
            }
        });
    }

    @Controller('POST', '/register', validate(registerSchema))
    async register(req: Request, res: Response) {
        const body = req.body as RegisterType;
        const user = User.create({ ...body });

        const foundUser = await User.findOneBy({ email: user.email });
        if (foundUser) {
            throw new ResponseError(
                'This email is already registered',
                StatusCodes.BAD_REQUEST);
        }

        user.password = await hashPassword(user.password);
        await User.save(user);

        return sendResponse(res, {
            statusCode: StatusCodes.CREATED,
            message: 'Successfully registered new user'
        });
    }

    @Controller('POST', '/refresh', authenticate('REFRESH'))
    async refresh(req: Request, res: Response) {
        const userPayload = await getPayloadFromHeader(req, 'REFRESH');

        return sendResponse(res, {
            message: 'Successfully refreshed new token',
            data: {
                accessToken: generateToken(userPayload!, 'ACCESS')
            }
        });
    }

    @Controller('DELETE', '/logout', authenticate('REFRESH'))
    async logout(req: Request, res: Response) {
        const token = getTokenFromHeader(req)!;

        const foundToken = await RefreshToken.findOneBy({ token });
        await foundToken?.remove();

        return sendResponse(res, {
            statusCode: StatusCodes.ACCEPTED,
            message: 'Successfully logged out'
        });
    }

}