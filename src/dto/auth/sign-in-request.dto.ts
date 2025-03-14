import { t } from "elysia";

const signInRequestDTO = t.Object(
  {
    email: t.String({ format: "email", error: "Invalid e-mail!" }),
    password: t.String({
      minLength: 6,
      error: "Password must be at least 6 characters long",
    }),
  },
  { error: "Invalid body" }
);

type SignInRequestDTO = typeof signInRequestDTO.static;

export { signInRequestDTO, SignInRequestDTO };
