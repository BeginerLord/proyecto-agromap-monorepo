import { ROLES } from '../constants/roles.js'
import type { RegisterDto, LoginDto } from '../dtos/index.js'
import { ConflictException, ForbiddenException, NotFoundException, UnauthorizedException } from '../exceptions/index.js'
import type { User, UserWithSecrets } from '../interfaces/entities/index.js'
import type { IUserRepository } from '../interfaces/repositories/index.js'
import type { AuthSession, IAuthService, IPasswordHasher, ITokenService } from '../interfaces/services/index.js'

export class AuthService implements IAuthService {
  constructor(
    private readonly users: IUserRepository,
    private readonly hasher: IPasswordHasher,
    private readonly tokens: ITokenService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthSession> {
    if (await this.users.exists({ email: dto.email.toLowerCase() })) {
      throw new ConflictException('Ya existe una cuenta con ese correo')
    }
    const user = await this.users.create({
      name: dto.name.trim(),
      email: dto.email,
      passwordHash: await this.hasher.hash(dto.password),
      role: ROLES.STUDENT,
    })
    return this.createSession(user, 0)
  }

  async login(dto: LoginDto): Promise<AuthSession> {
    const user = await this.users.findByEmailWithSecrets(dto.email)
    // Mismo mensaje para usuario inexistente o contraseña errónea (evita enumeración de cuentas)
    if (!user || !(await this.hasher.compare(dto.password, user.passwordHash))) {
      throw new UnauthorizedException('Correo o contraseña incorrectos')
    }
    if (!user.isActive) throw new ForbiddenException('Tu cuenta está desactivada')

    const updated = await this.users.updateById(user.id, { lastLoginAt: new Date() })
    return this.createSession(updated ?? this.stripSecrets(user), user.tokenVersion)
  }

  async refresh(refreshToken: string | undefined): Promise<AuthSession> {
    if (!refreshToken) throw new UnauthorizedException('No hay sesión activa')
    const payload = this.tokens.verifyRefresh(refreshToken)
    const user = await this.users.findByIdWithSecrets(payload.sub)
    if (!user || !user.isActive || user.tokenVersion !== payload.tv) {
      throw new UnauthorizedException('La sesión ya no es válida')
    }
    return this.createSession(this.stripSecrets(user), user.tokenVersion)
  }

  async logout(userId: string): Promise<void> {
    await this.users.incrementTokenVersion(userId)
  }

  async me(userId: string): Promise<User> {
    const user = await this.users.findById(userId)
    if (!user) throw new NotFoundException('Usuario')
    return user
  }

  private createSession(user: User, tokenVersion: number): AuthSession {
    const tokens = this.tokens.issue(
      { sub: user.id, name: user.name, email: user.email, role: user.role },
      { sub: user.id, tv: tokenVersion },
    )
    return { user, tokens }
  }

  private stripSecrets({ passwordHash: _hash, tokenVersion: _tv, ...user }: UserWithSecrets): User {
    return user
  }
}
