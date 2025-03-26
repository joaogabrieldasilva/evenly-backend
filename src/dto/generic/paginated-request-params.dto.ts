import { t } from "elysia";

const paginatedRequestParamsDTO = t.Object(
  {
    pageSize: t.Optional(
      t.Number({ error: "[pageSize] must be a number", default: 10 })
    ),
    cursor: t.Optional(
      t.Union(
        [
          t.Number({
            error: "[cursor] must be a number or null",
            default: null,
          }),
          t.Null(),
        ],
        { error: "[cursor] must be a number or null" }
      )
    ),
  },
  { error: "Invalid request params" }
);

type PaginatedRequestDTO = typeof paginatedRequestParamsDTO.static;

export { paginatedRequestParamsDTO, PaginatedRequestDTO };
