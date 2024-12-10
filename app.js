// const db = require('./mySQL');
const express = require('express');
const path = require('path');
const cookieSession = require('cookie-session');

const { Server } = require('socket.io');
const http = require('http');

const dotenv = require('dotenv');
dotenv.config( { path:'./.env' } )

const app = express();
const http_server = http.createServer(app);
const io = new Server(http_server);

// Socket.IO
io.on('connection', (socket) => {
    socket.on('alertJoin', (arg) => {
        console.log(`${arg} Joined`)
    })
    socket.on('disconnect', (reason) =>{
        console.log('User Disconnected')
    })

})

const publicDirectory = path.join(__dirname,'./public');
app.use(express.static(publicDirectory)); // set ตำแหน่งไฟล์ acces(css) ต่างๆ
app.set('view engine', 'hbs'); // ใช้ hbs เป็น view engine

app.use(cookieSession({
    name: 'session',  // ตั้งชื่อของคุกกี้
    keys: [ process.env.SESSION_KEY1, process.env.SESSION_KEY2 ],  // กำหนด keys สำหรับเข้ารหัส session
    maxAge: 3600 * 1000 // อายุของ session (ในที่นี้คือ 1 ชั่วโมง)
}));

// Parse URL-encoded bodies (Sent from HTML FORM)
app.use(express.urlencoded({extended:false}));
// Parse JSON
app.use(express.json());

//Define Route
app.use('/', require('./routes/route'));
app.use('/auth', require('./routes/auth'));

http_server.listen(8000, () => {
    console.log("Server start on port 8000")
});