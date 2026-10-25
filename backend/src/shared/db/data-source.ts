import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "../../modules/users/user.entity";
import { VacationRequest } from "../../modules/vacation-requests/vacation-request.entity";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST ?? "localhost",
  port: Number(process.env.DB_PORT ?? 5432),
  username: process.env.DB_USER ?? "vacation",
  password: process.env.DB_PASSWORD ?? "vacation",
  database: process.env.DB_NAME ?? "vacation",
  entities: [User, VacationRequest],
  // Creates and updates tables from the entities. Convenient for this exercise;
  // a production system would use migrations instead (see README, known limitations).
  synchronize: true,
});

// Connects once and reuses the connection (a warm Lambda keeps it between calls).
export async function getDataSource(): Promise<DataSource> {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }
  return AppDataSource;
}
