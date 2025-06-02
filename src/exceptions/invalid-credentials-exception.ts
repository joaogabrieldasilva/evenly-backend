export class InvalidCredentialsException extends Error {
  constructor(message = "Invalid email e/or password") {
    super(message);
  }
}
