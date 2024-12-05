import { DatabaseConfig } from 'database/config/database-config.type';

import { AuthConfig } from 'modules/auth/config/auth-config.type';
import { GoogleConfig } from 'modules/auth-google/config/google-config.type';
import { MailConfig } from 'modules/mail/config/mail-config.type';

import { AppConfig } from './app-config.type';
import { FileConfig } from '../services/files/config/file-config.type';

export type AllConfigType = {
  app: AppConfig;
  auth: AuthConfig;
  database: DatabaseConfig;
  file: FileConfig;
  google: GoogleConfig;
  mail: MailConfig;
};
