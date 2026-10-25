import { getDataSource } from "../../shared/db/data-source";
import { User } from "./user.entity";

// What the Validator's user dropdown needs, and nothing more: no email, no password hash.
export interface RequesterOption {
  id: number;
  name: string;
}

// Reading changes nothing, so this is a plain function: no command, no event.
// Only Requesters are listed, because only they have vacation requests to filter by.
// The list is not paginated: it feeds a dropdown, and a team is small. See README, known limitations.
export async function listRequesters(): Promise<RequesterOption[]> {
  const repo = (await getDataSource()).getRepository(User);
  return repo.find({
    select: { id: true, name: true },
    where: { role: "Requester" },
    order: { name: "ASC", id: "ASC" }, // id as tie-breaker, same idea as in the paged lists
  });
}
