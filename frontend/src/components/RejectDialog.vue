<script setup lang="ts">
import { onMounted, ref } from "vue";
import { rejectRequest } from "../api/validator.api";
import { errorMessage } from "../api/http";
import type { VacationRequest } from "../types";

const props = defineProps<{ request: VacationRequest }>();
const emit = defineEmits<{ close: []; rejected: [] }>();

const dialog = ref<HTMLDialogElement | null>(null);
const comment = ref("");
const loading = ref(false);
const error = ref("");

// A native <dialog> opened with showModal() gives us the dark backdrop, keyboard focus
// trapping and the Escape key for free.
onMounted(() => dialog.value?.showModal());

async function submit() {
  loading.value = true;
  error.value = "";
  try {
    await rejectRequest(props.request.id, comment.value);
    emit("rejected");
  } catch (e) {
    error.value = errorMessage(e);
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <dialog
    ref="dialog"
    aria-labelledby="reject-title"
    class="m-auto w-[calc(100%-2rem)] max-w-md rounded-lg p-0 shadow-xl backdrop:bg-black/40"
    @close="emit('close')"
  >
    <form class="p-5" @submit.prevent="submit">
      <h2 id="reject-title" class="mb-1 text-lg font-semibold">Reject request</h2>
      <p class="mb-3 text-sm text-gray-600">
        {{ request.user?.name }}: {{ request.startDate }} to {{ request.endDate }}
      </p>

      <label class="mb-1 block text-sm font-medium" for="reject-comment">Comment (required)</label>
      <textarea
        id="reject-comment"
        v-model="comment"
        required
        rows="3"
        maxlength="500"
        autofocus
        class="mb-3 w-full rounded border border-gray-300 px-3 py-2"
      />

      <p v-if="error" role="alert" class="mb-3 rounded bg-red-50 px-3 py-2 text-sm text-red-700">{{ error }}</p>

      <div class="flex justify-end gap-2">
        <button type="button" class="rounded border border-gray-300 px-4 py-2 hover:bg-gray-100" @click="dialog?.close()">
          Cancel
        </button>
        <button type="submit" :disabled="loading" class="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:opacity-60">
          {{ loading ? "Rejecting..." : "Reject" }}
        </button>
      </div>
    </form>
  </dialog>
</template>
