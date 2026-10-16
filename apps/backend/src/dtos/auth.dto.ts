import Type, { type Static } from 'typebox'
import { UserResponseDto } from './user.dto.js'

const Email = Type.String({ format: 'email', maxLength: 160 })
const Password = Type.String({
  minLength: 8,
  maxLength: 72,
  description: 'Mínimo 8 caracteres',
})

export const RegisterDto = Type.Object(
  {
    name: Type.String({ minLength: 2, maxLength: 120 }),
    email: Email,
    password: Password,
  },
  { additionalProperties: false },
)
export type RegisterDto = Static<typeof RegisterDto>

export const LoginDto = Type.Object({ email: Email, password: Type.String({ minLength: 1 }) }, { additionalProperties: false })
export type LoginDto = Static<typeof LoginDto>

export const AuthResponseDto = Type.Object({ user: UserResponseDto })
export type AuthResponseDto = Static<typeof AuthResponseDto>
