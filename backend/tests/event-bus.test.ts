import { describe, expect, it, vi } from "vitest";
import { EventBus } from "../src/shared/bus";

class SomethingHappened {
  constructor(public readonly id: number) {}
}

describe("EventBus", () => {
  it("delivers an event to every listener, in order", async () => {
    const bus = new EventBus();
    const calls: string[] = [];
    bus.subscribe(SomethingHappened, async () => void calls.push("first"));
    bus.subscribe(SomethingHappened, async () => void calls.push("second"));

    await bus.publish(new SomethingHappened(1));
    expect(calls).toEqual(["first", "second"]);
  });

  it("does nothing when nobody listens", async () => {
    await expect(new EventBus().publish(new SomethingHappened(1))).resolves.toBeUndefined();
  });

  it("a failing listener is logged and does not stop the others or fail publish", async () => {
    const bus = new EventBus();
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const second = vi.fn();
    bus.subscribe(SomethingHappened, async () => {
      throw new Error("email server down");
    });
    bus.subscribe(SomethingHappened, second);

    await expect(bus.publish(new SomethingHappened(1))).resolves.toBeUndefined();
    expect(second).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledTimes(1);
    spy.mockRestore();
  });
});
