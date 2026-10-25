<script setup lang="ts">
import { onMounted } from "vue";
import AppHeader from "../components/AppHeader.vue";
import RequestForm from "../components/RequestForm.vue";
import RequestsTable from "../components/RequestsTable.vue";
import TeamPlanTable from "../components/TeamPlanTable.vue";
import PaginationBar from "../components/PaginationBar.vue";
import { usePagedList } from "../composables/usePagedList";
import { fetchMyRequests } from "../api/requests.api";
import { fetchTeamVacations } from "../api/team.api";

const mine = usePagedList(fetchMyRequests);
const team = usePagedList(fetchTeamVacations);

onMounted(() => {
  mine.load(1);
  team.load(1);
});

// A new request appears at the top of "my requests" (newest first), so go back to page 1.
function onCreated() {
  mine.load(1);
}
</script>

<template>
  <AppHeader title="My vacation requests" />
  <main class="mx-auto grid max-w-5xl grid-cols-1 gap-6 px-4 py-6">
    <section class="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <h2 class="mb-3 text-base font-semibold">New request</h2>
      <RequestForm @created="onCreated" />
    </section>

    <section class="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <h2 class="mb-3 text-base font-semibold">My requests</h2>
      <p v-if="mine.error.value" role="alert" class="rounded bg-red-50 px-3 py-2 text-sm text-red-700">
        {{ mine.error.value }}
      </p>
      <p v-else-if="mine.loading.value && !mine.items.value.length" class="text-sm text-gray-500">Loading...</p>
      <p v-else-if="!mine.items.value.length" class="text-sm text-gray-500">You have no requests yet.</p>
      <template v-else>
        <RequestsTable :items="mine.items.value" />
        <PaginationBar :page="mine.page.value" :total="mine.total.value" :limit="mine.limit" @change="mine.load" />
      </template>
    </section>

    <section class="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <h2 class="mb-3 text-base font-semibold">Team vacation plan</h2>
      <p v-if="team.error.value" role="alert" class="rounded bg-red-50 px-3 py-2 text-sm text-red-700">
        {{ team.error.value }}
      </p>
      <p v-else-if="team.loading.value && !team.items.value.length" class="text-sm text-gray-500">Loading...</p>
      <p v-else-if="!team.items.value.length" class="text-sm text-gray-500">No approved vacations yet.</p>
      <template v-else>
        <TeamPlanTable :items="team.items.value" />
        <PaginationBar :page="team.page.value" :total="team.total.value" :limit="team.limit" @change="team.load" />
      </template>
    </section>
  </main>
</template>
