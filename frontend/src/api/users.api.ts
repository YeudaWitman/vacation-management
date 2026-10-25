import { http } from "./http";
import type { RequesterOption } from "../types";

// Validator only: the Requesters, for the filter dropdown.
export async function fetchRequesters(): Promise<RequesterOption[]> {
  const { data } = await http.get<{ items: RequesterOption[] }>("/users");
  return data.items;
}
