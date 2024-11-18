const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../mySQL');
const { check ,validationResult } = require('express-validator');
const router = express.Router();

const ifNotLoggedIn = (req,res,next) => {
    if (!req.session.isLoggedIn) {
        return res.render('index');
    }
    next();
};

router.get("/", (req,res) => {
    res.redirect('/home')
});

router.get('/home', ifNotLoggedIn, (req,res) => {
    db.promise().execute('SELECT * FROM users WHERE id = ?', [req.session.userID])
    .then( ([row])=>{ 
        res.render('home',{ name:row[0].username, message: req.session.msg})
        req.session.msg = null
    })
})

router.get('/logout',(req,res) => {
    req.session = null
    res.redirect('/')
})

router.get('/data', ifNotLoggedIn, (req,res) => {
    db.query('SELECT max_up,max_tod,max_down,run_up,run_down FROM users WHERE id = ?', [req.session.userID], (err,result) => {
        if (err) throw err;
        res.send(result)
    })
})

router.post('/reset', ifNotLoggedIn,[
    check('new_password', 'กรุณากรอกรหัสผ่านในช่องว่าง').trim().not().isEmpty(),
    check('new_password', 'รหัสผ่านต้องมี 6 ตัวขึ้นไป').isLength({min:6})
], async (req,res) => {
    const validation_result = validationResult(req);
    const {old_password, new_password} = req.body
    const userid = req.session.userID
    const hashedNewPassword = await bcrypt.hash(new_password, 10);
    if (validation_result.isEmpty()){
    db.query('SELECT * FROM users WHERE id = ?', [userid], (err,result) => {
        if (err) {
            console.error('Error updating password:', err);
            return;
        }
        bcrypt.compare(old_password,result[0].password).then(compare_result => {
            if (compare_result === true) {
                db.query('UPDATE users SET password = ? WHERE id = ?', [hashedNewPassword, userid], (err,result) => {
                    if (err) {
                        return console.error(err)
                    } else {
                        req.session = null
                        res.redirect('/')
                    }
                })
            } else {
                req.session.msg = 'รหัสผ่านไม่ถูกต้อง'
                res.redirect('/home')
            }
        }).catch(err => {if (err) throw err})
    })} else {
        let allErrors = validation_result.errors.map((err) => {return err.msg})
        req.session.msg = allErrors[0]
        res.redirect('/home')
    }
})

module.exports = router; //export router ออกไปใช้