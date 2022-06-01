import { User } from '../database/entities/user.entity';
import { Errors } from '../utils/api.util';
import { orm } from '../database/orm-config';

class UserService {

    private readonly em = orm.em.fork();
    private readonly userRepo = this.em.getRepository(User);

    async get(id: number) {
        const user = await this.userRepo.findOne({ id });
        if (!user) {
            throw Errors.NO_SESSION;
        }

        return user;
    }

}

export const userService = new UserService();