import authenticate from '../../middlewares/authenticate.middleware';

import { Request, Response } from 'express';
import { Controller, ReqHandler } from '../../decorators/express.decorator';
import { sendResponse } from '../../utils/api.util';
import { userService } from '../../services/user.service';

@Controller({ path: 'users' })
export class UserRoute {

    @ReqHandler('GET', '/profile', authenticate())
    async profile(req: Request, res: Response) {
        const { userPayload } = req;
        const user = await userService.get(userPayload!.id);

        return sendResponse(res, {
            message: 'Successfully found user data',
            data: { user }
        });
    }

}