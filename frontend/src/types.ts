// Shapes of the data the backend sends. Dates are plain "YYYY-MM-DD" strings.
export type RequestStatus = "Pending" | "Approved" | "Rejected";

export interface VacationRequest {
  id: number;
  userId: number;
  startDate: string;
  endDate: string;
  reason: string | null;
  status: RequestStatus;
  comments: string | null; // the validator's comment when rejected
  createdAt: string;
  updatedAt: string;
  user?: { id: number; name: string; email: string }; // only on the validator's list
}

export interface TeamVacation {
  id: number;
  userId: number;
  userName: string;
  startDate: string;
  endDate: string;
}

// Every list endpoint answers with this shape.
export interface Page<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

// One entry of the Validator's requester dropdown.
export interface RequesterOption {
  id: number;
  name: string;
}
