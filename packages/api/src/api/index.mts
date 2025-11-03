import { Router } from 'express';
import { AppContext } from '../types/index.mjs';

const router = Router();

export default function (context: AppContext): Router {
  return router;
}
