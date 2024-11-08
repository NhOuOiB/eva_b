const moment = require('moment');
const pool = require('../utils/db');
const mssql = require('mssql');

async function getOrder(type, dateArr) {
  let connection = await pool.connect();
  try {
    if (!Array.isArray(dateArr)) {
      dateArr = [dateArr];
    }
    const result = await Promise.all(dateArr.map(async (date) => {
      const request = new mssql.Request(connection);

      request.input('date', mssql.VarChar, date);

      let res;
      if (type === 'day') {
        res = await request.query(`SELECT * FROM [Order] WHERE OrderDate = @date`);
      } else if (type === 'month') {
        res = await request.query(`SELECT * FROM [Order] WHERE FORMAT(OrderDate, 'yyyy-MM') = @date`);
      } else {
        throw new Error('Invalid type');
      }

      return res.recordset;
    }));

    return result;
  } catch (error) {
    console.log(error);
    return {
      status: false,
      message: '伺服器錯誤',
    };
  }
}

async function getExcelData(type, dateArr) {
  let connection = await pool.connect();
  try {
    
    if(!Array.isArray(dateArr)){
      dateArr = [dateArr];
    }
    console.log(dateArr);
    const result = await Promise.all(dateArr.map(async (date) => {
          const request = new mssql.Request(connection);
      const daysInMonth = moment(date).daysInMonth();
      const daysArray = Array.from(
        {
          length: daysInMonth,
        },
        (_, i) => i + 1
      );
      const pivotColumns = daysArray.map((day) => `[${day}]`).join(', ');
    
      request.input('date', mssql.VarChar, date);
    
      let query;
      if (type === 'day') {
        const result = await pool.request().query(`
          SELECT STUFF((
          SELECT ',' + QUOTENAME(Name)
          FROM AircraftNumber
          WHERE isEnable = 1
          FOR XML PATH(''), TYPE
        ).value('.', 'NVARCHAR(MAX)'), 1, 1, '') AS cols
        `);
        const cols = result.recordset[0].cols;
    
        const dsumCols = cols
          .split(',')
          .map((col) => `SUM(${col.trim()}) AS [d${col.trim().slice(1)}`)
          .join(', ');
    
        const rsumCols = cols
          .split(',')
          .map((col) => `SUM(${col.trim()}) AS [r${col.trim().slice(1)}`)
          .join(', ');
        const coalesceCols = cols
          .split(',')
          .map((col) => `COALESCE(SUM(${col}), 0)`)
          .join(' + ');
        const dCols = cols
          .split(',')
          .map((col) => `d.[d${col.trim().slice(1)}`)
          .join(', ');
        const rCols = cols
          .split(',')
          .map((col) => `r.[r${col.trim().slice(1)}`)
          .join(', ');
    
        const demandQuery = `
          SELECT
              ID,
              DeviceName,
              ${dsumCols},
              SUM(TotalNeedQty) AS TotalNeedQty,
              COALESCE(SUM(TotalNeedQty), 0) - (${coalesceCols}) AS EnoughQty
          FROM (
              SELECT
                  d.ID,
                  d.Name AS DeviceName,
                  o.AircraftNumberName,
                  SUM(o.NeedQty) AS TotalNeedQty,
                  SUM(o.Qty) AS TotalQty,
                  o.OrderDate
              FROM
                  Device d
              LEFT JOIN
                  [Order] o ON d.ID = o.DeviceID AND o.OrderDate = @date AND o.Action = '需求'
              WHERE d.isEnable = 1    
              GROUP BY
                  d.ID, d.Name, o.AircraftNumberName, o.OrderDate
          ) AS d
          PIVOT (
              SUM(TotalQty)
              FOR AircraftNumberName IN (${cols})
          ) AS pvt
          GROUP BY
              ID, DeviceName
        `;
    
        const recycleQuery = `
          SELECT
              ID,
              DeviceName,
              ${rsumCols}
          FROM (
              SELECT
                  d.ID,
                  d.Name AS DeviceName,
                  o.AircraftNumberName,
                  o.OrderDate,
                  SUM(o.Qty) AS TotalQty
              FROM
                  Device d
              LEFT JOIN
                  [Order] o ON d.ID = o.DeviceID AND o.OrderDate = @date AND o.Action = '回收'
              WHERE d.isEnable = 1    
              GROUP BY
                  d.ID, d.Name, o.AircraftNumberName, o.OrderDate
          ) AS d
          PIVOT (
              SUM(TotalQty)
              FOR AircraftNumberName IN (${cols})
          ) AS pvt
          GROUP BY
              ID, DeviceName
        `;
    
        query = `
          WITH demand AS (
            ${demandQuery}
          ), recycle AS (
            ${recycleQuery}
          )
          SELECT
            d.ID,
            d.DeviceName,
            ${dCols},
            ${rCols},
            d.EnoughQty
          FROM demand d
          LEFT JOIN recycle r ON d.ID = r.ID
          ORDER BY d.ID
        `;
      } else if (type === 'month') {
        query = `
        SELECT 
            ID,
            Name,
            ${pivotColumns},
            MonthlyTotalQty
        FROM (
            SELECT 
                d.ID,
                d.Name,
                SUM(o.Qty) as xCount,
                FORMAT(DATEADD(DAY, 0, DATEDIFF(day, 0, o.TimeFormat)), 'dd') AS DateCreate,
                SUM(o.Qty) OVER (PARTITION BY d.ID) AS MonthlyTotalQty
            FROM 
                Device d
            LEFT JOIN 
                [Order] o ON d.Name = o.DeviceName AND FORMAT(OrderDate, 'yyyy-MM') = @date
            WHERE d.isEnable = 1
            GROUP BY d.ID, d.Name, o.TimeFormat, o.Qty
        ) AS d
        PIVOT (
            SUM(xCount)
            FOR DateCreate IN (${pivotColumns})
        ) AS pvt
      `;
      }
    
      const res = await request.query(query);
    
      return res.recordset;
    }));
    
    return result;
  } catch (error) {
    console.log(error);
    return {
      status: false,
      message: '伺服器錯誤',
    };
  }
}

module.exports = {
  getOrder,
  getExcelData,
};
