const express = require('express');
const router = express.Router();
const quickSearchController = require('../controllers/quickSearch');

router.get('/getSearchCondition', quickSearchController.getSearchCondition);

router.get('/getDeviceDetail', quickSearchController.getDeviceDetail);

module.exports = router;
