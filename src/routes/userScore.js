const Router = require('@koa/router');
const userScoreController = require('../controllers/userScoreController');
const router = new Router();

router.get('/api/userScore', userScoreController.getAllUserScore);
router.get('/api/userScore/:mobile', userScoreController.getScoreByMobile);
router.post('/api/userScore', userScoreController.createUpdateUserScore);
router.delete('/api/userScore/:mobile', userScoreController.deleteUserScore);

module.exports = router;
