import { Module } from '@nestjs/common';

import { FileDbModule } from 'database/repositories/core/files/file.db.module';

import { FilesService } from './files.service';
import { FilesLocalModule } from './uploader/local/files.module';
import { FilesS3Module } from './uploader/s3/files.module';
import { FilesS3PresignedModule } from './uploader/s3-presigned/files.module';
import fileConfig from '../../services/files/config/file.config';
import { FileConfig, FileDriver } from '../../services/files/config/file-config.type';

const infrastructureUploaderModule =
  (fileConfig() as FileConfig).driver === FileDriver.LOCAL
    ? FilesLocalModule
    : (fileConfig() as FileConfig).driver === FileDriver.S3
      ? FilesS3Module
      : FilesS3PresignedModule;

@Module({
  imports: [FileDbModule, infrastructureUploaderModule],
  providers: [FilesService],
  exports: [FilesService, FileDbModule]
})
export class FilesModule {}
