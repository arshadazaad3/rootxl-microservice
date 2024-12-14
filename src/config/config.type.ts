import { MailConfig } from 'modules/mail/config/mail-config.type';

import { AppConfig } from './app-config.type';
import { FileConfig } from '../services/files/config/file-config.type';

export type AllConfigType = {
  app: AppConfig;
  file: FileConfig;
  mail: MailConfig;
};
