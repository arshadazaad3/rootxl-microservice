import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  HttpStatus,
  HttpCode,
  SerializeOptions
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiParam, ApiTags } from '@nestjs/swagger';

import { Roles } from 'modules/roles/roles.decorator';
import { User, RoleEnum } from 'database/repositories/core';
import { infinityPagination, InfinityPaginationResponse, InfinityPaginationResponseDto } from 'database/utils';
import { NullableType } from 'utils/types';
import { RolesGuard } from 'modules/roles/roles.guard';

import { UsersService } from './users.service';
import { QueryUserDto, CreateUserDto, UpdateUserDto } from './dto';

@ApiBearerAuth()
@Roles(RoleEnum.admin)
@UseGuards(AuthGuard('jwt'), RolesGuard)
@ApiTags('Users')
@Controller({
  path: 'users',
  version: '1'
})
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiCreatedResponse({
    type: User
  })
  @SerializeOptions({
    groups: ['admin']
  })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createProfileDto: CreateUserDto): Promise<User> {
    return this.usersService.create(createProfileDto);
  }

  @ApiOkResponse({
    type: InfinityPaginationResponse(User)
  })
  @SerializeOptions({
    groups: ['admin']
  })
  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(@Query() query: QueryUserDto): Promise<InfinityPaginationResponseDto<User>> {
    const page = query?.page ?? 1;
    let limit = query?.limit ?? 10;
    if (limit > 50) {
      limit = 50;
    }

    return infinityPagination(
      await this.usersService.findManyWithPagination({
        filterOptions: query?.filters,
        sortOptions: query?.sort,
        paginationOptions: {
          page,
          limit
        }
      }),
      { page, limit }
    );
  }

  @ApiOkResponse({
    type: User
  })
  @SerializeOptions({
    groups: ['admin']
  })
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiParam({
    name: 'id',
    type: String,
    required: true
  })
  findOne(@Param('id') id: User['_id']): Promise<NullableType<User>> {
    return this.usersService.findById(id);
  }

  @ApiOkResponse({
    type: User
  })
  @SerializeOptions({
    groups: ['admin']
  })
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiParam({
    name: 'id',
    type: String,
    required: true
  })
  update(@Param('id') id: User['_id'], @Body() updateProfileDto: UpdateUserDto): Promise<User | null> {
    return this.usersService.update(id, updateProfileDto);
  }

  @Delete(':id')
  @ApiParam({
    name: 'id',
    type: String,
    required: true
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: User['_id']): Promise<void> {
    return this.usersService.remove(id);
  }
}
