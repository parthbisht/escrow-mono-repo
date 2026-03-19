import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'escrows' })
export class EscrowEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  escrowId!: string;

  @Column()
  buyer!: string;

  @Column()
  seller!: string;

  @Column()
  arbitrator!: string;

  @Column({ type: 'numeric', precision: 30, scale: 0 })
  amount!: string;

  @Column()
  state!: string;

  @Column()
  metadata!: string;

  @Column({ type: 'timestamptz' })
  deliveryDeadline!: Date;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;
}
