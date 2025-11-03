import { Router } from 'express';
import { AppContext } from '../types/index.mjs';
import v1 from './v1/index.mjs';

const router = Router();

export default function (context: AppContext): Router {
  router.use('/v1', v1(context));

  return router;
}
