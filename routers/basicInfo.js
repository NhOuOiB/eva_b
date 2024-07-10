const express = require('express');
const router = express.Router();
const basicInfoController = require('../controllers/basicInfo');

router.get('/getDevice', basicInfoController.getDevice);

router.post('/addDevice', basicInfoController.addDevice)

router.put('/updateDevice', basicInfoController.updateDevice);

router.put('/deleteDevice', basicInfoController.deleteDevice);

router.get('/getDeviceHistory', basicInfoController.getDeviceHistory);

router.get('/getArea', basicInfoController.getArea);

router.post('/addArea', basicInfoController.addArea);

router.put('/updateArea', basicInfoController.updateArea);

router.put('/deleteArea', basicInfoController.deleteArea);

router.get('/getAircraftNumber', basicInfoController.getAircraftNumber);

router.post('/addAircraftNumber', basicInfoController.addAircraftNumber);

router.put('/updateAircraftNumber', basicInfoController.updateAircraftNumber);

router.put('/deleteAircraftNumber', basicInfoController.deleteAircraftNumber);

module.exports = router;
