import { Router } from 'express';
import { AppContext } from '../../types/index.mjs';
import blog from './blog/index.mjs';
import contact from './contact/index.mjs';
import portfolio from './portfolio/index.mjs';

const router = Router();

export default function (context: AppContext): Router {
  router.use('/contact', contact(context));
  router.use('/blogs', blog(context));
  router.use('/portfolios', portfolio(context));

  return router;
}
