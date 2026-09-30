import { Router } from 'express';
import authRoutes from './auth.routes.js';
import leadRoutes from './lead.routes.js';
import testRoutes from './test.routes.js';

const apiRouter = Router();

apiRouter.use('/auth', authRoutes);
apiRouter.use('/leads', leadRoutes);
apiRouter.use('/test', testRoutes);

// Health check endpoint
apiRouter.get('/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'Vibh-Anu CRM API is running',
    timestamp: new Date().toISOString()
  });
});

export default apiRouter;
