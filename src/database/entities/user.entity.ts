import { dateTransformer } from '.';
import { DateTime } from 'luxon';
import {
    BaseEntity, Entity,
    Column, PrimaryGeneratedColumn
} from 'typeorm';

@Entity('users')
export class User extends BaseEntity {

    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ name: 'full_name', length: 64 })
    fullName!: string;

    @Column({ length: 64 })
    email!: string;

    @Column({ length: 32 })
    phone!: string;

    @Column({ length: 64 })
    password!: string;

    @Column({
        name: 'created_at',
        type: 'timestamp',
        transformer: dateTransformer
    })
    createdAt = DateTime.utc();

    @Column({
        name: 'updated_at',
        type: 'timestamp',
        transformer: dateTransformer,
        nullable: true
    })
    updatedAt?: DateTime;

    filter() {
        const cloned = { ...this } as Record<string, unknown>;
        delete cloned.password;

        return cloned;
    }

}