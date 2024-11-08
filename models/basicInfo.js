const pool = require('../utils/db');
const mssql = require('mssql');
const moment = require('moment');
const { get } = require('../routers/excelexport');

async function getDevice(Name) {
  let connection = await pool.connect();
  try {
    const request = new mssql.Request(connection);

    let conditions = [];
    let parameters = [];

    if (Name !== '') {
      conditions.push(`Name LIKE '%' + @Name + '%'`);
      parameters.push({ name: 'Name', type: mssql.VarChar, value: Name });
    }

    parameters.forEach((param) => request.input(param.name, param.type, param.value));

    const data = await request.query(
      `SELECT ID, Name FROM Device WHERE isEnable = 1 ${conditions.length > 0 ? 'AND ' + conditions.join(' AND ') : ''}`
    );
    return { data: data.recordset };
  } catch (error) {
    console.log(error);
    return { message: '伺服器錯誤' };
  }
}

async function addDevice(Name) {
  let connection = await pool.connect();
  try {
    const request = new mssql.Request(connection);

    request.input('Name', mssql.VarChar, Name);
    request.input('isEnable', mssql.Bit, true);

    const exsisted = await request.query(
      'SELECT * FROM Device WHERE Name = @Name AND isEnable = 1'
    );

    if (exsisted.recordset.length > 0) {
      return { status: false, message: '裝置名稱重複' };
    }

    const result = await request.query(
      'INSERT INTO Device (Name, isEnable) VALUES (@Name, @isEnable)'
    );

    if (result.rowsAffected[0] === 0) {
      return { status: false, message: '新增失敗' };
    }
    return { status: true, message: '新增成功' };
  } catch (error) {
    console.log(error);
    return { status: false, message: '伺服器錯誤' };
  }
}

async function updateDevice(ID, Name) {
  let connection = await pool.connect();
  try {
    const request = new mssql.Request(connection);

    console.log(ID, Name);

    request.input('ID', mssql.Int, ID);
    request.input('Name', mssql.VarChar, Name);

    const exsisted = await request.query(
      'SELECT * FROM Device WHERE Name = @Name AND isEnable = 1'
    );

    if (exsisted.recordset.length > 0 && exsisted.recordset[0].ID !== ID) {
      return { status: false, message: '裝置名稱重複' };
    }

    const result = await request.query('UPDATE Device SET Name = @Name WHERE ID = @ID');

    if (result.rowsAffected[0] === 0) {
      return { status: false, message: '修改失敗' };
    }
    return { status: true, message: '修改成功' };
  } catch (error) {
    console.log(error);
    return { message: '伺服器錯誤' };
  }
}

async function deleteDevice(ID) {
  let connection = await pool.connect();
  try {
    const request = new mssql.Request(connection);

    request.input('ID', mssql.Int, ID);
    request.input('isEnable', mssql.Bit, false);

    const result = await request.query('UPDATE Device SET isEnable = @isEnable WHERE ID = @ID');

    if (result.rowsAffected[0] === 0) {
      return { status: false, message: '刪除失敗' };
    }
    return { status: true, message: '刪除成功' };
  } catch (error) {
    console.log(error);
    return { message: '伺服器錯誤' };
  }
}

async function getDeviceHistory(Name, AreaName, Model, Region, Location, EPC, No, page, pageSize) {
  let connection = await pool.connect();
  try {
    const request = new mssql.Request(connection);

    let conditions = [];
    let parameters = [];

    if (Name !== '' && Name !== undefined) {
      conditions.push(`dd.Name LIKE '%' + @Name + '%'`);
      parameters.push({ name: 'Name', type: mssql.VarChar, value: Name });
    }

    if (AreaName !== '' && AreaName !== undefined) {
      conditions.push(`a.AreaName LIKE '%' + @AreaName + '%'`);
      parameters.push({ name: 'AreaName', type: mssql.VarChar, value: AreaName });
    }

    if (Model !== '' && Model !== undefined) {
      conditions.push(`dd.Model LIKE '%' + @Model + '%'`);
      parameters.push({ name: 'Model', type: mssql.VarChar, value: Model });
    }

    if (Region !== '' && Region !== undefined) {
      conditions.push(`dd.Region LIKE '%' + @Region + '%'`);
      parameters.push({ name: 'Region', type: mssql.VarChar, value: Region });
    }

    if (Location !== '' && Location !== undefined) {
      conditions.push(`dd.Location LIKE '%' + @Location + '%'`);
      parameters.push({ name: 'Location', type: mssql.VarChar, value: Location });
    }

    if (EPC !== '' && EPC !== undefined) {
      conditions.push(`dh.EPC LIKE '%' + @EPC + '%'`);
      parameters.push({ name: 'EPC', type: mssql.VarChar, value: EPC });
    }

    if (No !== '' && No !== undefined) {
      conditions.push(`dd.No LIKE '%' + @No + '%'`);
      parameters.push({ name: 'No', type: mssql.VarChar, value: No });
    }

    const pageNumber = page ? parseInt(page) : 1;
    const offset = (pageNumber - 1) * pageSize;

    parameters.forEach((param) => request.input(param.name, param.type, param.value));

    const totalCount = await request.query(
      `SELECT COUNT(*) AS totalCount FROM DeviceHistory dh LEFT JOIN DeviceDetail dd ON dh.EPC = dd.EPC LEFT JOIN Area a ON dh.AreaID = a.ID ${conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : ''}`
    );

    const data = await request.query(
      `SELECT dh.ID, dh.EPC, a.AreaName, dd.Name, dd.Model, dd.IsRFID, dd.Region, dd.Location, dd.No, dh.Latitude, dh.Longitude, dh.RecordTime FROM DeviceHistory dh LEFT JOIN DeviceDetail dd ON dh.EPC = dd.EPC LEFT JOIN Area a ON dh.AreaID = a.ID ${conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : ''} ORDER BY RecordTime DESC OFFSET ${offset} ROWS FETCH NEXT ${pageSize} ROWS ONLY`
    );
    return { totalCount: totalCount.recordset[0].totalCount, data: data.recordset };
  } catch (error) {
    console.log(error);
    return { message: '伺服器錯誤' };
  }
}

async function getDeviceDetail(Name, AreaID, Model, Region, Location, page, pageSize) {
  let connection = await pool.connect();
  try {
    const request = new mssql.Request(connection);

    let conditions = [];
    let parameters = [];

    if (Name !== '' && Name !== undefined) {
      conditions.push(`dd.Name LIKE '%' + @Name + '%'`);
      parameters.push({ name: 'Name', type: mssql.VarChar, value: Name });
    }
    console.log(AreaID);
    if (AreaID !== '' && AreaID !== undefined) {
      conditions.push(`dd.AreaID = @AreaID`);
      parameters.push({ name: 'AreaID', type: mssql.VarChar, value: AreaID });
    }

    if (Model !== '' && Model !== undefined) {
      conditions.push(`dd.Model LIKE '%' + @Model + '%'`);
      parameters.push({ name: 'Model', type: mssql.VarChar, value: Model });
    }

    if (Region !== '' && Region !== undefined) {
      conditions.push(`dd.Region LIKE '%' + @Region + '%'`);
      parameters.push({ name: 'Region', type: mssql.VarChar, value: Region });
    }

    if (Location !== '' && Location !== undefined) {
      conditions.push(`dd.Location LIKE '%' + @Location + '%'`);
      parameters.push({ name: 'Location', type: mssql.VarChar, value: Location });
    }

    const pageNumber = page ? parseInt(page) : 1;
    const offset = (pageNumber - 1) * pageSize;

    parameters.forEach((param) => request.input(param.name, param.type, param.value));

    const totalCount = await request.query(
      `SELECT COUNT(*) AS totalCount FROM DeviceDetail dd LEFT JOIN Area a ON dd.AreaID = a.ID LEFT JOIN Device d ON dd.DeviceID = d.ID ${conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : ''}`
    );

    let data = await request.query(
      `SELECT dd.ID, dd.DeviceID, dd.EPC, dd.AreaID, dd.Name, dd.Model, dd.IsRFID, dd.Region, dd.Location, dd.Direction, dd.No, dd.ETMS, dd.Longitude, dd.Latitude, dd.RecordTime 
      FROM DeviceDetail dd 
      LEFT JOIN Area a ON dd.AreaID = a.ID 
      LEFT JOIN Device d ON dd.DeviceID = d.ID 
      ${conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : ''} 
      ORDER BY d.Name, dd.ID
      OFFSET ${offset} ROWS FETCH NEXT ${pageSize} ROWS ONLY`
    );
    console.log(pageNumber, offset, pageSize);
    return { totalCount: totalCount.recordset[0].totalCount, data: data.recordset };
  } catch (error) {
    console.log(error);
    return { message: '伺服器錯誤' };
  }
}

async function addDeviceDetail(
  DeviceID,
  AreaID,
  Name,
  Model,
  Region,
  Location,
  Direction,
  No,
  ETMS,
  UserStamp
) {
  let connection = await pool.connect();
  try {
    const request = new mssql.Request(connection);

    request.input('DeviceID', mssql.Int, DeviceID);
    request.input('AreaID', mssql.Int, AreaID);
    request.input('Name', mssql.VarChar, Name);
    request.input('Model', mssql.VarChar, Model);
    request.input('Region', mssql.VarChar, Region);
    request.input('Location', mssql.VarChar, Location);
    request.input('Direction', mssql.VarChar, Direction);
    request.input('No', mssql.VarChar, No);
    request.input('ETMS', mssql.VarChar, ETMS);
    request.input('RecordTime', mssql.DateTime, moment().format('YYYY-MM-DD HH:mm:ss'));
    request.input('UserStamp', mssql.VarChar, UserStamp);

    const result = await request.query(
      'INSERT INTO DeviceDetail (DeviceID, AreaID, Name, Model, Region, Location, Direction, No, ETMS, RecordTime, UserStamp) VALUES (@DeviceID, @AreaID, @Name, @Model, @Region, @Location, @Direction, @No, @ETMS, @RecordTime, @UserStamp)'
    );

    if (result.rowsAffected[0] === 0) {
      return { status: false, message: '新增失敗' };
    }
    return { status: true, message: '新增成功' };
  } catch (error) {
    console.log(error);
    return { status: false, message: '伺服器錯誤' };
  }
}

async function updateDeviceDetail(
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
  UserStamp
) {
  let connection = await pool.connect();
  try {
    const request = new mssql.Request(connection);

    request.input('ID', mssql.Int, ID);
    request.input('DeviceID', mssql.Int, DeviceID);
    request.input('AreaID', mssql.Int, AreaID);
    request.input('Name', mssql.VarChar, Name);
    request.input('Model', mssql.VarChar, Model);
    request.input('Region', mssql.VarChar, Region);
    request.input('Location', mssql.VarChar, Location);
    request.input('Direction', mssql.VarChar, Direction);
    request.input('No', mssql.VarChar, No);
    request.input('ETMS', mssql.VarChar, ETMS);
    request.input('RecordTime', mssql.DateTime, moment().format('YYYY-MM-DD HH:mm:ss'));
    request.input('UserStamp', mssql.VarChar, UserStamp);

    const result = await request.query(
      'UPDATE DeviceDetail SET DeviceID = @DeviceID, AreaID = @AreaID, Name = @Name, Model = @Model, Region = @Region, Location = @Location, Direction = @Direction, No = @No, ETMS = @ETMS, RecordTime = @RecordTime, UserStamp = @UserStamp WHERE ID = @ID'
    );

    if (result.rowsAffected[0] === 0) {
      return { status: false, message: '修改失敗' };
    }
    return { status: true, message: '修改成功' };
  } catch (error) {
    console.log(error);
    return { status: false, message: '伺服器錯誤' };
  }
}

async function getArea(AreaName) {
  let connection = await pool.connect();
  try {
    const request = new mssql.Request(connection);

    let conditions = [];
    let parameters = [];

    if (AreaName !== '') {
      conditions.push(`AreaName LIKE '%' + @AreaName + '%'`);
      parameters.push({ name: 'AreaName', type: mssql.VarChar, value: AreaName });
    }

    parameters.forEach((param) => request.input(param.name, param.type, param.value));

    const data = await request.query(
      `SELECT ID, AreaName FROM Area WHERE isEnable = 1 ${conditions.length > 0 ? 'AND ' + conditions.join(' AND ') : ''}`
    );
    return { data: data.recordset };
  } catch (error) {
    console.log(error);
    return { message: '伺服器錯誤' };
  }
}

async function addArea(AreaName, UserStamp) {
  let connection = await pool.connect();
  try {
    const request = new mssql.Request(connection);

    request.input('AreaName', mssql.VarChar, AreaName);
    request.input('UserStamp', mssql.VarChar, UserStamp);

    const exsisted = await request.query(
      'SELECT * FROM Area WHERE AreaName = @AreaName AND isEnable = 1'
    );

    if (exsisted.recordset.length > 0) {
      return { status: false, message: '裝置名稱重複' };
    }

    const result = await request.query(
      'INSERT INTO Area (AreaName, UserStamp, isEnable) VALUES (@AreaName, @UserStamp, 1)'
    );

    if (result.rowsAffected[0] === 0) {
      return { status: false, message: '新增失敗' };
    }
    return { status: true, message: '新增成功' };
  } catch (error) {
    console.log(error);
    return { status: false, message: '伺服器錯誤' };
  }
}

async function updateArea(ID, AreaName, UserStamp) {
  let connection = await pool.connect();
  try {
    const request = new mssql.Request(connection);

    request.input('ID', mssql.Int, ID);
    request.input('AreaName', mssql.VarChar, AreaName);
    request.input('UserStamp', mssql.VarChar, UserStamp);
    request.input('DateStamp', mssql.DateTime, moment().format('YYYY-MM-DD HH:mm:ss'));

    const exsisted = await request.query(
      'SELECT * FROM Area WHERE AreaName = @AreaName AND isEnable = 1'
    );

    if (exsisted.recordset.length > 0 && exsisted.recordset[0].ID !== ID) {
      return { status: false, message: '區域名稱重複' };
    }

    const result = await request.query(
      'UPDATE Area SET AreaName = @AreaName, UserStamp = @UserStamp, DateStamp = @DateStamp WHERE ID = @ID'
    );

    if (result.rowsAffected[0] === 0) {
      return { status: false, message: '修改失敗' };
    }
    return { status: true, message: '修改成功' };
  } catch (error) {
    console.log(error);
    return { status: false, message: '伺服器錯誤' };
  }
}

async function deleteArea(ID) {
  let connection = await pool.connect();
  try {
    const request = new mssql.Request(connection);

    request.input('ID', mssql.Int, ID);
    request.input('isEnable', mssql.Bit, false);

    const result = await request.query('UPDATE Area SET isEnable = @isEnable WHERE ID = @ID');

    if (result.rowsAffected[0] === 0) {
      return { status: false, message: '刪除失敗' };
    }
    return { status: true, message: '刪除成功' };
  } catch (error) {
    console.log(error);
    return { status: false, message: '伺服器錯誤' };
  }
}

async function getAircraftNumber(Name, Model) {
  let connection = await pool.connect();
  try {
    const request = new mssql.Request(connection);

    let conditions = [];
    let parameters = [];

    if (Name !== '') {
      conditions.push(`Name LIKE '%' + @Name + '%'`);
      parameters.push({ name: 'Name', type: mssql.VarChar, value: Name });
    }

    if (Model !== '') {
      conditions.push(`Model LIKE '%' + @Model + '%'`);
      parameters.push({ name: 'Model', type: mssql.VarChar, value: Model });
    }

    parameters.forEach((param) => request.input(param.name, param.type, param.value));

    const data = await request.query(
      `SELECT ID, Name, Model FROM AircraftNumber WHERE isEnable = 1 ${conditions.length > 0 ? 'AND ' + conditions.join(' AND ') : ''}`
    );
    return { data: data.recordset };
  } catch (error) {
    console.log(error);
    return { message: '伺服器錯誤' };
  }
}

async function addAircraftNumber(Name, Model) {
  let connection = await pool.connect();
  try {
    const request = new mssql.Request(connection);

    request.input('Name', mssql.VarChar, Name);
    request.input('Model', mssql.VarChar, Model);
    request.input('isEnable', mssql.Bit, true);

    const exsisted = await request.query(
      'SELECT * FROM AircraftNumber WHERE Name = @Name AND isEnable = @isEnable'
    );

    if (exsisted.recordset.length > 0) {
      return { status: false, message: '機號名稱重複' };
    }

    const result = await request.query(
      'INSERT INTO AircraftNumber (Name, Model, isEnable) VALUES (@Name, @Model, @isEnable)'
    );

    if (result.rowsAffected[0] === 0) {
      return { status: false, message: '新增失敗' };
    }
    return { status: true, message: '新增成功' };
  } catch (error) {
    console.log(error);
    return { status: false, message: '伺服器錯誤' };
  }
}

async function updateAircraftNumber(ID, Name, Model) {
  let connection = await pool.connect();
  try {
    const request = new mssql.Request(connection);

    console.log(ID, Name);

    request.input('ID', mssql.Int, ID);
    request.input('Name', mssql.VarChar, Name);
    request.input('Model', mssql.VarChar, Model);

    const exsisted = await request.query(
      'SELECT * FROM AircraftNumber WHERE Name = @Name AND isEnable = 1'
    );

    if (exsisted.recordset.length > 0 && exsisted.recordset[0].ID !== ID) {
      return { status: false, message: '機號名稱重複' };
    }

    const result = await request.query(
      'UPDATE AircraftNumber SET Name = @Name, Model = @Model WHERE ID = @ID'
    );

    if (result.rowsAffected[0] === 0) {
      return { status: false, message: '修改失敗' };
    }
    return { status: true, message: '修改成功' };
  } catch (error) {
    console.log(error);
    return { status: false, message: '伺服器錯誤' };
  }
}

async function deleteAircraftNumber(ID) {
  let connection = await pool.connect();
  try {
    const request = new mssql.Request(connection);

    request.input('ID', mssql.Int, ID);
    request.input('isEnable', mssql.Bit, false);

    const result = await request.query(
      'UPDATE AircraftNumber SET isEnable = @isEnable WHERE ID = @ID'
    );

    if (result.rowsAffected[0] === 0) {
      return { status: false, message: '刪除失敗' };
    }
    return { status: true, message: '刪除成功' };
  } catch (error) {
    console.log(error);
    return { status: false, message: '伺服器錯誤' };
  }
}

async function getOptions() {
  try {
    const device = await getDevice('');
    const area = await getArea('');

    return {
      DeviceID: device.data,
      AreaID: area.data,
    };
  } catch (error) {
    console.log(error);
    return { message: '伺服器錯誤' };
  }
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
