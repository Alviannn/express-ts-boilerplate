import { BaseEntity, Column, Entity } from 'typeorm';
import { DateTime } from 'luxon';
import { dateTransformer } from '.';

@Entity('refresh_tokens')
export class RefreshToken extends BaseEntity {

    @Column({ unique: true })
    token!: string;

    @Column({
        name: 'created_at',
        type: 'timestamp',
        transformer: dateTransformer
    })
    createdAt = DateTime.utc();

}