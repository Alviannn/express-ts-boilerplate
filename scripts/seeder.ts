// * max-len isn't needed here
// * This script is very dependant on the project files

/* eslint-disable max-len */

import logger from '../src/utils/logger.util';

import { appDataSource } from '../src/database/datasource';
import { authService } from '../src/services/auth.service';
import { User } from '../src/database/entities/user.entity';
import { Todo } from '../src/database/entities/todo.entity';
import { DateTime } from 'luxon';

// -------------------------------------------------------------------- //

const DEFAULT_PHONE = '628174991828';

async function createData() {
    const users: User[] = [
        User.create({
            fullName: 'John Doe',
            email: 'john_doe@example.com',
            phone: DEFAULT_PHONE,
            password: await authService.hashPassword('JohnDoe123?')
        }),
        User.create({
            fullName: 'Alvian',
            email: 'alvian@example.com',
            phone: DEFAULT_PHONE,
            password: await authService.hashPassword('Alvian123?')
        })
    ];

    const todos: Todo[] = [
        Todo.create({
            content: 'Play VALORANT tonight'
        }),
        Todo.create({
            content: 'Do android mobile homework',
            updatedAt: DateTime.utc().minus({ days: 2, hours: 6 }),
            createdAt: DateTime.utc().minus({ days: 3 })
        })
    ];

    return { users, todos };
}

// -------------------------------------------------------------------- //

appDataSource.initialize()
    .then(async () => {
        const { users, todos } = await createData();

        await User.save(users);
        await Todo.save(todos);

        logger.debug('Data seeding has finished!');
        process.exit();
    })
    .catch((err: Error) => logger.error(`${err} ${err.stack}`));