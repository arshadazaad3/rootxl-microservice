import { PartialType, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsEmail, IsOptional, MinLength } from 'class-validator';

import { FileDto } from 'database/repositories/core/files/dto/file.dto';
import { RoleDto } from 'database/repositories/core/roles/dto/role.dto';

import { lowerCaseTransformer } from 'utils/transformers/lower-case.transformer';

import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiPropertyOptional({ example: 'test1@example.com', type: String })
  @Transform(lowerCaseTransformer)
  @IsOptional()
  @IsEmail()
  email?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @MinLength(6)
  password?: string;

  provider?: string;

  socialId?: string | null;

  @ApiPropertyOptional({ example: 'John', type: String })
  @IsOptional()
  firstName?: string | null;

  @ApiPropertyOptional({ example: 'Doe', type: String })
  @IsOptional()
  lastName?: string | null;

  @ApiPropertyOptional({ type: () => FileDto })
  @IsOptional()
  photo?: FileDto | null;

  @ApiPropertyOptional({ type: () => RoleDto })
  @IsOptional()
  @Type(() => RoleDto)
  role?: RoleDto | null;

  hash?: string | null;

  verified?: boolean;
}
