const express = require('express');
const router = express.Router();
const io = require('../app');

let countdownEndTime = new Date().getTime() + 3600000; // เริ่มด้วย 1 ชั่วโมง
router.get('/com', (req, res) => {
    res.render('admin')
})

router.post('/com', (req, res) => {

    const date = req.body;
    countdownEndTime = new Date(date.date).getTime();
    io.emit('dateUpdate', countdownEndTime);
    res.json('ตั้งเวลาสำเร็จ')

})

module.exports = router; //export router ออกไปใช้
