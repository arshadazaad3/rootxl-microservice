import { Injectable } from '@nestjs/common';

import { NullableType } from 'utils/types/nullable.type';
import { FileType } from 'database/repositories/core/files/domain/file';

@Injectable()
export class FilesService {
  // constructor(private readonly fileRepository: FileRepository) {}

  findById(id: FileType['id']): Promise<NullableType<FileType>> {
    // @ts-ignore
    return this.fileRepository.findById(id);
  }
}
