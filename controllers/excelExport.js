const excelExportModel = require('../models/excelExport');

async function getOrder(req, res) {
  const { type, date } = req.query;
  let data = await excelExportModel.getOrder(type, date);
  res.json(data);
}

async function getExcelData(req, res) {
  const { type, date } = req.query;
  let data = await excelExportModel.getExcelData(type, date);
  res.json(data);
}

module.exports = {
  getOrder,
  getExcelData,
};
