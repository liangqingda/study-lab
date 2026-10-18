import 'dotenv/config';
import path from 'node:path';

import { readConfig } from './consts/config';
import { createApp } from './services/app';
import { createPostgresPool } from './services/postgres';
import { createRedisClient } from './services/redis';

const config = readConfig();

/*
 * 生产态未显式设置 WEB_DIST_DIR 时，回退到编译产物相对路径：
 * apps/api/build/../../web/dist = apps/web/dist。
 */
const resolvedConfig = config.webDistDir
  ? config
  : { ...config, webDistDir: path.resolve(__dirname, '../../web/dist') };

const postgres = resolvedConfig.databaseUrl
  ? createPostgresPool(resolvedConfig.databaseUrl)
  : undefined;
const redis = createRedisClient(resolvedConfig.redisUrl);
const server = createApp(resolvedConfig, postgres, redis).listen(
  resolvedConfig.httpPort,
  () => {
    console.info(`Server running at http://localhost:${resolvedConfig.httpPort}`);
  },
);

let shuttingDown = false;

const shutdown = async () => {
  if (shuttingDown) {
    return;
  }

  shuttingDown = true;

  try {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  } catch (error) {
    console.error('[server] shutdown failed', error);
    process.exitCode = 1;
  } finally {
    try {
      await postgres?.end();
    } catch (error) {
      console.error('[postgres] pool shutdown failed', error);
      process.exitCode = 1;
    }

    try {
      redis.disconnect();
    } catch (error) {
      console.error('[redis] shutdown failed', error);
      process.exitCode = 1;
    }
  }
};

process.once('SIGINT', shutdown);
process.once('SIGTERM', shutdown);
