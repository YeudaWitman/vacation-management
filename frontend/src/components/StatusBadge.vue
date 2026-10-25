<script setup lang="ts">
import type { RequestStatus } from "../types";

defineProps<{ status: RequestStatus }>();

const styles: Record<RequestStatus, string> = {
  Pending: "bg-amber-100 text-amber-800",
  Approved: "bg-green-100 text-green-800",
  Rejected: "bg-red-100 text-red-800",
};
</script>

<template>
  <span class="inline-block rounded-full px-2 py-0.5 text-xs font-medium" :class="styles[status]">
    {{ status }}
  </span>
</template>
