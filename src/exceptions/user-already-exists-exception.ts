export class UserAlreadyExistsException extends Error {
  constructor(message = "User already exists") {
    super(message);
  }
}
