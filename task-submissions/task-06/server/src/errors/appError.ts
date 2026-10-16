export interface FieldError {
  field: string;
  message: string;
}

/** An error whose HTTP status and public message are safe to send to clients. */
export class AppError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly details?: FieldError[],
  ) {
    super(message);
    this.name = 'AppError';
  }

  static badRequest(code: string, message: string): AppError {
    return new AppError(400, code, message);
  }

  static notFound(message = 'The requested service request was not found.'): AppError {
    return new AppError(404, 'NOT_FOUND', message);
  }

  static validation(details: FieldError[]): AppError {
    return new AppError(422, 'VALIDATION_ERROR', 'The submitted data is not valid.', details);
  }
}
