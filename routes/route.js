const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../mySQL');
const { check, validationResult } = require('express-validator');
const router = express.Router();

const ifNotLoggedIn = (req, res, next) => {
    if (!req.session.isLoggedIn) {
        return res.render('index');
    }
    next();
};

router.get("/", (req, res) => {
    res.redirect('/home')
});

router.get('/home', ifNotLoggedIn, (req, res) => {
    db.promise().execute('SELECT users.username FROM users WHERE id = ?', [req.session.userID])
        .then(([row]) => {
            res.render('home', {
                name: row[0].username,
                message: req.session.msg
            })
            req.session.msg = null
        })
})

router.get('/logout', (req, res) => {
    req.session = null
    res.redirect('/')
})

router.get('/data', ifNotLoggedIn, (req, res) => {
    db.execute('SELECT max_up,max_tod,max_down,run_up,run_down FROM users WHERE id = ?', [req.session.userID], (err, result) => {
        if (err) throw err;
        db.execute('SELECT * FROM orders WHERE UserID = ? ORDER BY OrderID DESC', [req.session.userID], (error, results) => {
            if (error) throw error;
            res.send([result[0], results])
        })
    })
})

router.post('/reset', ifNotLoggedIn, [
    check('new_password', 'กรุณากรอกรหัสผ่านในช่องว่าง').trim().not().isEmpty(),
    check('new_password', 'รหัสผ่านต้องมี 6 ตัวขึ้นไป').isLength({ min: 6 })
], async (req, res) => {
    const validation_result = validationResult(req);
    const { old_password, new_password } = req.body
    const userid = req.session.userID
    const hashedNewPassword = await bcrypt.hash(new_password, 10);
    if (validation_result.isEmpty()) {
        db.query('SELECT * FROM users WHERE id = ?', [userid], (err, result) => {
            if (err) {
                console.error('Error updating password:', err);
                return;
            }
            bcrypt.compare(old_password, result[0].password).then(compare_result => {
                if (compare_result === true) {
                    db.query('UPDATE users SET password = ? WHERE id = ?', [hashedNewPassword, userid], (err, result) => {
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
            }).catch(err => { if (err) throw err })
        })
    } else {
        let allErrors = validation_result.errors.map((err) => { return err.msg })
        req.session.msg = allErrors[0]
        res.redirect('/home')
    }
})

router.post('/add', async (req, res) => {
    const test = (input) => { return /^\d+$/.test(input) }
    const dataSet = req.body;
    const textContent = [];

    for (let data of dataSet) {
        const name = data.ID0;
        const fstInfo = data.ID1;
        const secInfo = data.ID2;

        const testResult = test(name);
        if (!testResult) {
            textContent.push({ type: 'danger', msg: `${name} กรุณากรอกเฉพาะตัวเลข` });
            continue;
        }
        if (!fstInfo || !secInfo) {
            textContent.push({ type: 'danger', msg: `${name} กรุณากรอกให้ครบ` });
            continue;
        }

        const mapping = {
            3: { q_arg1: 'max_up', q_arg2: 'max_tod', i_arg1: 'top', i_arg2: 'tod' },
            2: { q_arg1: 'max_up', q_arg2: 'max_down', i_arg1: 'top', i_arg2: 'down' },
            1: { q_arg1: 'run_up', q_arg2: 'run_down', i_arg1: 'r_up', i_arg2: 'r_down' },
        };
        const { q_arg1, q_arg2, i_arg1, i_arg2 } = mapping[name.length] || {};


        try {
            const [result] = await db.promise().query(
                `SELECT ${db.escapeId(q_arg1)}, ${db.escapeId(q_arg2)} FROM users WHERE id = ?`,
                [req.session.userID]
            );

            const [sum_1] = await db.promise().query(
                `SELECT SUM(${db.escapeId(i_arg1)}) AS fst_sum FROM orders WHERE num = ? AND UserID = ?`,
                [name, req.session.userID]
            );

            let sum_2;
            if (i_arg2 === 'tod') {

                function getPermutations(string) {
                    if (string.length <= 1) {
                        return [string];
                    }
                    const permutations = [];
                    for (let i = 0; i < string.length; i++) {
                        const char = string[i];
                        const remainingChars = string.slice(0, i) + string.slice(i + 1);
                        for (const perm of getPermutations(remainingChars)) {
                            permutations.push(char + perm);
                        }
                    }
                    return permutations;
                }

                const permutations = [...new Set(getPermutations(name))];
                const todQuery = `SELECT SUM(${db.escapeId(i_arg2)}) AS sec_sum FROM orders WHERE num IN (${permutations.map(() => '?').join(', ')}) AND UserID = ?`;
                [sum_2] = await db.promise().query(todQuery, [...permutations, req.session.userID]);
            } else {
                [sum_2] = await db.promise().query(
                    `SELECT SUM(${db.escapeId(i_arg2)}) AS sec_sum FROM orders WHERE num = ? AND UserID = ?`,
                    [name, req.session.userID]
                );
            }
            let fst_sum = sum_1[0].fst_sum
            let sec_sum = sum_2[0].sec_sum
            fst_sum = fst_sum ? fst_sum : 0
            sec_sum = sec_sum ? sec_sum : 0
            if (
                parseInt(fstInfo) + parseInt(fst_sum) <= result[0][q_arg1] &&
                parseInt(secInfo) + parseInt(sec_sum) <= result[0][q_arg2] &&
                fstInfo >= 0 &&
                secInfo >= 0
            ) {
                await db.promise().query(
                    `INSERT INTO orders (UserID ,num ,${db.escapeId(i_arg1)} ,${db.escapeId(i_arg2)}) VALUE (?,?,?,?)`,
                    [req.session.userID, name, fstInfo, secInfo]
                );
                textContent.push({ type: 'success', msg: `${name} ทำรายการเสร็จสิ้น` });
            } else {
                textContent.push({ type: 'danger', msg: `${name} มีข้อมูลไม่ถูกต้อง` });
            }
        } catch (err) {
            console.error(err);
            textContent.push({ type: 'danger', msg: `${name} เกิดข้อผิดพลาด` });
        }
    }

    res.send(textContent);
});

// DELETE
router.get('/delete/(:id)', (req,res) => {
    const orderID = req.params.id;
    db.query('SELECT * FROM orders WHERE OrderID = ?',[orderID], (err,[result])=>{
        if (err) throw err
        if (result.UserID === req.session.userID) {
            db.query('DELETE FROM orders WHERE OrderID = ?', [result.OrderID], (er ,pass) => {
                if (er) throw er
                res.json({msg:"ลบรายการเสร็จสิ้น"})
            })
        } else {
            res.json({msg:"บางอย่างผิดพลาด"})
        }
    })
})
module.exports = router; //export router ออกไปใช้
