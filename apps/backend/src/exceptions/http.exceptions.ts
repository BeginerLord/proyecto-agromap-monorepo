import { AppException } from './app.exception.js'

export class BadRequestException extends AppException {
  constructor(message = 'Solicitud inválida', details?: unknown) {
    super(400, message, 'BAD_REQUEST', details)
  }
}

export class UnauthorizedException extends AppException {
  constructor(message = 'No autenticado') {
    super(401, message, 'UNAUTHORIZED')
  }
}

export class ForbiddenException extends AppException {
  constructor(message = 'No tienes permisos para realizar esta acción') {
    super(403, message, 'FORBIDDEN')
  }
}

export class NotFoundException extends AppException {
  constructor(resource = 'Recurso', id?: string) {
    super(404, id ? `${resource} con id "${id}" no encontrado` : `${resource} no encontrado`, 'NOT_FOUND')
  }
}

export class ConflictException extends AppException {
  constructor(message = 'El recurso ya existe') {
    super(409, message, 'CONFLICT')
  }
}

export class UnprocessableException extends AppException {
  constructor(message = 'No se pudo procesar la solicitud', details?: unknown) {
    super(422, message, 'UNPROCESSABLE_ENTITY', details)
  }
}

export class ServiceUnavailableException extends AppException {
  constructor(message = 'Servicio no disponible') {
    super(503, message, 'SERVICE_UNAVAILABLE')
  }
}
