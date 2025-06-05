import { t } from "elysia";

const createGroupRequestDTO = t.Object(
  {
    name: t.String({ error: "Trip group name is required" }),
    description: t.Optional(t.String()),
  },
  { error: "Invalid request body" }
);

type CreateTripGroupRequestDTO = typeof createGroupRequestDTO.static;

export { createGroupRequestDTO, CreateTripGroupRequestDTO };
