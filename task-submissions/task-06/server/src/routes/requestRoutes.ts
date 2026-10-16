import { Router } from 'express';
import type { RequestController } from '../controllers/requestController';

export function createRequestRoutes(controller: RequestController): Router {
  const router = Router();
  router.get('/', controller.list);
  router.post('/', controller.create);
  router.get('/:id', controller.getOne);
  router.put('/:id', controller.replace);
  router.delete('/:id', controller.remove);
  return router;
}
