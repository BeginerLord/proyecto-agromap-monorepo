import { Schema, model, type InferSchemaType } from 'mongoose'
import { ROLES, ROLE_VALUES } from '../constants/roles.js'
import { toJSONPlugin } from './plugins/to-json.plugin.js'

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 160 },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ROLE_VALUES, default: ROLES.STUDENT, index: true },
    isActive: { type: Boolean, default: true },
    lastLoginAt: { type: Date },
    tokenVersion: { type: Number, default: 0, select: false },
  },
  { timestamps: true, collection: 'users' },
)

userSchema.plugin(toJSONPlugin)

export type UserDocument = InferSchemaType<typeof userSchema>
export const UserModel = model('User', userSchema)
