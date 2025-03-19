import { treaty } from "@elysiajs/eden";
import { describe, it } from "bun:test";
import { app } from "../src";

const api = treaty(app);

describe("Trip Groups Controller", () => {
  it("should return user's trip groups", async () => {
    const { data, error } = await api["trip-groups"].get();

    console.log(data, error);
  });
});
