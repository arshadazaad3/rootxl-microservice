import appConfig from './app.config';
import middlewareConfig from './middleware.config';

import databaseConfig from '../database/config/database.config';
import authConfig from '../modules/auth/config/auth.config';
import mailConfig from '../modules/mail/config/mail.config';
import fileConfig from '../services/files/config/file.config';
import googleConfig from '../modules/auth-google/config/google.config';
import queueConfig from '../services/queue/config/queue.config';
import cacheConfig from '../services/cache/config/cache.config';

export default [
  appConfig,
  databaseConfig,
  authConfig,
  mailConfig,
  fileConfig,
  googleConfig,
  queueConfig,
  cacheConfig,
  middlewareConfig
];
