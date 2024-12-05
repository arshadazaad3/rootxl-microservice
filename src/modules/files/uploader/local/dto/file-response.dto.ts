import { ApiResponseProperty } from '@nestjs/swagger';
import { FileType } from 'database/repositories/core/files/domain/file';

export class FileResponseDto {
  @ApiResponseProperty({
    type: () => FileType
  })
  file: FileType;
}
