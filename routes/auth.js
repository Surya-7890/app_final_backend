const express = require('express');
const router = express.Router();
const passport = require('passport');
const Admin = require('../models/admin');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { isUser } = require('../middlewares/user');

router.get('/login/google', passport.authenticate('google', { scope: ['profile', 'email'] }))

router.get('/login/google/callback', passport.authenticate('google', { session: false }), (req, res) => {
  res.redirect(`sece://booking/${req?.user?.accessToken}/${req?.user?.refreshToken}/${req?.user?.role}imagehere${req?.user?.image}`)
});

router.post('/add/admin', async (req, res) => {
  const { username, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await Admin.create({ username, password: hashedPassword });
    res.status(200).json({ message: 'Success' })
  } catch (error) {
    res.status(503).json({ message: error.message });
  }
});

router.post('/login/admin', async (req, res) => {
  const { username, password } = req.body;
  try {
    const admin = await Admin.findOne({ username });
    const isValid = await bcrypt.compare(password, admin.password);
    if (!isValid) {
      return res.status(403).json({ message: 'Incorrect Password' });
    }
    const accessToken = jwt.sign({ id: admin.id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '30m' })
    const refreshToken = jwt.sign({ id: admin.id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '30d' })
    res.json({ message: 'Success', accessToken, refreshToken });
  } catch (error) {
    res.status(503).json({ message: error.message });
  }
});

router.get('/refresh-token', isUser, async (req, res) => {
  try {
    const accessToken = jwt.sign({ id: req.token }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '30m' });
    const refreshToken = jwt.sign({ id: req.token }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '30d' });
    res.status(200).json({ accessToken, refreshToken })
  } catch (error) {
    res.status(503).json({ message: error.message });
  }
})

router.post('/validate/refresh-token', async (req, res) => {
  const auth = req.headers['authorization'];
  const token = auth?.split(' ')[1];
  const { accessToken } = req.body;
  try {
    if (!auth) return res.json({ message: 'Token Not Found' });
    jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
      if (err.message !== 'jwt expired') {
        jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
          if (err) {
            if (err.message === 'jwt expired') {
              const decodedToken = jwt.decode(token, {complete: true, json: true});
              const accessToken = jwt.sign(decodedToken.id)
              const refreshToken = jwt.sign(decodedToken.id)
              res.json({ accessToken, refreshToken });
            } else {
              res.json({ message: err.message })
            }
          } else {
            res.json({ message: 'Token Valid' })
          }
        })
      } else {
        res.json({ message: 'Please Login' })
      }
    })
  } catch (error) {
    res.json({ message: error.message });
  }
})

module.exports = router;