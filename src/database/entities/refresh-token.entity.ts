import { TrackingEmbed } from './embedded/tracking.embed';

import {
    Entity, BaseEntity,
    PrimaryColumn, Column
} from 'typeorm';

@Entity('refresh_tokens')
export class RefreshToken extends BaseEntity {

    @PrimaryColumn()
    token!: string;

    @Column(() => TrackingEmbed, { prefix: false })
    track!: TrackingEmbed;

}