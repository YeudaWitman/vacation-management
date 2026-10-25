import { http } from "./http";
import type { Page, RequestStatus, VacationRequest } from "../types";

export interface RequestFilters {
  status?: RequestStatus;
  userId?: number;
}

export async function fetchAllRequests(
  filters: RequestFilters,
  page: number,
  limit: number
): Promise<Page<VacationRequest>> {
  const { data } = await http.get<Page<VacationRequest>>("/vacation-requests", {
    params: { ...filters, page, limit }, // undefined values are left out of the URL
  });
  return data;
}

export async function approveRequest(id: number): Promise<VacationRequest> {
  const { data } = await http.patch<VacationRequest>(`/vacation-requests/${id}/approve`);
  return data;
}

export async function rejectRequest(id: number, comment: string): Promise<VacationRequest> {
  const { data } = await http.patch<VacationRequest>(`/vacation-requests/${id}/reject`, { comment });
  return data;
}
