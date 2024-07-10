const permissionModel = require('../models/permission');

async function getAccount(req, res) {
  let data = await permissionModel.getAccount();
  res.json(data);
}

async function getAccountById(req, res) {
  const { id } = req.query;
  console.log(req.query);
  let data = await permissionModel.getAccountById(id);
  res.json(data);
}

async function addAccount(req, res) {
  const { Account, Password, PermissionsID } = req.body;
  let data = await permissionModel.addAccount(Account, Password, PermissionsID);
  res.json(data);
}

async function updateAccount(req, res) {
  const { ID, Account, Password, PermissionsID } = req.body;
  let data = await permissionModel.updateAccount(ID, Account, Password, PermissionsID);
  res.json(data);
}

async function deleteAccount(req, res) {
  const { ID } = req.query;
  let data = await permissionModel.deleteAccount(ID);
  res.json(data);
}

async function getAccountPermissions(req, res) {
  let data = await permissionModel.getAccountPermissions();
  res.json(data);
}

async function getAccountPermissionsById(req, res) {
  const { id } = req.query;
  let data = await permissionModel.getAccountPermissionsById(id);
  res.json(data);
}

async function addAccountPermissions(req, res) {
  const { Name, Describe, IsBuildNeed, IsInventory, IsPermissions, IsSearch, IsWarehouse } = req.body;
  let data = await permissionModel.addAccountPermissions(
    Name,
    Describe,
    IsBuildNeed,
    IsInventory,
    IsPermissions,
    IsSearch,
    IsWarehouse
  );
  res.json(data);
}

async function updateAccountPermissions(req, res) {
  const { ID, Name, Describe, IsBuildNeed, IsInventory, IsPermissions, IsSearch, IsWarehouse } = req.body;
  let data = await permissionModel.updateAccountPermissions(
    ID,
    Name,
    Describe,
    IsBuildNeed,
    IsInventory,
    IsPermissions,
    IsSearch,
    IsWarehouse
  );
  res.json(data);
}

async function deleteAccountPermissions(req, res) {
  const { ID } = req.query;
  let data = await permissionModel.deleteAccountPermissions(ID);
  res.json(data);
}

module.exports = {
  getAccount,
  getAccountById,
  addAccount,
  updateAccount,
  deleteAccount,
  getAccountPermissions,
  getAccountPermissionsById,
  addAccountPermissions,
  updateAccountPermissions,
  deleteAccountPermissions,
};
