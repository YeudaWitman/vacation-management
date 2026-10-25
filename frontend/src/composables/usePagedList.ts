import { ref, shallowRef } from "vue";
import { errorMessage } from "../api/http";
import type { Page } from "../types";

// Loads one page of a list and keeps loading/error state. Used by every list on the screens.
// Like a custom hook in React: the state and the functions travel together.
export function usePagedList<T>(
  fetcher: (page: number, limit: number) => Promise<Page<T>>,
  limit = 10
) {
  const items = shallowRef<T[]>([]);
  const total = ref(0);
  const page = ref(1);
  const loading = ref(false);
  const error = ref("");

  // If the user clicks "Next" quickly, an older answer could arrive last and overwrite the
  // newer one. Only the answer to the latest call is allowed to update the screen.
  let latestCall = 0;

  async function load(toPage = page.value) {
    const call = ++latestCall;
    loading.value = true;
    error.value = "";
    try {
      const result = await fetcher(toPage, limit);
      if (call !== latestCall) return;
      items.value = result.items;
      total.value = result.total;
      page.value = result.page;
    } catch (e) {
      if (call !== latestCall) return;
      error.value = errorMessage(e);
    } finally {
      if (call === latestCall) loading.value = false;
    }
  }

  return { items, total, page, limit, loading, error, load };
}
