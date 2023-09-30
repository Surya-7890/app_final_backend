const express = require('express');
const router = express.Router();
const passport = require('passport');

router.get('/login/google', passport.authenticate('google', { scope: ['profile', 'email'] }))

router.get('/login/google/callback', passport.authenticate('google', { session: false }), (req, res) => {
  res.redirect(`sece://booking/${req?.user?.accessToken}/${req?.user?.refreshToken}/${req?.user?.role}`)
});

module.exports = router;