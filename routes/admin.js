const express = require('express');
const router = express.Router();
const io = require('../app');
const db = require('../mySQL');

let countdownEndTime = 0;
router.get('/control', (req, res) => {
    res.render('admin')
})

router.post('/control', (req, res) => {

    const date = req.body;
    countdownEndTime = new Date(date.date);
    db.query('UPDATE time SET targetTime = ? WHERE purpose = "main_event"', [countdownEndTime], (err, result) => {
        if (err) throw err
        io.emit('dateUpdate', countdownEndTime.getTime());
        res.json('ตั้งเวลาสำเร็จ')
    })

})

module.exports = router; //export router ออกไปใช้
