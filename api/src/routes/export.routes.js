const router = require('express').Router();

const controller = require('../controllers/export.controller');
const validateRequest = require('../middleware/validateRequest');

router.post('/logs', validateRequest, controller.exportLogs);

router.get('/status/:jobId', controller.getStatus);

module.exports = router;
