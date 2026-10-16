/**
 * Excepción base de la aplicación. Toda excepción de negocio debe extender esta clase
 * para que el manejador global la traduzca en una respuesta HTTP consistente.
 */
export class AppException extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly code: string = 'APP_ERROR',
    public readonly details?: unknown,
  ) {
    super(message)
    this.name = new.target.name
  }
}
