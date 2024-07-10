const pool = require('../utils/db');
const mssql = require('mssql');

async function getAccount() {
  let connection = await pool.connect();
  try {
    const request = new mssql.Request(connection);

    let res = await request.query('SELECT ID, Account FROM Account');

    return res.recordset;
  } catch (error) {
    console.log(error);
    return { status: false, message: '伺服器錯誤' };
  } finally {
    connection.close();
  }
}

async function getAccountById(id) {
  let connection = await pool.connect();
  try {
    const request = new mssql.Request(connection);

    request.input('id', mssql.Int, id);

    let res = await request.query('SELECT ID, Account, Password, PermissionsID FROM Account WHERE ID = @id');

    return res.recordset;
  } catch (error) {
    console.log(error);
    return { status: false, message: '伺服器錯誤' };
  } finally {
    connection.close();
  }
}

async function addAccount(Account, Password, PermissionsID) {
  let connection = await pool.connect();
  try {
    const request = new mssql.Request(connection);

    request.input('Account', mssql.VarChar, Account);
    request.input('Password', mssql.VarChar, Password);
    request.input('PermissionsID', mssql.Int, PermissionsID);

    const IsRegistered = await request.query('SELECT COUNT(*) as Count FROM Account WHERE Account = @Account');
    if (IsRegistered.recordset[0].Count > 0) {
      return { status: false, message: '帳號重複' };
    }

    const result = await request.query(
      'INSERT INTO Account (Account, Password, PermissionsID) VALUES (@Account, @Password, @PermissionsID)'
    );

    if (result.rowsAffected[0] === 0) {
      return { status: false, message: '新增失敗' };
    } else if (result.rowsAffected[0] === 1) return { status: true, message: '新增成功' };
  } catch (error) {
    console.log(error);
    return { status: false, message: '伺服器錯誤' };
  } finally {
    connection.close();
  }
}

async function updateAccount(ID, Account, Password, PermissionsID) {
  let connection = await pool.connect();
  try {
    const request = new mssql.Request(connection);

    request.input('ID', mssql.Int, ID);
    request.input('Account', mssql.VarChar, Account);
    request.input('Password', mssql.VarChar, Password);
    request.input('PermissionsID', mssql.Int, PermissionsID);

    const IsRegistered = await request.query('SELECT COUNT(*) as Count FROM Account WHERE Account = @Account AND ID != @ID');
    if (IsRegistered.recordset[0].Count > 0) {
      return { status: false, message: '帳號重複' };
    }

    const result = await request.query(
      'UPDATE Account SET Account = @Account, Password = @Password, PermissionsID = @PermissionsID WHERE ID = @ID'
    );

    if (result.rowsAffected[0] === 0) {
      return { status: false, message: '修改失敗' };
    } else if (result.rowsAffected[0] === 1) return { status: true, message: '修改成功' };
  } catch (error) {
    console.log(error);
    return { status: false, message: '伺服器錯誤' };
  } finally {
    connection.close();
  }
}

async function deleteAccount(ID) {
  let connection = await pool.connect();
  try {
    const request = new mssql.Request(connection);

    request.input('ID', mssql.Int, ID);

    const result = await request.query('DELETE FROM Account WHERE ID = @ID');

    if (result.rowsAffected[0] === 0) {
      return { status: false, message: '刪除失敗' };
    } else if (result.rowsAffected[0] === 1) return { status: true, message: '刪除成功' };
  } catch (error) {
    console.log(error);
    return { status: false, message: '伺服器錯誤' };
  } finally {
    connection.close();
  }
}

async function getAccountPermissions() {
  let connection = await pool.connect();
  try {
    const request = new mssql.Request(connection);

    let res = await request.query('SELECT ID, Name FROM AccountPermissions');

    return res.recordset;
  } catch (error) {
    console.log(error);
    return { status: false, message: '伺服器錯誤' };
  } finally {
    connection.close();
  }
}

async function getAccountPermissionsById(id) {
  let connection = await pool.connect();
  try {
    const request = new mssql.Request(connection);

    request.input('id', mssql.Int, id);

    let res = await request.query(
      'SELECT ID, Name, Describe, IsWarehouse, IsSearch, IsInventory, IsBuildNeed, IsPermissions FROM AccountPermissions WHERE ID = @id'
    );

    return res.recordset;
  } catch (error) {
    console.log(error);
    return { status: false, message: '伺服器錯誤' };
  } finally {
    connection.close();
  }
}

async function addAccountPermissions(Name, Describe, IsBuildNeed, IsInventory, IsPermissions, IsSearch, IsWarehouse) {
  let connection = await pool.connect();
  try {
    const request = new mssql.Request(connection);

    request.input('Name', mssql.VarChar, Name);
    request.input('Describe', mssql.VarChar, Describe);
    request.input('IsBuildNeed', mssql.Bit, IsBuildNeed);
    request.input('IsInventory', mssql.Bit, IsInventory);
    request.input('IsPermissions', mssql.Bit, IsPermissions);
    request.input('IsSearch', mssql.Bit, IsSearch);
    request.input('IsWarehouse', mssql.Bit, IsWarehouse);

    const result = await request.query(
      'INSERT INTO AccountPermissions (Name, Describe, IsBuildNeed, IsInventory, IsPermissions, IsSearch, IsWarehouse) VALUES (@Name, @Describe, @IsBuildNeed, @IsInventory, @IsPermissions, @IsSearch, @IsWarehouse)'
    );

    if (result.rowsAffected[0] === 0) {
      return { status: false, message: '新增失敗' };
    } else if (result.rowsAffected[0] === 1) return { status: true, message: '新增成功' };
  } catch (error) {
    console.log(error);
    return { status: false, message: '伺服器錯誤' };
  } finally {
    connection.close();
  }
}

async function updateAccountPermissions(
  ID,
  Name,
  Describe,
  IsBuildNeed,
  IsInventory,
  IsPermissions,
  IsSearch,
  IsWarehouse
) {
  let connection = await pool.connect();
  try {
    const request = new mssql.Request(connection);

    request.input('ID', mssql.Int, ID);
    request.input('Name', mssql.VarChar, Name);
    request.input('Describe', mssql.VarChar, Describe);
    request.input('IsBuildNeed', mssql.Bit, IsBuildNeed);
    request.input('IsInventory', mssql.Bit, IsInventory);
    request.input('IsPermissions', mssql.Bit, IsPermissions);
    request.input('IsSearch', mssql.Bit, IsSearch);
    request.input('IsWarehouse', mssql.Bit, IsWarehouse);

    const result = await request.query(
      'UPDATE AccountPermissions SET Name = @Name, Describe = @Describe, IsBuildNeed = @IsBuildNeed, IsInventory = @IsInventory, IsPermissions = @IsPermissions, IsSearch = @IsSearch, IsWarehouse = @IsWarehouse  WHERE ID = @ID'
    );

    if (result.rowsAffected[0] === 0) {
      return { status: false, message: '修改失敗' };
    } else if (result.rowsAffected[0] === 1) return { status: true, message: '修改成功' };
  } catch (error) {
    console.log(error);
    return { status: false, message: '伺服器錯誤' };
  } finally {
    connection.close();
  }
}

async function deleteAccountPermissions(ID) {
  let connection = await pool.connect();
  try {
    const request = new mssql.Request(connection);

    request.input('ID', mssql.Int, ID);

    const IsBound = await request.query('SELECT COUNT(*) as Count FROM Account WHERE PermissionsID = @ID');

    if (IsBound.recordset[0].Count > 0) {
      return { status: false, message: '還有帳號綁定目前角色，無法刪除' };
    }

    const result = await request.query('DELETE FROM AccountPermissions WHERE ID = @ID');

    if (result.rowsAffected[0] === 0) {
      return { status: false, message: '刪除失敗' };
    } else if (result.rowsAffected[0] === 1) return { status: true, message: '刪除成功' };
  } catch (error) {
    console.log(error);
    return { status: false, message: '伺服器錯誤' };
  } finally {
    connection.close();
  }
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
