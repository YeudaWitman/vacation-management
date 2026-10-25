<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { auth, homeFor } from "../auth";
import { errorMessage } from "../api/http";

const router = useRouter();

const email = ref("");
const password = ref("");
const loading = ref(false);
const error = ref("");

async function submit() {
  loading.value = true;
  error.value = "";
  try {
    const user = await auth.login(email.value, password.value);
    router.push(homeFor(user));
  } catch (e) {
    error.value = errorMessage(e);
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <main class="mx-auto mt-16 w-full max-w-sm px-4">
    <form class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm" @submit.prevent="submit">
      <h1 class="mb-4 text-2xl font-semibold">Vacation Management</h1>

      <label class="mb-1 block text-sm font-medium" for="email">Email</label>
      <input
        id="email"
        v-model="email"
        type="email"
        required
        autocomplete="username"
        class="mb-3 w-full rounded border border-gray-300 px-3 py-2"
      />

      <label class="mb-1 block text-sm font-medium" for="password">Password</label>
      <input
        id="password"
        v-model="password"
        type="password"
        required
        autocomplete="current-password"
        class="mb-4 w-full rounded border border-gray-300 px-3 py-2"
      />

      <p v-if="error" role="alert" class="mb-3 rounded bg-red-50 px-3 py-2 text-sm text-red-700">
        {{ error }}
      </p>

      <button
        type="submit"
        :disabled="loading"
        class="w-full rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-60"
      >
        {{ loading ? "Signing in..." : "Sign in" }}
      </button>
    </form>
  </main>
</template>
