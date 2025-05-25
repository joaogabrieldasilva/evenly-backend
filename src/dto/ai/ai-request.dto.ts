import { t } from "elysia";

const aiRequestDTO = t.Object(
  {
    prompt: t.String({ error: "[prompt] cannot be null" }),
  },
  { error: "Invalid request body" }
);

type AiRequestDTO = typeof aiRequestDTO.static;

export { aiRequestDTO, AiRequestDTO };
