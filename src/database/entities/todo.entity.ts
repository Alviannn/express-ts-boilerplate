import { DateTime } from 'luxon';
import { User } from './user.entity';

import {
    BaseEntity, Entity,
    PrimaryKey, Property,
    ManyToOne
} from '@mikro-orm/core';

@Entity({ tableName: 'todos' })
export class Todo extends BaseEntity<Todo, 'id'> {

    @PrimaryKey()
    id!: number;

    @ManyToOne()
    user!: User;

    @Property({ length: 512 })
    content!: string;

    @Property({ name: 'is_done', default: false })
    isDone!: boolean;

    @Property({ columnType: 'timestamp', defaultRaw: 'now()' })
    createdAt!: DateTime;

    @Property({ columnType: 'timestamp', nullable: true })
    updatedAt?: DateTime;

}