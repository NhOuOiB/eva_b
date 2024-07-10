const express = require('express');
const router = express.Router();
const permissionController = require('../controllers/permission');

router.get('/getAccount', permissionController.getAccount);

router.get('/getAccountById', permissionController.getAccountById);

router.post('/addAccount', permissionController.addAccount);

router.put('/updateAccount', permissionController.updateAccount);

router.delete('/deleteAccount', permissionController.deleteAccount);

router.get('/getAccountPermissions', permissionController.getAccountPermissions);

router.get('/getAccountPermissionsById', permissionController.getAccountPermissionsById);

router.post('/addAccountPermissions', permissionController.addAccountPermissions);

router.put('/updateAccountPermissions', permissionController.updateAccountPermissions);

router.delete('/deleteAccountPermissions', permissionController.deleteAccountPermissions);

module.exports = router;
