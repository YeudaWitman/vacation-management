import { reactive } from "vue";
import { loginRequest } from "./api/auth.api";

export type Role = "Requester" | "Validator";
export interface User {
  id: number;
  name: string;
  role: Role;
}

const STORAGE_KEY = "vacation-session";

// Restore the session after a page refresh. localStorage can be empty or blocked, and its
// content can be edited by the user, so every read is wrapped and checked.
function load(): { token: string | null; user: User | null } {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null");
    const roleOk = saved?.user?.role === "Requester" || saved?.user?.role === "Validator";
    if (typeof saved?.token === "string" && typeof saved?.user?.name === "string" && roleOk) {
      return { token: saved.token, user: saved.user };
    }
  } catch {
    // fall through to the logged-out state
  }
  return { token: null, user: null };
}

function save(token: string, user: User) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ token, user }));
  } catch {
    // Storage blocked: the app still works until the page is refreshed.
  }
}

function clear() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // nothing to clear
  }
}

// Shared, reactive login state: any component that reads auth.user updates when it changes.
// Known limitation (README): the token lives in localStorage, readable by scripts on the page.
export const auth = reactive({
  ...load(),

  async login(email: string, password: string) {
    const { token, user } = await loginRequest(email, password);
    const sessionUser: User = { id: user.id, name: user.name, role: user.role };
    this.token = token;
    this.user = sessionUser;
    save(token, sessionUser);
    return sessionUser;
  },

  logout() {
    this.token = null;
    this.user = null;
    clear();
  },
});

// Where each role lands after login.
export function homeFor(user: User | null): string {
  if (!user) return "/login";
  return user.role === "Validator" ? "/validate" : "/requests";
}
