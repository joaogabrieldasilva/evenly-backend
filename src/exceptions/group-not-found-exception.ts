export class GroupNotFoundException extends Error {
  constructor(message = "Group not found") {
    super(message);
  }
}
