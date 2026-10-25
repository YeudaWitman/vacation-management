import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Relation,
} from "typeorm";
import { User } from "../users/user.entity";

export type RequestStatus = "Pending" | "Approved" | "Rejected";

@Entity("vacation_requests")
export class VacationRequest {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => User, (user) => user.requests, { nullable: false })
  @JoinColumn({ name: "user_id" })
  user!: Relation<User>;

  @Column({ name: "user_id" })
  userId!: number;

  // "date" columns are returned as plain "YYYY-MM-DD" strings, which is what we want.
  @Column({ type: "date", name: "start_date" })
  startDate!: string;

  @Column({ type: "date", name: "end_date" })
  endDate!: string;

  @Column({ type: "text", nullable: true })
  reason!: string | null;

  @Column({ type: "enum", enum: ["Pending", "Approved", "Rejected"], default: "Pending" })
  status!: RequestStatus;

  // Rejection comment written by the validator.
  @Column({ type: "text", nullable: true })
  comments!: string | null;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;
}
