import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from "typeorm";
import { VacationRequest } from "../vacation-requests/vacation-request.entity";

export type UserRole = "Requester" | "Validator";

@Entity("users")
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column({ unique: true })
  email!: string;

  // select: false means the hash is never returned by normal queries.
  // The login code asks for it explicitly.
  @Column({ select: false })
  password!: string;

  @Column({ type: "enum", enum: ["Requester", "Validator"], default: "Requester" })
  role!: UserRole;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @OneToMany(() => VacationRequest, (request) => request.user)
  requests!: VacationRequest[];
}
