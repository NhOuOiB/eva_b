const pool = require('../utils/db');
const mssql = require('mssql');

async function getSearchCondition() {
  let connection = await pool.connect();
  try {
    const request = new mssql.Request(connection);

    const [areaRes, aircraftNumberRes, locationRes, directionRes] = await Promise.all([
      request.query(
        'SELECT a.ID, a.AreaName FROM DeviceDetail dd INNER JOIN Area a ON dd.AreaID = a.ID GROUP BY dd.AreaID, a.ID, a.AreaName'
      ),
      request.query('SELECT dd.Model FROM DeviceDetail dd GROUP BY dd.Model'),
      request.query('SELECT dd.Location FROM DeviceDetail dd GROUP BY dd.Location'),
      request.query('SELECT dd.Direction FROM DeviceDetail dd GROUP BY dd.Direction'),
    ]);

    return {
      area: areaRes.recordset,
      aircraftNumber: aircraftNumberRes.recordset,
      location: locationRes.recordset,
      direction: directionRes.recordset,
    };
  } catch (error) {
    console.log(error);
    return { message: '伺服器錯誤' };
  } finally {
    connection.close();
  }
}

async function getDeviceDetail(area, location, aircraftNumber, direction, name) {
  let connection = await pool.connect();
  try {
    const request = new mssql.Request(connection);

    let conditions = [];
    let parameters = [];

    if (area !== '') {
      conditions.push('dd.AreaID = @area');
      parameters.push({ name: 'area', type: mssql.Int, value: area });
    }

    if (location !== '') {
      conditions.push('dd.Location = @location');
      parameters.push({ name: 'location', type: mssql.VarChar, value: location });
    }

    if (aircraftNumber !== '') {
      conditions.push('dd.Model = @aircraftNumber');
      parameters.push({ name: 'aircraftNumber', type: mssql.VarChar, value: aircraftNumber });
    }

    if (direction !== '') {
      conditions.push('dd.Direction = @direction');
      parameters.push({ name: 'direction', type: mssql.VarChar, value: direction });
    }

    if (name !== '') {
      conditions.push(`dd.Name LIKE '%' + @name + '%'`);
      parameters.push({ name: 'name', type: mssql.VarChar, value: name });
    }

    parameters.forEach((param) => request.input(param.name, param.type, param.value));

    let data = await request.query(
      `SELECT dd.Model, dd.Location, dd.Direction, dd.Name, a.AreaName, dd.Longitude, dd.Latitude FROM DeviceDetail dd INNER JOIN Area a ON dd.AreaID = a.ID ${conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : ''}`
    );

    return data.recordset;
  } catch (error) {
    console.log(error);
    return { message: '伺服器錯誤' };
  } finally {
    connection.close();
  }
}

module.exports = {
  getSearchCondition,
  getDeviceDetail,
};
