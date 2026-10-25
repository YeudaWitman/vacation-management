<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{ page: number; total: number; limit: number }>();
const emit = defineEmits<{ change: [page: number] }>();

// total comes with the list, so we know where the end is.
const pages = computed(() => Math.max(1, Math.ceil(props.total / props.limit)));
</script>

<template>
  <nav v-if="pages > 1" class="mt-3 flex items-center justify-between text-sm" aria-label="Pagination">
    <button
      class="rounded border border-gray-300 px-3 py-1 hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-transparent"
      :disabled="page <= 1"
      @click="emit('change', page - 1)"
    >
      Previous
    </button>
    <span class="text-gray-600">Page {{ page }} of {{ pages }} ({{ total }} total)</span>
    <button
      class="rounded border border-gray-300 px-3 py-1 hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-transparent"
      :disabled="page >= pages"
      @click="emit('change', page + 1)"
    >
      Next
    </button>
  </nav>
</template>
