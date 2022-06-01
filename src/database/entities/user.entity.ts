import { DateTime } from 'luxon';
import { Todo } from './todo.entity';

import {
    BaseEntity, Entity,
    PrimaryKey, Property,
    OneToMany,
    Collection,
} from '@mikro-orm/core';

@Entity({ tableName: 'users' })
export class User extends BaseEntity<User, 'id'> {

    @PrimaryKey()
    id!: number;

    @OneToMany(() => Todo, (todo) => todo.user)
    todoList = new Collection<Todo>(this);

    @Property({ length: 64 })
    fullName!: string;

    @Property({ length: 64 })
    email!: string;

    @Property({ length: 64 })
    phone!: string;

    @Property({ length: 64, hidden: true })
    password!: string;

    @Property({ columnType: 'timestamp', defaultRaw: 'now()' })
    createdAt!: DateTime;

    @Property({ columnType: 'timestamp', nullable: true })
    updatedAt?: DateTime;

}