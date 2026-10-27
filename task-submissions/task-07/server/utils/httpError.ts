export interface FieldDetail {
  field: string;
  message: string;
}

/** An error that is safe to show to API clients. */
export class HttpError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly details?: FieldDetail[],
  ) {
    super(message);
    this.name = 'HttpError';
  }
}
