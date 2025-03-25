import { t } from "elysia";

const createGroupRequestDTO = t.Object(
  {
    name: t.String({ error: "Trip group name is required" }),
    description: t.Optional(t.String()),
    membersIds: t.Array(t.String(), { error: "Invalid members ids" }),
  },
  { error: "Invalid request body" }
);

type CreateTripGroupRequestDTO = typeof createGroupRequestDTO.static;

export { createGroupRequestDTO, CreateTripGroupRequestDTO };
