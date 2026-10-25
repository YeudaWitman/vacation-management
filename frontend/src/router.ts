import { createRouter, createWebHistory } from "vue-router";
import LoginView from "./views/LoginView.vue";
import RequesterView from "./views/RequesterView.vue";
import ValidatorView from "./views/ValidatorView.vue";
import { auth, homeFor } from "./auth";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", redirect: () => homeFor(auth.user) },
    { path: "/login", component: LoginView, meta: { public: true } },
    { path: "/requests", component: RequesterView, meta: { role: "Requester" } },
    { path: "/validate", component: ValidatorView, meta: { role: "Validator" } },
    { path: "/:pathMatch(.*)*", redirect: () => homeFor(auth.user) },
  ],
});

// Runs before every navigation. Returning true continues, a path redirects.
// This is for user experience only: the real security is the backend (401 and 403).
router.beforeEach((to) => {
  if (to.meta.public) {
    // Already logged in? Skip the login page.
    return auth.user ? homeFor(auth.user) : true;
  }
  if (!auth.user) return "/login";
  if (to.meta.role && to.meta.role !== auth.user.role) return homeFor(auth.user);
  return true;
});

export default router;
