import { http } from "./http";
import type { Page, TeamVacation } from "../types";

export async function fetchTeamVacations(page: number, limit: number): Promise<Page<TeamVacation>> {
  const { data } = await http.get<Page<TeamVacation>>("/team/vacations", { params: { page, limit } });
  return data;
}
