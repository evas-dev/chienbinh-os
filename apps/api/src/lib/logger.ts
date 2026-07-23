import pino from 'pino';
import { env } from '../config/env.js';

/**
 * Logger dùng chung.
 *
 * Khi dev: in ra dạng dễ đọc, có màu, giờ Việt Nam.
 * Khi production: in JSON để công cụ thu thập log xử lý được.
 */
export const logger = pino(
  env.NODE_ENV === 'development'
    ? {
        level: 'debug',
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:dd/mm/yyyy HH:MM:ss',
            ignore: 'pid,hostname',
          },
        },
      }
    : { level: 'info' },
);
