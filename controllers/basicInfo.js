const basicInfoModel = require('../models/basicInfo');
const moment = require('moment');
const { get } = require('../routers/excelexport');

async function getDevice(req, res) {
  const { Name } = req.query;
  let data = await basicInfoModel.getDevice(Name);
  res.json(data);
}

async function addDevice(req, res) {
  const { Name } = req.body;
  let data = await basicInfoModel.addDevice(Name);
  res.json(data);
}

async function updateDevice(req, res) {
  const { ID, Name } = req.body;
  let data = await basicInfoModel.updateDevice(ID, Name);
  res.json(data);
}

async function deleteDevice(req, res) {
  const { ID } = req.body;
  let data = await basicInfoModel.deleteDevice(ID);
  res.json(data);
}

async function getDeviceHistory(req, res) {
  const { Name, AreaName, Model, Region, Location, page, pageSize } = req.query;
  let data = await basicInfoModel.getDeviceHistory(Name, AreaName, Model, Region, Location, page, pageSize);
  res.json(data);
}

async function getDeviceDetail(req, res) {
  const { Name, AreaID, Model, Region, Location, page, pageSize } = req.query;
  let data = await basicInfoModel.getDeviceDetail(Name, AreaID, Model, Region, Location, page, pageSize);
  res.json(data);
}

async function addDeviceDetail(req, res) {
  const {
    DeviceID,
    AreaID,
    Name,
    Model,
    Region,
    Location,
    Direction,
    No,
    ETMS,
    UserStamp,
  } = req.body;
  let data = await basicInfoModel.addDeviceDetail(DeviceID, AreaID, Name, Model, Region, Location, Direction, No, ETMS, UserStamp);
  res.json(data);
}

async function updateDeviceDetail(req, res) {
  const {
    ID,
    DeviceID,
    AreaID,
    Name,
    Model,
    Region,
    Location,
    Direction,
    No,
    ETMS,
    UserStamp,
  } = req.body;
  let data = await basicInfoModel.updateDeviceDetail(ID, DeviceID, AreaID, Name, Model, Region, Location, Direction, No, ETMS, UserStamp);
  res.json(data);
}

async function getArea(req, res) {
  const { AreaName } = req.query;
  let data = await basicInfoModel.getArea(AreaName);
  res.json(data);
}

async function addArea(req, res) {
  const { AreaName, UserStamp } = req.body;
  let data = await basicInfoModel.addArea(AreaName, UserStamp);
  res.json(data);
}

async function updateArea(req, res) {
  const { ID, AreaName, UserStamp } = req.body;
  let data = await basicInfoModel.updateArea(ID, AreaName, UserStamp);
  res.json(data);
}

async function deleteArea(req, res) {
  const { ID } = req.body;
  let data = await basicInfoModel.deleteArea(ID);
  res.json(data);
}

async function getAircraftNumber(req, res) {
  const { Name } = req.query;
  let data = await basicInfoModel.getAircraftNumber(Name);
  res.json(data);
}

async function addAircraftNumber(req, res) {
  const { Name } = req.body;
  let data = await basicInfoModel.addAircraftNumber(Name);
  res.json(data);
}

async function updateAircraftNumber(req, res) {
  const { ID, Name } = req.body;
  let data = await basicInfoModel.updateAircraftNumber(ID, Name);
  res.json(data);
}

async function deleteAircraftNumber(req, res) {
  const { ID } = req.body;
  let data = await basicInfoModel.deleteAircraftNumber(ID);
  res.json(data);
}

async function getOptions(req, res) {
  let data = await basicInfoModel.getOptions();
  res.json(data);
}

module.exports = {
  getDevice,
  addDevice,
  updateDevice,
  deleteDevice,
  getDeviceHistory,
  getDeviceDetail,
  addDeviceDetail,
  updateDeviceDetail,
  getArea,
  addArea,
  updateArea,
  deleteArea,
  getAircraftNumber,
  addAircraftNumber,
  updateAircraftNumber,
  deleteAircraftNumber,
  getOptions,
};
