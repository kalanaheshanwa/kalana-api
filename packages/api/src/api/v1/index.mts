import { Router } from 'express';
import { AppContext } from '../../types/index.mjs';
import blog from './blog/index.mjs';
import contact from './contact/index.mjs';

const router = Router();

export default function (context: AppContext): Router {
  router.use('/contact', contact(context));
  router.use('/blog', blog(context));

  return router;
}
