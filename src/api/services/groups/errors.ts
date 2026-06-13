export class GroupServiceError extends Error {
  constructor(
    message: string,
    public readonly status: 400 | 404 | 409 = 400,
  ) {
    super(message)
  }
}
