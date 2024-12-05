import { HttpStatus, Module, UnprocessableEntityException } from '@nestjs/common';
import { FilesLocalController } from './files.controller';
import { MulterModule } from '@nestjs/platform-express';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { diskStorage } from 'multer';
import { randomStringGenerator } from '@nestjs/common/utils/random-string-generator.util';

import { FilesLocalService } from './files.service';

import { AllConfigType } from 'config/config.type';
import { FileDbModule } from 'database/repositories/core/files/file.db.module';

@Module({
  imports: [
    FileDbModule,
    MulterModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService<AllConfigType>) => {
        return {
          fileFilter: (request, file, callback) => {
            if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
              return callback(
                new UnprocessableEntityException({
                  status: HttpStatus.UNPROCESSABLE_ENTITY,
                  errors: {
                    file: `cantUploadFileType`
                  }
                }),
                false
              );
            }

            callback(null, true);
          },
          storage: diskStorage({
            destination: './files',
            filename: (request, file, callback) => {
              callback(null, `${randomStringGenerator()}.${file.originalname.split('.').pop()?.toLowerCase()}`);
            }
          }),
          limits: {
            fileSize: configService.get('file.maxFileSize', { infer: true })
          }
        };
      }
    })
  ],
  controllers: [FilesLocalController],
  providers: [ConfigModule, ConfigService, FilesLocalService],
  exports: [FilesLocalService]
})
export class FilesLocalModule {}