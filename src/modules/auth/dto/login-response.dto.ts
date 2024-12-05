import { ApiResponseProperty } from '@nestjs/swagger';

import { User } from 'database/repositories/core/users/domain/user';

export class LoginResponseDto {
  @ApiResponseProperty()
  token: string;

  @ApiResponseProperty()
  refreshToken: string;

  @ApiResponseProperty()
  tokenExpires: number;

  @ApiResponseProperty({
    type: () => User
  })
  user: User;
}
