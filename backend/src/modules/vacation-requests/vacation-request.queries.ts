import { getDataSource } from "../../shared/db/data-source";
import { VacationRequest } from "./vacation-request.entity";

export interface Page<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

// Reading changes nothing, so there is no command or event here: a plain function.
export async function listRequestsOfUser(
  userId: number,
  page: number,
  limit: number
): Promise<Page<VacationRequest>> {
  const repo = (await getDataSource()).getRepository(VacationRequest);
  const [items, total] = await repo.findAndCount({
    where: { userId },
    // A stable order (newest first, id as tie-breaker) so pages never overlap or skip rows.
    order: { createdAt: "DESC", id: "DESC" },
    skip: (page - 1) * limit,
    take: limit,
  });
  return { items, total, page, limit };
}
