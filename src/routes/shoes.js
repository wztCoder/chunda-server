const Router = require('@koa/router');
const shoesController = require('../controllers/shoesController');
const router = new Router();

router.get('/api/shoes', shoesController.getAllShoes);
router.get('/api/shoes/:id', shoesController.getShoesById);
router.post('/api/shoes', shoesController.createShoes);
router.put('/api/shoes/:id', shoesController.updateShoes);
router.delete('/api/shoes/:id', shoesController.deleteShoes);

module.exports = router;
