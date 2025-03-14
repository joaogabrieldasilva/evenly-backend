import { t } from "elysia";

const refreshRequestDTO = t.Object({
  authorization: t.String({
    error: "Invalid Bearer Token",
    pattern: "^Bearer.[a-zA-Z0-9-_]+.[a-zA-Z0-9-_]+.[a-zA-Z0-9-_]+$",
  }),
});

type RefreshRequestDTO = typeof refreshRequestDTO.static;

export { refreshRequestDTO, RefreshRequestDTO };
