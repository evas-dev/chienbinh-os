import { Router } from 'express';
import { nhanSuRouter } from './modules/nhan-su/nhan-su.routes.js';
import { congViecRouter } from './modules/cong-viec/cong-viec.routes.js';
import { hangMucRouter } from './modules/hang-muc/hang-muc.routes.js';
import { tepDinhKemRouter } from './modules/tep-dinh-kem/tep-dinh-kem.routes.js';

/** Gom toàn bộ router nghiệp vụ. Được gắn vào /api trong app.ts. */
export const apiRouter = Router();

apiRouter.use('/nhan-su', nhanSuRouter);
apiRouter.use('/cong-viec', congViecRouter);
apiRouter.use('/hang-muc', hangMucRouter);
apiRouter.use('/tep', tepDinhKemRouter);
