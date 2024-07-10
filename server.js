require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');

const app = express();
app.use(cookieParser());
const cors = require('cors');
const moment = require('moment');
const port = process.env.SERVER_PORT || 3001;

const fs = require('fs');

const http = require('http');
const server = http.createServer(app);

const login = require('./routers/login');
const basicInfo = require('./routers/basicInfo')
const quickSearch = require('./routers/quickSearch');
const permission = require('./routers/permission')

const corsOptions = {
  // 如果要讓 cookie 可以跨網域存取，這邊要設定 credentials
  // 且 origin 也要設定
  credentials: true,
  origin: [
    'http://localhost:5173',
  ],
};
app.use(cors(corsOptions));
app.use(express.json());
app.use((req, res, next) => {
  console.log(`Now：${moment().format('YYYY-MM-DD HH:mm:ss')}`);
  next();
});

app.use('/api/', login);
app.use('/api/basicInfo', basicInfo);
app.use('/api/quickSearch', quickSearch);
app.use('/api/permission', permission);

server.listen(port, () => console.log('server is runing : ' + port));