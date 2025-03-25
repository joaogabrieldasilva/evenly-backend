import { t } from "elysia";

const paginatedRequestParamsDTO = t.Object(
  {
    pageSize: t.Optional(
      t.Number({ error: "[pageSize] must be a number", default: 10 })
    ),
    page: t.Optional(
      t.Number({ error: "[page] must be a number", default: 1 })
    ),
  },
  { error: "Invalid request params" }
);

type PaginatedRequestDTO = typeof paginatedRequestParamsDTO.static;

export { paginatedRequestParamsDTO, PaginatedRequestDTO };
