import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import config from '../configs/config';

import { orm } from '../database/orm-config';
import { StatusCodes } from 'http-status-codes';
import { RefreshToken } from '../database/entities/refresh-token.entity';
import { User } from '../database/entities/user.entity';
import { REFRESH_TOKEN_COOKIE, ResponseError } from '../utils/api.util';

import type { JwtPayload } from 'jsonwebtoken';
import type { UserPayload, TokenType, AuthTokens } from '../typings/auth';
import type { LoginType, RegisterType } from '../validations/user.validation';
import type { Request } from 'express';

class AuthService {

    private readonly em = orm.em.fork();
    private readonly userRepo = this.em.getRepository(User);
    private readonly refreshRepo = this.em.getRepository(RefreshToken);

    async login({ email, password }: LoginType): Promise<AuthTokens> {
        const foundUser = await this.userRepo.findOne({ email });

        if (!foundUser) {
            throw new ResponseError(
                'Account is not registered!',
                StatusCodes.BAD_REQUEST);
        }

        const isPasswordValid = await bcrypt.compare(
            password,
            foundUser.password);

        if (!isPasswordValid) {
            throw new ResponseError(
                'Incorrect password',
                StatusCodes.BAD_REQUEST);
        }

        const accessToken = await this.generateToken(foundUser, 'ACCESS');
        const refreshToken = await this.generateToken(foundUser, 'REFRESH');

        return { accessToken, refreshToken };
    }

    async register(rawUser: RegisterType) {
        const user = new User().assign(rawUser);

        const foundUser = await this.userRepo.findOne({ email: user.email });
        if (foundUser) {
            throw new ResponseError(
                'This email is already registered',
                StatusCodes.BAD_REQUEST);
        }

        user.password = await this.hashPassword(user.password);
        await this.userRepo.persistAndFlush(user);
    }

    async logout(refreshToken: string) {
        const foundToken = await this.refreshRepo
            .findOne({ token: refreshToken });

        if (foundToken) {
            this.refreshRepo.removeAndFlush(foundToken);
        }
    }

    async hashPassword(password: string) {
        return bcrypt.hash(password, config.hashRounds);
    }

    async generateToken(user: User | UserPayload, tokenType: TokenType) {
        let tokenSecret: string;

        const signOption: jwt.SignOptions = { notBefore: config.jwt.notBefore };
        const payload: UserPayload = { id: user.id };

        if (tokenType === 'ACCESS') {
            tokenSecret = config.jwt.accessSecret;
            signOption.expiresIn = config.jwt.accessExpire;
        } else {
            tokenSecret = config.jwt.refreshSecret;
            signOption.expiresIn = config.jwt.refreshExpire;
        }

        const token = jwt.sign(payload, tokenSecret, signOption);
        if (tokenType === 'REFRESH') {
            const newToken = new RefreshToken()
                .assign({ token });

            await this.refreshRepo.persistAndFlush(newToken);
        }

        return token;
    }

    /**
     * Extracts a JWT token from the request.
     *
     * Depending on the {@link TokenType}, the method of retrieving the
     * token differs since the `refreshToken` uses httpOnly cookies and
     * the `accessToken` uses the 'Bearer' authorization header.
     *
     * NOTE: This function **doesn't verify the JWT token**.
     */
    getTokenFromRequest(req: Request, type: TokenType) {
        let token: string;

        if (type === 'ACCESS') {
            const rawToken = req.header('authorization');
            const prefix = 'Bearer ';

            if (!rawToken || !rawToken.startsWith(prefix)) {
                return;
            }

            token = rawToken.replace(prefix, '');
        } else {
            token = req.cookies[REFRESH_TOKEN_COOKIE];
        }

        return token;
    }

    /**
     * Extracts a user data (payload) from a JWT token.
     * Before it extracts the payload, it'll verify the token first.
     *
     * @see {@link getTokenFromRequest}
     * @see `authenticate` middleware
     */
    async getPayloadFromRequest(
        req: Request, tokenType: TokenType = 'ACCESS') {

        const token = this.getTokenFromRequest(req, tokenType);
        if (!token) {
            return;
        }

        let secret: string;
        switch (tokenType) {
            case 'ACCESS':
                secret = config.jwt.accessSecret;
                break;
            case 'REFRESH':
                secret = config.jwt.refreshSecret;
                break;
        }

        if (tokenType === 'REFRESH' && !this.refreshRepo.findOne({ token })) {
            return;
        }

        try {
            const payload = jwt.verify(token, secret) as JwtPayload;
            return { id: payload.id } as UserPayload;
        } catch (err) {
            // token is invalid, so returning `undefined` instead
        }
    }

}

export const authService = new AuthService();