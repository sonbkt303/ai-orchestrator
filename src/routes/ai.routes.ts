import { Router } from 'express';
import * as aiController from '../controllers/ai.controller';

const router = Router();

// POST /ai/chat — send a chat message (non-streaming)
router.post('/chat', aiController.chat);

// POST /ai/chat/stream — send a chat message with SSE streaming
router.post('/chat/stream', aiController.chatStream);

// GET /ai/conversations/:id — get conversation history
router.get('/conversations/:id', aiController.getConversation);

export default router;
