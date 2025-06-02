import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "../../src/database/schema";
import * as relations from "../../src/database/relations";

export const makeDatabaseMock = () =>
  drizzle.mock({ schema: { ...schema, ...relations } });
