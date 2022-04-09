import authenticate from '../middlewares/authenticate.middleware';

import { Request, Response } from 'express';
import { Controller, Route } from '../decorators/express.decorator';
import { User } from '../database/entities/user.entity';
import { sendResponse, Errors } from '../utils/api.util';
import { getPayloadFromHeader } from '../utils/auth.util';

@Route({ path: 'users' })
export class UserRoute {

    @Controller('GET', '/profile', authenticate())
    async profile(req: Request, res: Response) {
        const payload = await getPayloadFromHeader(req);

        const user = await User.findOneBy({ id: payload!.id });
        if (!user) {
            throw Errors.NO_SESSION;
        }

        return sendResponse(res, {
            message: 'Successfully found user data',
            data: {
                user: user.filter()
            }
        });
    }

}