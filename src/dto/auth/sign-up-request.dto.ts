import { t } from "elysia";

const signUpRequestDTO = t.Object(
  {
    email: t.String({ format: "email", error: "Invalid e-mail!" }),
    password: t.String({
      minLength: 6,
      error: "Password must be at least 6 characters long",
    }),
    name: t.String(),
  },
  { error: "Invalid body" }
);

type SignUpRequestDTO = typeof signUpRequestDTO.static;

export { signUpRequestDTO, SignUpRequestDTO };
