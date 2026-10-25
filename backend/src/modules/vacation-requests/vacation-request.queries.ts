import { getDataSource } from "../../shared/db/data-source";
import { RequestStatus, VacationRequest } from "./vacation-request.entity";

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

export interface RequestFilters {
  status?: RequestStatus;
  userId?: number;
}

// Validator dashboard: everyone's requests, optionally filtered by status and/or user.
// The requester's name and email come along (the password hash never does: select:false).
export async function listAllRequests(
  filters: RequestFilters,
  page: number,
  limit: number
): Promise<Page<VacationRequest>> {
  const repo = (await getDataSource()).getRepository(VacationRequest);
  const [items, total] = await repo.findAndCount({
    where: { ...(filters.status && { status: filters.status }), ...(filters.userId && { userId: filters.userId }) },
    relations: { user: true },
    order: { createdAt: "DESC", id: "DESC" },
    skip: (page - 1) * limit,
    take: limit,
  });
  return { items, total, page, limit };
}
