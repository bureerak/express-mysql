const express = require('express');
const db = require('../mySQL');
const router = express.Router();
const bcrypt = require('bcrypt');
const { check ,validationResult } = require('express-validator');

const ifLoggedIn = (req,res,next) => {
    if (req.session.isLoggedIn) {
        return res.redirect('/home');
    }
    next();
};

router.post("/login", ifLoggedIn,[
    check('username').custom((value)=>{
        return db.promise().execute("SELECT * FROM users WHERE username = ?", [value])
        .then(([row]) => {
            if (row.length === 1) { return true }
            return Promise.reject('Invalid Username :[')
        })
    }),
    check('password', 'Password is empty').trim().not().isEmpty(),
], (req,res) => {
    const validation_result = validationResult(req);
    const { username, password } = req.body;
    if (validation_result.isEmpty()){
        db.promise().execute("SELECT * FROM users WHERE username = ?",[username])
        .then( ([row]) => {
            bcrypt.compare(password, row[0].password).then(compare_result => {
                if (compare_result === true){
                    req.session.isLoggedIn = true;
                    req.session.userID = row[0].id;
                    res.redirect('/')
                } else {
                    res.render('index',{message:['Invalid password']})
                }
            }).catch(err => {if (err) throw err})
        })
        .catch(err => {if (err) throw err})
    } else {
        let allErrors = validation_result.errors.map((err) => {return err.msg})
        res.render('index',{message:allErrors})
    }
})

module.exports = router; //export router ออกไปใช้