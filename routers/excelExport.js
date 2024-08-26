const express = require('express');
const router = express.Router();
const excelExportController = require('../controllers/excelExport');

router.get('/getOrder', excelExportController.getOrder);

router.get('/getExcelData', excelExportController.getExcelData);

module.exports = router;
