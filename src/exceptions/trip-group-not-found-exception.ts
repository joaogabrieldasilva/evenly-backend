export class TripGroupNotFoundException extends Error {
  constructor(message = "Trip Group not found") {
    super(message);
  }
}
