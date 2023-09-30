const express = require('express');
const router = express.Router();
const passport = require('passport');

router.get('/login/google', passport.authenticate('google', { scope: ['profile', 'email'] }))

router.get('/login/google/callback', passport.authenticate('google', { session: false }), (req, res) => {
  res.json({ user: req?.user })
});

module.exports = router;