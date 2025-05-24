const Koa = require('koa');
const Router = require('@koa/router');
const { get, set } = require('@vercel/edge-config');

// Create Koa app instance
const app = new Koa();

// Middleware to parse JSON request bodies
app.use(async (ctx, next) => {
  if (ctx.request.is('json')) {
    try {
      ctx.request.body = await new Promise((resolve, reject) => {
        let data = '';
        ctx.req.on('data', chunk => data += chunk);
        ctx.req.on('end', () => resolve(JSON.parse(data)));
        ctx.req.on('error', err => reject(err));
      });
    } catch (err) {
      ctx.status = 400;
      ctx.body = { error: 'Invalid JSON' };
      return;
    }
  }
  await next();
});

// Create router instance
const router = new Router();

// Store activation data in Vercel Edge Config
async function storeActivation(data) {
  try {
    // Get existing activations
    const activations = await get('activations') || [];
    
    // Add new activation with timestamp
    activations.push({
      id: Date.now(),
      ...data,
      timestamp: new Date().toISOString()
    });
    
    // Store updated list
    await set('activations', activations);
    return true;
  } catch (error) {
    console.error('Error storing activation:', error);
    return false;
  }
}

// Get all activations from Vercel Edge Config
async function getAllActivations() {
  try {
    return await get('activations') || [];
  } catch (error) {
    console.error('Error getting activations:', error);
    return [];
  }
}

// POST /addActivate endpoint
router.post('/addActivate', async (ctx) => {
  const { 客户名称, 手机号, 类型, 时间 } = ctx.request.body;
  
  // Validate required fields
  if (!客户名称 || !手机号 || !类型 || !时间) {
    ctx.status = 400;
    ctx.body = { error: 'Missing required fields' };
    return;
  }
  
  // Store activation data
  const success = await storeActivation({
    客户名称,
    手机号,
    类型,
    时间
  });
  
  if (success) {
    ctx.body = { message: 'Activation stored successfully' };
  } else {
    ctx.status = 500;
    ctx.body = { error: 'Failed to store activation' };
  }
});

// GET /activations endpoint
router.get('/activations', async (ctx) => {
  const activations = await getAllActivations();
  ctx.body = activations;
});

// Apply router middleware
app.use(router.routes());
app.use(router.allowedMethods());

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
