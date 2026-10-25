<script setup lang="ts">
import { computed, ref } from "vue";
import { createRequest } from "../api/requests.api";
import { errorMessage } from "../api/http";

const emit = defineEmits<{ created: [] }>();

const startDate = ref("");
const endDate = ref("");
const reason = ref("");
const loading = ref(false);
const error = ref("");
const success = ref(false);

// Today as YYYY-MM-DD in the browser's time zone, used only to guide the date pickers.
const today = computed(() => {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
});

// Calendar days from start to end, both included. Recalculates when either date changes.
const days = computed(() => {
  if (!startDate.value || !endDate.value || endDate.value < startDate.value) return 0;
  const toUtc = (iso: string) => {
    const [y, m, d] = iso.split("-").map(Number);
    return Date.UTC(y, m - 1, d);
  };
  return Math.round((toUtc(endDate.value) - toUtc(startDate.value)) / 86_400_000) + 1;
});

// These checks only guide the user. The backend checks every rule again and has the last word.
async function submit() {
  loading.value = true;
  error.value = "";
  success.value = false;
  try {
    await createRequest({ startDate: startDate.value, endDate: endDate.value, reason: reason.value });
    startDate.value = "";
    endDate.value = "";
    reason.value = "";
    success.value = true;
    emit("created");
  } catch (e) {
    error.value = errorMessage(e);
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <form class="grid gap-3 sm:grid-cols-2" @submit.prevent="submit">
    <div>
      <label class="mb-1 block text-sm font-medium" for="start">Start date</label>
      <input id="start" v-model="startDate" type="date" required :min="today" class="w-full rounded border border-gray-300 px-3 py-2" />
    </div>
    <div>
      <label class="mb-1 block text-sm font-medium" for="end">End date</label>
      <input id="end" v-model="endDate" type="date" required :min="startDate || today" class="w-full rounded border border-gray-300 px-3 py-2" />
    </div>
    <div class="sm:col-span-2">
      <label class="mb-1 block text-sm font-medium" for="reason">Reason (optional)</label>
      <input id="reason" v-model="reason" type="text" maxlength="200" class="w-full rounded border border-gray-300 px-3 py-2" />
    </div>

    <p v-if="days" class="text-sm text-gray-600 sm:col-span-2">{{ days }} day{{ days === 1 ? "" : "s" }}</p>
    <p v-if="error" role="alert" class="rounded bg-red-50 px-3 py-2 text-sm text-red-700 sm:col-span-2">{{ error }}</p>
    <p v-if="success" role="status" class="rounded bg-green-50 px-3 py-2 text-sm text-green-700 sm:col-span-2">
      Request submitted. It is now Pending.
    </p>

    <div class="sm:col-span-2">
      <button type="submit" :disabled="loading" class="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-60">
        {{ loading ? "Submitting..." : "Submit request" }}
      </button>
    </div>
  </form>
</template>
