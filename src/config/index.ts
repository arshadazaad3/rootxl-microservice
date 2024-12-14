import appConfig from './app.config';
import middlewareConfig from './middleware.config';

import mailConfig from '../modules/mail/config/mail.config';
import fileConfig from '../services/files/config/file.config';
import queueConfig from '../services/queue/config/queue.config';
import cacheConfig from '../services/cache/config/cache.config';

export default [appConfig, mailConfig, fileConfig, queueConfig, cacheConfig, middlewareConfig];
