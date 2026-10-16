import type { FastifyError, FastifyReply, FastifyRequest } from 'fastify'
import mongoose from 'mongoose'
import { AppException } from './app.exception.js'

interface ErrorBody {
  statusCode: number
  error: string
  message: string
  details?: unknown
}

function send(reply: FastifyReply, body: ErrorBody) {
  return reply.status(body.statusCode).send(body)
}

/** Traduce cualquier error lanzado en la app a una respuesta JSON uniforme. */
export function errorHandler(error: FastifyError | Error, request: FastifyRequest, reply: FastifyReply) {
  if (error instanceof AppException) {
    return send(reply, {
      statusCode: error.statusCode,
      error: error.code,
      message: error.message,
      ...(error.details !== undefined && { details: error.details }),
    })
  }

  if ('validation' in error && error.validation) {
    return send(reply, {
      statusCode: 400,
      error: 'VALIDATION_ERROR',
      message: 'Los datos enviados no son válidos',
      details: error.validation.map((issue) => ({
        field: issue.instancePath || (issue.params as { missingProperty?: string } | undefined)?.missingProperty,
        message: issue.message,
      })),
    })
  }

  if (error instanceof mongoose.Error.ValidationError) {
    return send(reply, {
      statusCode: 400,
      error: 'VALIDATION_ERROR',
      message: 'Los datos enviados no son válidos',
      details: Object.values(error.errors).map((issue) => ({ field: issue.path, message: issue.message })),
    })
  }

  if (error instanceof mongoose.Error.CastError) {
    return send(reply, { statusCode: 400, error: 'BAD_REQUEST', message: `Valor inválido para "${error.path}"` })
  }

  if ((error as { code?: number }).code === 11000) {
    return send(reply, { statusCode: 409, error: 'CONFLICT', message: 'Ya existe un registro con esos datos' })
  }

  const statusCode = (error as FastifyError).statusCode ?? 500
  if (statusCode >= 500) request.log.error({ err: error }, 'Error no controlado')

  return send(reply, {
    statusCode,
    error: statusCode >= 500 ? 'INTERNAL_SERVER_ERROR' : ((error as FastifyError).code ?? 'ERROR'),
    message: statusCode >= 500 ? 'Error interno del servidor' : error.message,
  })
}
