import { Router } from 'express';
import { isAuthenticated } from '../../middleware/index.mjs';
import { AppContext } from '../../types/index.mjs';
import admin from './admin/index.mjs';
import blog from './public/blog/index.mjs';
import contact from './public/contact/index.mjs';
import portfolio from './public/portfolio/index.mjs';

const router = Router();

export default function (context: AppContext): Router {
  router.use('/admin', isAuthenticated(context), admin(context));

  // Public endpoints
  router.use('/contact', contact(context));
  router.use('/blogs', blog(context));
  router.use('/portfolios', portfolio(context));

  return router;
}
