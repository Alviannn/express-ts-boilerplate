import { User } from './user.entity';
import { DateTime } from 'luxon';
import { dateTransformer } from '.';

import {
    Entity, BaseEntity,
    Column, JoinColumn, PrimaryGeneratedColumn,
    CreateDateColumn, UpdateDateColumn, DeleteDateColumn,
    ManyToOne
} from 'typeorm';

@Entity('todos')
export class Todo extends BaseEntity {

    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ name: 'user_id' })
    userId!: number;

    @ManyToOne(() => User, (user) => user.todoList)
    @JoinColumn({ name: 'user_id' })
    user!: User;

    @Column({ length: 512 })
    content!: string;

    @Column({ name: 'is_done', default: false })
    isDone!: boolean;

    @CreateDateColumn({ name: 'created_at', transformer: dateTransformer })
    createdAt!: DateTime;

    @UpdateDateColumn({ name: 'updated_at', transformer: dateTransformer })
    updatedAt?: DateTime;

    @DeleteDateColumn({ name: 'deleted_at', transformer: dateTransformer })
    deletedAt?: DateTime;

    toJSON() {
        const cloned = { ...this } as Record<string, unknown>;
        delete cloned.user;

        return cloned;
    }

}