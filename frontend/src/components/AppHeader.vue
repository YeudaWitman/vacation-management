<script setup lang="ts">
import { useRouter } from "vue-router";
import { auth } from "../auth";

defineProps<{ title: string }>();

const router = useRouter();

function logout() {
  auth.logout();
  router.push("/login");
}
</script>

<template>
  <header class="border-b border-gray-200 bg-white">
    <div class="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-2 px-4 py-3">
      <h1 class="text-lg font-semibold">{{ title }}</h1>
      <div class="flex items-center gap-3 text-sm">
        <span class="text-gray-600">{{ auth.user?.name }} ({{ auth.user?.role }})</span>
        <button class="rounded border border-gray-300 px-3 py-1 hover:bg-gray-100" @click="logout">
          Log out
        </button>
      </div>
    </div>
  </header>
</template>
