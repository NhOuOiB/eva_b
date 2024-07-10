const pool = require('../utils/db');
const mssql = require('mssql');
const moment = require('moment');

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
    return data.recordset;
  } catch (error) {
    console.log(error);
    return { message: '伺服器錯誤' };
  } finally {
    connection.close();
  }
}

async function addDevice(Name) {
  let connection = await pool.connect();
  try {
    const request = new mssql.Request(connection);

    request.input('Name', mssql.VarChar, Name);
    request.input('isEnable', mssql.Bit, true);

    const exsisted = await request.query('SELECT * FROM Device WHERE Name = @Name AND isEnable = 1');

    if (exsisted.recordset.length > 0) {
      return { status: false, message: '裝置名稱重複' };
    }

    const result = await request.query('INSERT INTO Device (Name, isEnable) VALUES (@Name, @isEnable)');

    if (result.rowsAffected[0] === 0) {
      return { status: false, message: '新增失敗' };
    }
    return { status: true, message: '新增成功' };
  } catch (error) {
    console.log(error);
    return { status: false, message: '伺服器錯誤' };
  } finally {
    connection.close();
  }
}

async function updateDevice(ID, Name) {
  let connection = await pool.connect();
  try {
    const request = new mssql.Request(connection);

    console.log(ID, Name);

    request.input('ID', mssql.Int, ID);
    request.input('Name', mssql.VarChar, Name);

    const exsisted = await request.query('SELECT * FROM Device WHERE Name = @Name AND isEnable = 1');

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
  } finally {
    connection.close();
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
  } finally {
    connection.close();
  }
}

async function getDeviceHistory(Name, AreaName, Model, Region, Location) {
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
 
    parameters.forEach((param) => request.input(param.name, param.type, param.value));

    const data = await request.query(
      `SELECT dh.ID, dh.EPC, a.AreaName, dd.Name, dd.Model, dd.Describe, dd.IsRFID, dd.Region, dd.Location, dd.Code, dh.Latitude, dh.Longitude, dh.RecordTime FROM DeviceHistory dh INNER JOIN DeviceDetail dd ON dh.EPC = dd.EPC INNER JOIN Area a ON dh.AreaID = a.ID ${conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : ''} ORDER BY RecordTime DESC`
    );
    return data.recordset;
  } catch (error) {
    console.log(error);
    return { message: '伺服器錯誤' };
  } finally {
    connection.close();
  }
}

async function getArea(AreaName) {
  let connection = await pool.connect();
  try {
    const request = new mssql.Request(connection);

    let conditions = [];
    let parameters = [];

    if (AreaName !== '' ) {
      conditions.push(`AreaName LIKE '%' + @AreaName + '%'`);
      parameters.push({ name: 'AreaName', type: mssql.VarChar, value: AreaName });
    }

    parameters.forEach((param) => request.input(param.name, param.type, param.value));

    const data = await request.query(
      `SELECT ID, AreaName FROM Area WHERE isEnable = 1 ${conditions.length > 0 ? 'AND ' + conditions.join(' AND ') : ''}`
    );
    return data.recordset;
  } catch (error) {
    console.log(error);
    return { message: '伺服器錯誤' };
  } finally {
    connection.close();
  }
}

async function addArea(AreaName, UserStamp) {
  let connection = await pool.connect();
  try {
    const request = new mssql.Request(connection);

    request.input('AreaName', mssql.VarChar, AreaName);
    request.input('UserStamp', mssql.VarChar, UserStamp);

    const exsisted = await request.query('SELECT * FROM Area WHERE AreaName = @AreaName AND isEnable = 1');

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
  } finally {
    connection.close();
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

    const exsisted = await request.query('SELECT * FROM Area WHERE AreaName = @AreaName AND isEnable = 1');

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
  } finally {
    connection.close();
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
  } finally {
    connection.close();
  }
}

async function getAircraftNumber(Name) {
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
      `SELECT ID, Name FROM AircraftNumber WHERE isEnable = 1 ${conditions.length > 0 ? 'AND ' + conditions.join(' AND ') : ''}`
    );
    return data.recordset;
  } catch (error) {
    console.log(error);
    return { message: '伺服器錯誤' };
  } finally {
    connection.close();
  }
}

async function addAircraftNumber(Name) {
  let connection = await pool.connect();
  try {
    const request = new mssql.Request(connection);

    request.input('Name', mssql.VarChar, Name);
    request.input('isEnable', mssql.Bit, true);

    const exsisted = await request.query('SELECT * FROM AircraftNumber WHERE Name = @Name AND isEnable = @isEnable');

    if (exsisted.recordset.length > 0) {
      return { status: false, message: '機號名稱重複' };
    }

    const result = await request.query('INSERT INTO AircraftNumber (Name, isEnable) VALUES (@Name, @isEnable)');

    if (result.rowsAffected[0] === 0) {
      return { status: false, message: '新增失敗' };
    }
    return { status: true, message: '新增成功' };
  } catch (error) {
    console.log(error);
    return { status: false, message: '伺服器錯誤' };
  } finally {
    connection.close();
  }
}

async function updateAircraftNumber(ID, Name) {
  let connection = await pool.connect();
  try {
    const request = new mssql.Request(connection);

    console.log(ID, Name);

    request.input('ID', mssql.Int, ID);
    request.input('Name', mssql.VarChar, Name);

    const exsisted = await request.query('SELECT * FROM AircraftNumber WHERE Name = @Name AND isEnable = 1');

    if (exsisted.recordset.length > 0 && exsisted.recordset[0].ID !== ID) {
      return { status: false, message: '機號名稱重複' };
    }

    const result = await request.query('UPDATE AircraftNumber SET Name = @Name WHERE ID = @ID');

    if (result.rowsAffected[0] === 0) {
      return { status: false, message: '修改失敗' };
    }
    return { status: true, message: '修改成功' };
  } catch (error) {
    console.log(error);
    return { status: false, message: '伺服器錯誤' };
  } finally {
    connection.close();
  }
}

async function deleteAircraftNumber(ID) {
  let connection = await pool.connect();
  try {
    const request = new mssql.Request(connection);

    request.input('ID', mssql.Int, ID);
    request.input('isEnable', mssql.Bit, false);

    const result = await request.query('UPDATE AircraftNumber SET isEnable = @isEnable WHERE ID = @ID');

    if (result.rowsAffected[0] === 0) {
      return { status: false, message: '刪除失敗' };
    }
    return { status: true, message: '刪除成功' };
  } catch (error) {
    console.log(error);
    return { status: false, message: '伺服器錯誤' };
  } finally {
    connection.close();
  }
}

module.exports = {
  getDevice,
  addDevice,
  updateDevice,
  deleteDevice,
  getDeviceHistory,
  getArea,
  addArea,
  updateArea,
  deleteArea,
  getAircraftNumber,
  addAircraftNumber,
  updateAircraftNumber,
  deleteAircraftNumber,
};
