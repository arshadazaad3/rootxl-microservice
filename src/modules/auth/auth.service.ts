import {
  HttpStatus,
  Injectable,
  NotFoundException,
  UnauthorizedException,
  UnprocessableEntityException
} from '@nestjs/common';
import ms from 'ms';
import crypto from 'crypto';
import { randomStringGenerator } from '@nestjs/common/utils/random-string-generator.util';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcryptjs';
import { ConfigService } from '@nestjs/config';

import { User, Session, AuthProvidersEnum } from 'database/repositories/core';
import { SocialInterface } from 'modules/social/interfaces/social.interface';
import { AllConfigType } from 'config/config.type';
import { NullableType } from 'utils/types/nullable.type';
import { CUSTOM_API_RES } from 'constants/api';

import { UsersService } from '../users/users.service';
import { MailService } from '../mail/mail.service';
import { SessionService } from '../session/session.service';
import { AuthEmailLoginDto, AuthRegisterLoginDto, AuthUpdateDto, LoginResponseDto } from './dto';
import { JwtPayloadType, JwtRefreshPayloadType } from './strategies';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private usersService: UsersService,
    private sessionService: SessionService,
    private mailService: MailService,
    private configService: ConfigService<AllConfigType>
  ) {}

  async validateLogin(loginDto: AuthEmailLoginDto): Promise<LoginResponseDto> {
    const user = await this.usersService.findByEmail(loginDto.email);

    if (!user) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: { code: CUSTOM_API_RES.AUTH.EMAIL_NOT_FOUND }
      });
    }

    if (user.provider !== AuthProvidersEnum.email) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: { code: CUSTOM_API_RES.AUTH.LOGIN_VIA_PROVIDER, provider: user.provider }
      });
    }
    if (!user.password) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: { code: CUSTOM_API_RES.AUTH.PASSWORD_MISSING }
      });
    }

    const isValidPassword = await bcrypt.compare(loginDto.password, user.password);
    if (!isValidPassword) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: { code: CUSTOM_API_RES.AUTH.INCORRECT_PASSWORD }
      });
    }

    const hash = crypto.createHash('sha256').update(randomStringGenerator()).digest('hex');
    const session = await this.sessionService.create({
      userId: user._id as string,
      hash
    });

    const { token, refreshToken, tokenExpires } = await this.getTokensData({
      id: user._id,
      sessionId: session._id,
      hash
    });

    return {
      refreshToken,
      token,
      tokenExpires,
      user
    };
  }

  async validateSocialLogin(authProvider: string, socialData: SocialInterface): Promise<LoginResponseDto> {
    let user: NullableType<User> = null;
    const socialEmail = socialData.email?.toLowerCase();
    let userByEmail: NullableType<User> = null;

    if (socialEmail) {
      userByEmail = await this.usersService.findByEmail(socialEmail);
    }

    if (socialData.id) {
      user = await this.usersService.findBySocialIdAndProvider({
        socialId: socialData.id,
        provider: authProvider
      });
    }

    if (user) {
      if (socialEmail && !userByEmail) {
        user.email = socialEmail;
      }
      await this.usersService.update(user._id, user);
    } else if (userByEmail) {
      user = userByEmail;
    } else if (socialData.id) {
      user = await this.usersService.create({
        email: socialEmail ?? null,
        firstName: socialData.firstName ?? null,
        lastName: socialData.lastName ?? null,
        socialId: socialData.id,
        provider: authProvider,
        verified: true
      });

      user = await this.usersService.findById(user._id);
    }

    if (!user) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          user: 'userNotFound'
        }
      });
    }

    const hash = crypto.createHash('sha256').update(randomStringGenerator()).digest('hex');

    const session = await this.sessionService.create({
      userId: user._id as string,
      hash
    });

    const {
      token: jwtToken,
      refreshToken,
      tokenExpires
    } = await this.getTokensData({
      id: user._id,
      hash,
      sessionId: session._id
    });

    return {
      refreshToken,
      token: jwtToken,
      tokenExpires,
      user
    };
  }

  async register(dto: AuthRegisterLoginDto): Promise<void> {
    const user = await this.usersService.create({
      ...dto,
      email: dto.email,
      verified: false
    });

    const hash = await this.jwtService.signAsync(
      {
        confirmEmailUserId: user._id
      },
      {
        secret: this.configService.getOrThrow('auth.confirmEmailSecret', {
          infer: true
        }),
        expiresIn: this.configService.getOrThrow('auth.confirmEmailExpires', {
          infer: true
        })
      }
    );

    await this.mailService.userSignUp({
      to: dto.email,
      data: {
        hash
      }
    });
  }

  async verifyEmail(hash: string): Promise<void> {
    let userId: User['_id'];

    try {
      const jwtData = await this.jwtService.verifyAsync<{
        confirmEmailUserId: User['_id'];
      }>(hash, {
        secret: this.configService.getOrThrow('auth.confirmEmailSecret', {
          infer: true
        })
      });

      userId = jwtData.confirmEmailUserId;
    } catch {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          hash: `invalidHash`
        }
      });
    }

    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new NotFoundException({
        status: HttpStatus.NOT_FOUND,
        error: `notFound`
      });
    }

    user.verified = true;

    await this.usersService.update(user._id, user);
  }

  async confirmNewEmail(hash: string): Promise<void> {
    let userId: User['_id'];
    let newEmail: User['email'];

    try {
      const jwtData = await this.jwtService.verifyAsync<{
        confirmEmailUserId: User['_id'];
        newEmail: User['email'];
      }>(hash, {
        secret: this.configService.getOrThrow('auth.confirmEmailSecret', {
          infer: true
        })
      });

      userId = jwtData.confirmEmailUserId;
      newEmail = jwtData.newEmail;
    } catch {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          hash: `invalidHash`
        }
      });
    }

    const user = await this.usersService.findById(userId);

    if (!user) {
      throw new NotFoundException({
        status: HttpStatus.NOT_FOUND,
        error: `notFound`
      });
    }

    user.email = newEmail;
    user.verified = true;

    await this.usersService.update(user._id, user);
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          email: 'emailNotExists'
        }
      });
    }

    const tokenExpiresIn = this.configService.getOrThrow('auth.forgotExpires', {
      infer: true
    });

    const tokenExpires = Date.now() + ms(tokenExpiresIn);

    const hash = await this.jwtService.signAsync(
      {
        forgotUserId: user._id
      },
      {
        secret: this.configService.getOrThrow('auth.forgotSecret', {
          infer: true
        }),
        expiresIn: tokenExpiresIn
      }
    );

    await this.mailService.forgotPassword({
      to: email,
      data: {
        hash,
        tokenExpires
      }
    });
  }

  async resetPassword(hash: string, password: string): Promise<void> {
    let userId: User['_id'];

    try {
      const jwtData = await this.jwtService.verifyAsync<{
        forgotUserId: User['_id'];
      }>(hash, {
        secret: this.configService.getOrThrow('auth.forgotSecret', {
          infer: true
        })
      });

      userId = jwtData.forgotUserId;
    } catch {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          hash: `invalidHash`
        }
      });
    }

    const user = await this.usersService.findById(userId);

    if (!user) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          hash: `notFound`
        }
      });
    }

    user.password = password;

    await this.sessionService.deleteByUserId({
      userId: user._id
    });

    await this.usersService.update(user._id, user);
  }

  async me(userJwtPayload: JwtPayloadType): Promise<NullableType<User>> {
    return this.usersService.findById(userJwtPayload._id);
  }

  async update(userJwtPayload: JwtPayloadType, userDto: AuthUpdateDto): Promise<NullableType<User>> {
    const currentUser = await this.usersService.findById(userJwtPayload._id);

    if (!currentUser) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          user: 'userNotFound'
        }
      });
    }

    if (userDto.password) {
      if (!userDto.oldPassword) {
        throw new UnprocessableEntityException({
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: {
            oldPassword: 'missingOldPassword'
          }
        });
      }

      if (!currentUser.password) {
        throw new UnprocessableEntityException({
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: {
            oldPassword: 'incorrectOldPassword'
          }
        });
      }

      const isValidOldPassword = await bcrypt.compare(userDto.oldPassword, currentUser.password);

      if (!isValidOldPassword) {
        throw new UnprocessableEntityException({
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: {
            oldPassword: 'incorrectOldPassword'
          }
        });
      } else {
        await this.sessionService.deleteByUserIdWithExclude({
          userId: currentUser._id,
          excludeSessionId: userJwtPayload.sessionId
        });
      }
    }

    if (userDto.email && userDto.email !== currentUser.email) {
      const userByEmail = await this.usersService.findByEmail(userDto.email);

      if (userByEmail && userByEmail._id !== currentUser._id) {
        throw new UnprocessableEntityException({
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: {
            email: 'emailExists'
          }
        });
      }

      const hash = await this.jwtService.signAsync(
        {
          confirmEmailUserId: currentUser._id,
          newEmail: userDto.email
        },
        {
          secret: this.configService.getOrThrow('auth.confirmEmailSecret', {
            infer: true
          }),
          expiresIn: this.configService.getOrThrow('auth.confirmEmailExpires', {
            infer: true
          })
        }
      );

      await this.mailService.confirmNewEmail({
        to: userDto.email,
        data: {
          hash
        }
      });
    }

    delete userDto.email;
    delete userDto.oldPassword;

    await this.usersService.update(userJwtPayload._id, userDto);

    return this.usersService.findById(userJwtPayload._id);
  }

  async refreshToken(data: Pick<JwtRefreshPayloadType, 'sessionId' | 'hash'>): Promise<Omit<LoginResponseDto, 'user'>> {
    const session = await this.sessionService.findById(data.sessionId);

    if (!session) {
      throw new UnauthorizedException();
    }

    if (session.hash !== data.hash) {
      throw new UnauthorizedException();
    }

    const hash = crypto.createHash('sha256').update(randomStringGenerator()).digest('hex');
    const user = await this.usersService.findById(session.userId as string);

    await this.sessionService.update(session._id, {
      hash
    });

    const { token, refreshToken, tokenExpires } = await this.getTokensData({
      id: session.userId as string,
      sessionId: session._id,
      hash
    });

    return {
      token,
      refreshToken,
      tokenExpires
    };
  }

  async softDelete(user: User): Promise<void> {
    await this.usersService.remove(user._id);
  }

  async logout(data: Pick<JwtRefreshPayloadType, 'sessionId'>) {
    return this.sessionService.deleteById(data.sessionId);
  }

  private async getTokensData(data: { id: User['_id']; sessionId: Session['_id']; hash: Session['hash'] }) {
    const tokenExpiresIn = this.configService.getOrThrow('auth.expires', {
      infer: true
    });

    const tokenExpires = Date.now() + ms(tokenExpiresIn);

    const [token, refreshToken] = await Promise.all([
      await this.jwtService.signAsync(
        {
          id: data.id,
          sessionId: data.sessionId
        },
        {
          secret: this.configService.getOrThrow('auth.secret', { infer: true }),
          expiresIn: tokenExpiresIn
        }
      ),
      await this.jwtService.signAsync(
        {
          sessionId: data.sessionId,
          hash: data.hash
        },
        {
          secret: this.configService.getOrThrow('auth.refreshSecret', {
            infer: true
          }),
          expiresIn: this.configService.getOrThrow('auth.refreshExpires', {
            infer: true
          })
        }
      )
    ]);

    return {
      token,
      refreshToken,
      tokenExpires
    };
  }
}
