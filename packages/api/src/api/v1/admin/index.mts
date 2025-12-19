import { Router } from 'express';
import { AppContext } from '../../../types/index.mjs';
import blog from './blog/index.mjs';
import contact from './contact/index.mjs';
import images from './images/index.mjs';
import portfolio from './portfolio/index.mjs';

const router = Router();

export default function (context: AppContext): Router {
  router.use('/blogs', blog(context));
  router.use('/contacts', contact(context));
  router.use('/portfolios', portfolio(context));
  router.use('/images', images(context));

  return router;
}
