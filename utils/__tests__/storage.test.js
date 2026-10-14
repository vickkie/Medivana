import { setItem, getItem, removeItem } from "../storage";

jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);

describe("storage helpers", () => {
  it("round-trips objects", async () => {
    await setItem("k1", { a: 1 });
    expect(await getItem("k1")).toEqual({ a: 1 });
  });

  it("returns null for missing keys", async () => {
    expect(await getItem("nope")).toBeNull();
  });

  it("removes keys", async () => {
    await setItem("k2", "x");
    await removeItem("k2");
    expect(await getItem("k2")).toBeNull();
  });
});
