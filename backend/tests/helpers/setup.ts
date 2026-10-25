import { vi } from "vitest";
import { FakeVacationRepository } from "./fake-repository";
import { eventBus } from "../../src/shared/bus";

// Every handler asks getDataSource() for its repository. We replace that module with a fake,
// so no database is needed. vi.mock is hoisted, so it lives in the test file's import chain.
export const repo = new FakeVacationRepository();

export function resetWorld() {
  repo.reset();
}

// Records every event published on the shared bus, in order.
export function recordEvents() {
  const published: object[] = [];
  vi.spyOn(eventBus, "publish").mockImplementation(async (event: object) => {
    published.push(event);
  });
  return published;
}
