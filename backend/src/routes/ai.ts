import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { requirePro } from '../middleware/proFeature';
import { aiController } from '../controllers/aiController';
import { errorHandler } from '../middleware/errorHandler';

const router = Router();

// All AI routes require authentication and Pro subscription
router.use(authenticate);
router.use(requirePro);

router.post('/conversations', (req, res, next) => {
  aiController.createConversation(req as any, res).catch(next);
});

router.get('/conversations', (req, res, next) => {
  aiController.getConversations(req as any, res).catch(next);
});

router.get('/conversations/:conversationId', (req, res, next) => {
  aiController.getConversation(req as any, res).catch(next);
});

router.post('/conversations/:conversationId/message', (req, res, next) => {
  aiController.sendMessage(req as any, res).catch(next);
});

router.delete('/conversations/:conversationId', (req, res, next) => {
  aiController.deleteConversation(req as any, res).catch(next);
});

router.post('/summarize', (req, res, next) => {
  aiController.generateSummary(req as any, res).catch(next);
});

router.post('/organize', (req, res, next) => {
  aiController.suggestOrganization(req as any, res).catch(next);
});

router.use(errorHandler);

export default router;

