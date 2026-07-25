import { Router } from 'express';
import { nhanSuRouter } from './modules/nhan-su/nhan-su.routes.js';
import { congViecRouter } from './modules/cong-viec/cong-viec.routes.js';
import { hangMucRouter } from './modules/hang-muc/hang-muc.routes.js';
import { tepDinhKemRouter } from './modules/tep-dinh-kem/tep-dinh-kem.routes.js';
import { bangToiHanRouter } from './modules/bang-toi-han/bang-toi-han.routes.js';
import { cauHinhRouter } from './modules/cau-hinh/cau-hinh.routes.js';

/** Gom toàn bộ router nghiệp vụ. Được gắn vào /api trong app.ts. */
export const apiRouter = Router();

apiRouter.use('/nhan-su', nhanSuRouter);
apiRouter.use('/cong-viec', congViecRouter);
apiRouter.use('/hang-muc', hangMucRouter);
apiRouter.use('/tep', tepDinhKemRouter);
apiRouter.use('/bang-toi-han', bangToiHanRouter);
apiRouter.use('/cau-hinh', cauHinhRouter);
