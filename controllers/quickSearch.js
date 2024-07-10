const quickSearchModel = require('../models/quickSearch');

async function getSearchCondition(req, res) {
  let data = await quickSearchModel.getSearchCondition();
  res.json(data);
}

async function getDeviceDetail(req, res) {
  const { area, location, aircraftNumber, direction, name } = req.query;
  let data = await quickSearchModel.getDeviceDetail(area, location, aircraftNumber, direction, name);
  res.json(data);
}

module.exports = {
  getSearchCondition,
  getDeviceDetail,
};
