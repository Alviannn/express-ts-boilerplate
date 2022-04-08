import { DateTime } from 'luxon';
import { dateTransformer } from '.';
import {
    BaseEntity, Entity,
    Column, PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('todos')
export class Todo extends BaseEntity {

    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ length: 512 })
    content!: string;

    @Column({
        name: 'created_at',
        type: 'timestamp',
        default: DateTime.utc(),
        transformer: dateTransformer
    })
    createdAt!: DateTime;

    @Column({ name: 'updated_at', type: 'timestamp', nullable: true })
    updatedAt?: DateTime;

    @Column({ name: 'is_done', default: false })
    isDone!: boolean;

}