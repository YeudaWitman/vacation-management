<script setup lang="ts">
import type { VacationRequest } from "../types";
import StatusBadge from "./StatusBadge.vue";

// Reused by the Requester screen and (later) the Validator dashboard:
// showUser adds a "Requester" column (the "user" slot can replace the plain name), and the
// "actions" slot lets the parent add buttons.
defineProps<{ items: VacationRequest[]; showUser?: boolean }>();
</script>

<template>
  <div class="overflow-x-auto">
    <table class="w-full min-w-[32rem] text-left text-sm">
      <thead class="border-b border-gray-200 text-gray-500">
        <tr>
          <th v-if="showUser" class="py-2 pr-3 font-medium">Requester</th>
          <th class="py-2 pr-3 font-medium">From</th>
          <th class="py-2 pr-3 font-medium">To</th>
          <th class="py-2 pr-3 font-medium">Reason</th>
          <th class="py-2 pr-3 font-medium">Status</th>
          <th v-if="$slots.actions" class="py-2 font-medium">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="request in items" :key="request.id" class="border-b border-gray-100 align-top">
          <td v-if="showUser" class="py-2 pr-3">
            <slot name="user" :request="request">{{ request.user?.name ?? request.userId }}</slot>
          </td>
          <td class="py-2 pr-3 whitespace-nowrap">{{ request.startDate }}</td>
          <td class="py-2 pr-3 whitespace-nowrap">{{ request.endDate }}</td>
          <td class="py-2 pr-3">{{ request.reason ?? "–" }}</td>
          <td class="py-2 pr-3">
            <StatusBadge :status="request.status" />
            <p v-if="request.status === 'Rejected' && request.comments" class="mt-1 text-xs text-gray-600">
              Comment: {{ request.comments }}
            </p>
          </td>
          <td v-if="$slots.actions" class="py-2"><slot name="actions" :request="request" /></td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
