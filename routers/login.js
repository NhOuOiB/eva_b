const express = require('express');
const router = express.Router();
const pool = require('../utils/db');
const mssql = require('mssql');
const jwt = require('jsonwebtoken');

router.post('/login', async (req, res) => {
  try {
    console.log('login');
    let connection = await pool.connect();
    const request = new mssql.Request(connection);
    request.input('account', mssql.VarChar, req.body.account);
    request.input('password', mssql.VarChar, req.body.password);

    let result = await request.query(
      'SELECT a.ID, a.Account, a.PermissionsID FROM Account a WHERE Account = @account AND Password = @password'
    );
    let users = result.recordset;

    if (users.length == 0) {
      return res.status(401).json({ message: '帳號或密碼錯誤' });
    }

    let user = users[0];

    let payload = {
      id: user.ID,
      permission: user.PermissionsID,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '3d' });
    res.cookie('token', token, {
      // domain: '192.168.1.108:8000',
      // path: '/',
      // httpOnly: true, // 防止 XSS 攻擊
      // sameSite: 'none',
      // secure: true, // 只有在 HTTPS 連線時才可以發送 cookie
      expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 天
    });

    res.json({
      message: '成功登入',
      id: user.ID,
      account: user.Account,
      permission: user.PermissionsID,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: '伺服器錯誤' });
  }
});

mssql.on('error', (err) => {
  console.log(err + 'from mssql.on');
  res.status(500).json({ message: '伺服器錯誤' });
});

module.exports = router;
