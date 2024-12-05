/* eslint-disable @typescript-eslint/ban-ts-comment */
import { HttpStatus, Injectable, UnprocessableEntityException } from '@nestjs/common';
import bcrypt from 'bcryptjs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { plainToInstance } from 'class-transformer';

import { NullableType, DeepPartial, IPaginationOptions } from 'utils/types';
import { PrimaryConnection } from 'database/connections';
import { User, AuthProvidersEnum, UserSchemaClass } from 'database/repositories/core';

import { FilesService } from '../files/files.service';
import { CreateUserDto, FilterUserDto, SortUserDto } from './dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly filesService: FilesService,

    @InjectModel(UserSchemaClass.name, PrimaryConnection)
    private readonly userModel: Model<UserSchemaClass>
  ) {}

  async create(createProfileDto: CreateUserDto): Promise<User> {
    const clonedPayload = {
      provider: AuthProvidersEnum.email,
      ...createProfileDto
    };

    if (clonedPayload.password) {
      const salt = await bcrypt.genSalt();
      clonedPayload.password = await bcrypt.hash(clonedPayload.password, salt);
    }

    if (clonedPayload.email) {
      const userObject = await this.userModel.findOne({
        email: clonedPayload.email
      });
      if (userObject) {
        throw new UnprocessableEntityException({
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: {
            email: 'emailAlreadyExists'
          }
        });
      }
    }

    return this.userModel.create(clonedPayload);
  }

  findManyWithPagination({
    filterOptions,
    sortOptions,
    paginationOptions
  }: {
    filterOptions?: FilterUserDto | null;
    sortOptions?: SortUserDto[] | null;
    paginationOptions: IPaginationOptions;
  }): Promise<User[]> {
    //@ts-ignore
    return this.usersRepository.findManyWithPagination({
      filterOptions,
      sortOptions,
      paginationOptions
    });
  }

  async findById(id: User['_id']): Promise<NullableType<User>> {
    const data = await this.userModel.findById(id).lean<User>().exec();
    return data;
  }

  async findByEmail(email: User['email']): Promise<NullableType<User>> {
    const data = await this.userModel.findOne({ email }).lean();
    return data ? plainToInstance(User, data) : null;
  }

  findBySocialIdAndProvider({
    socialId,
    provider
  }: {
    socialId: User['socialId'];
    provider: User['provider'];
  }): Promise<NullableType<User>> {
    //@ts-ignore
    return this.usersRepository.findBySocialIdAndProvider({
      socialId,
      provider
    });
  }

  async update(id: User['_id'], payload: DeepPartial<User>): Promise<User | null> {
    const clonedPayload = { ...payload };

    if (clonedPayload.password && clonedPayload.previousPassword !== clonedPayload.password) {
      const salt = await bcrypt.genSalt();
      clonedPayload.password = await bcrypt.hash(clonedPayload.password, salt);
    }

    if (clonedPayload.email) {
      //@ts-ignore
      const userObject = await this.usersRepository.findByEmail(clonedPayload.email);

      if (userObject && userObject.id !== id) {
        throw new UnprocessableEntityException({
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: {
            email: 'emailAlreadyExists'
          }
        });
      }
    }

    if (clonedPayload.photo?.id) {
      const fileObject = await this.filesService.findById(clonedPayload.photo.id);
      if (!fileObject) {
        throw new UnprocessableEntityException({
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: {
            photo: 'imageNotExists'
          }
        });
      }
      clonedPayload.photo = fileObject;
    }

    //@ts-ignore
    return this.usersRepository.update(id, clonedPayload);
  }

  async remove(id: User['_id']): Promise<void> {
    //@ts-ignore
    await this.usersRepository.remove(id);
  }
}
