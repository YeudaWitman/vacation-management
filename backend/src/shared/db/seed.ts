import "dotenv/config";
import bcrypt from "bcryptjs";
import { getDataSource, AppDataSource } from "./data-source";
import { User } from "../../modules/users/user.entity";
import { VacationRequest } from "../../modules/vacation-requests/vacation-request.entity";

const DEMO_PASSWORD = "Pass123!";

async function seed() {
  const ds = await getDataSource();
  const users = ds.getRepository(User);
  const requests = ds.getRepository(VacationRequest);

  const demoUsers = [
    { name: "Sarah Miller", email: "sarah.miller@demo.com", role: "Validator" as const },
    { name: "John Doe", email: "john.doe@demo.com", role: "Requester" as const },
    { name: "Jane Smith", email: "jane.smith@demo.com", role: "Requester" as const },
  ];

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  for (const demo of demoUsers) {
    const exists = await users.existsBy({ email: demo.email });
    if (!exists) {
      await users.save(users.create({ ...demo, password: passwordHash }));
      console.log(`created user ${demo.email}`);
    }
  }

  if ((await requests.count()) === 0) {
    const john = await users.findOneByOrFail({ email: "john.doe@demo.com" });
    const jane = await users.findOneByOrFail({ email: "jane.smith@demo.com" });
    await requests.save([
      requests.create({ userId: john.id, startDate: "2026-12-20", endDate: "2026-12-24", reason: "Family trip" }),
      requests.create({ userId: john.id, startDate: "2027-02-01", endDate: "2027-02-05", status: "Approved" }),
      requests.create({ userId: jane.id, startDate: "2026-12-28", endDate: "2027-01-02", reason: "New Year" }),
      requests.create({
        userId: jane.id,
        startDate: "2027-03-10",
        endDate: "2027-03-12",
        status: "Rejected",
        comments: "Team deadline that week",
      }),
    ]);
    console.log("created sample vacation requests");
  }

  console.log(`Seed done. Demo password for all users: ${DEMO_PASSWORD}`);
}

seed()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (AppDataSource.isInitialized) await AppDataSource.destroy();
  });
