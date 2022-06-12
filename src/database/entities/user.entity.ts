import { Todo } from './todo.entity';
import { DateTime } from 'luxon';
import { dateTransformer } from '.';

import {
    Entity, BaseEntity,
    Column, PrimaryGeneratedColumn,
    CreateDateColumn, UpdateDateColumn, DeleteDateColumn,
    OneToMany
} from 'typeorm';

@Entity('users')
export class User extends BaseEntity {

    @PrimaryGeneratedColumn()
    id!: number;

    @OneToMany(() => Todo, (todo) => todo.id)
    todoList!: Todo[];

    @Column({ name: 'full_name', length: 64 })
    fullName!: string;

    @Column({ length: 64 })
    email!: string;

    @Column({ length: 32 })
    phone!: string;

    @Column({ length: 64 })
    password!: string;

    @CreateDateColumn({ name: 'created_at', transformer: dateTransformer })
    createdAt!: DateTime;

    @UpdateDateColumn({ name: 'updated_at', transformer: dateTransformer })
    updatedAt?: DateTime;

    @DeleteDateColumn({ name: 'deleted_at', transformer: dateTransformer })
    deletedAt?: DateTime;

    toJSON() {
        const cloned = { ...this } as Record<string, unknown>;
        delete cloned.password;

        return cloned;
    }

}