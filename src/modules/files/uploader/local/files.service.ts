/* eslint-disable @typescript-eslint/ban-ts-comment */
import { HttpStatus, Injectable, UnprocessableEntityException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { AllConfigType } from 'config/config.type';
import { FileType } from 'database/repositories/core/files/domain/file';

@Injectable()
export class FilesLocalService {
  constructor(private readonly configService: ConfigService<AllConfigType>) {}

  async create(file: Express.Multer.File): Promise<{ file: FileType }> {
    if (!file) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          file: 'selectFile'
        }
      });
    }

    return {
      // @ts-ignore
      file: await this.fileRepository.create({
        path: `/${this.configService.get('app.apiPrefix', {
          infer: true
        })}/v1/${file.path}`
      })
    };
  }
}
