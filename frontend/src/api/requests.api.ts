import { http } from "./http";
import type { Page, VacationRequest } from "../types";

export interface NewRequest {
  startDate: string;
  endDate: string;
  reason: string;
}

export async function createRequest(input: NewRequest): Promise<VacationRequest> {
  const { data } = await http.post<VacationRequest>("/vacation-requests", input);
  return data;
}

export async function fetchMyRequests(page: number, limit: number): Promise<Page<VacationRequest>> {
  const { data } = await http.get<Page<VacationRequest>>("/vacation-requests/mine", {
    params: { page, limit },
  });
  return data;
}
