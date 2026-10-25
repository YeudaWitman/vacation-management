<script setup lang="ts">
import { onMounted, ref } from "vue";
import AppHeader from "../components/AppHeader.vue";
import RequestsTable from "../components/RequestsTable.vue";
import TeamPlanTable from "../components/TeamPlanTable.vue";
import PaginationBar from "../components/PaginationBar.vue";
import RejectDialog from "../components/RejectDialog.vue";
import { usePagedList } from "../composables/usePagedList";
import { approveRequest, fetchAllRequests } from "../api/validator.api";
import { fetchTeamVacations } from "../api/team.api";
import { fetchRequesters } from "../api/users.api";
import { errorMessage } from "../api/http";
import type { RequestStatus, RequesterOption, VacationRequest } from "../types";

// --- filters ---
const statusFilter = ref<RequestStatus | "">("");
const userFilter = ref<number | "">(""); // the selected requester id, "" = everyone
const requesters = ref<RequesterOption[]>([]);

// The list asks for the current filters every time it loads.
const all = usePagedList((page, limit) =>
  fetchAllRequests(
    { status: statusFilter.value || undefined, userId: userFilter.value || undefined },
    page,
    limit
  )
);
const team = usePagedList(fetchTeamVacations);

onMounted(async () => {
  all.load(1);
  team.load(1);
  // The dropdown is a convenience: if loading it fails, the list and the click-on-a-name filter still work.
  try {
    requesters.value = await fetchRequesters();
  } catch {
    requesters.value = [];
  }
});

// Changing a filter always starts again from page 1.
function applyFilters() {
  all.load(1);
}

function filterByUser(request: VacationRequest) {
  userFilter.value = request.userId;
  applyFilters();
}

function clearFilters() {
  statusFilter.value = "";
  userFilter.value = "";
  applyFilters();
}

// --- approve and reject ---
const actionError = ref("");
const busyId = ref<number | null>(null); // the row whose action is running
const rejecting = ref<VacationRequest | null>(null);

// After any decision, show what is really stored: reload the list, and the team plan
// (an approval changes it).
async function refresh() {
  await Promise.all([all.load(), team.load(1)]);
}

async function approve(request: VacationRequest) {
  busyId.value = request.id;
  actionError.value = "";
  try {
    await approveRequest(request.id);
  } catch (e) {
    // For example 409: another validator decided this request first.
    actionError.value = errorMessage(e);
  } finally {
    busyId.value = null;
  }
  await refresh();
}

async function onRejected() {
  rejecting.value = null;
  actionError.value = "";
  await refresh();
}
</script>

<template>
  <AppHeader title="Validator dashboard" />
  <main class="mx-auto grid max-w-5xl grid-cols-1 gap-6 px-4 py-6">
    <section class="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <h2 class="mb-3 text-base font-semibold">All requests</h2>

      <div class="mb-3 flex flex-wrap items-end gap-3">
        <div>
          <label class="mb-1 block text-sm font-medium" for="status-filter">Status</label>
          <select
            id="status-filter"
            v-model="statusFilter"
            class="rounded border border-gray-300 px-3 py-2"
            @change="applyFilters"
          >
            <option value="">All</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        <div v-if="requesters.length">
          <label class="mb-1 block text-sm font-medium" for="user-filter">Requester</label>
          <select
            id="user-filter"
            v-model="userFilter"
            class="rounded border border-gray-300 px-3 py-2"
            @change="applyFilters"
          >
            <option value="">Everyone</option>
            <option v-for="requester in requesters" :key="requester.id" :value="requester.id">
              {{ requester.name }}
            </option>
          </select>
        </div>

        <button
          v-if="statusFilter || userFilter"
          type="button"
          class="text-sm text-gray-600 underline hover:text-gray-900"
          @click="clearFilters"
        >
          Clear filters
        </button>
      </div>

      <p v-if="actionError" role="alert" class="mb-3 rounded bg-red-50 px-3 py-2 text-sm text-red-700">
        {{ actionError }}
      </p>
      <p v-if="all.error.value" role="alert" class="rounded bg-red-50 px-3 py-2 text-sm text-red-700">
        {{ all.error.value }}
      </p>
      <p v-else-if="all.loading.value && !all.items.value.length" class="text-sm text-gray-500">Loading...</p>
      <p v-else-if="!all.items.value.length" class="text-sm text-gray-500">No requests match these filters.</p>
      <template v-else>
        <RequestsTable :items="all.items.value" show-user>
          <template #user="{ request }">
            <button
              type="button"
              class="text-left text-blue-700 underline decoration-dotted hover:text-blue-900"
              :title="`Show only requests of ${request.user?.name}`"
              @click="filterByUser(request)"
            >
              {{ request.user?.name ?? request.userId }}
            </button>
          </template>
          <template #actions="{ request }">
            <div v-if="request.status === 'Pending'" class="flex gap-2">
              <button
                type="button"
                :disabled="busyId === request.id"
                class="rounded bg-green-600 px-3 py-1 text-white hover:bg-green-700 disabled:opacity-60"
                @click="approve(request)"
              >
                Approve
              </button>
              <button
                type="button"
                :disabled="busyId === request.id"
                class="rounded border border-red-300 px-3 py-1 text-red-700 hover:bg-red-50 disabled:opacity-60"
                @click="rejecting = request"
              >
                Reject
              </button>
            </div>
            <span v-else class="text-gray-400">–</span>
          </template>
        </RequestsTable>
        <PaginationBar :page="all.page.value" :total="all.total.value" :limit="all.limit" @change="all.load" />
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

  <RejectDialog v-if="rejecting" :request="rejecting" @close="rejecting = null" @rejected="onRejected" />
</template>
