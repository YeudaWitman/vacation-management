<script setup lang="ts">
import type { TeamVacation } from "../types";

defineProps<{ items: TeamVacation[] }>();
</script>

<template>
  <div class="overflow-x-auto">
    <table class="w-full min-w-[20rem] text-left text-sm">
      <thead class="border-b border-gray-200 text-gray-500">
        <tr>
          <th class="py-2 pr-3 font-medium">Who</th>
          <th class="py-2 pr-3 font-medium">From</th>
          <th class="py-2 font-medium">To</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="vacation in items" :key="vacation.id" class="border-b border-gray-100">
          <td class="py-2 pr-3">{{ vacation.userName }}</td>
          <td class="py-2 pr-3 whitespace-nowrap">{{ vacation.startDate }}</td>
          <td class="py-2 whitespace-nowrap">{{ vacation.endDate }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
