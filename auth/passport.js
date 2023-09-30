const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const jwt = require('jsonwebtoken');
const AllowedUsers = require('../models/allowed');
const Staffs = require('../models/staff');
const Hod = require('../models/hod');

const generateAccessToken = (id) => {
  return jwt.sign(id, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' })
}

const generateRefreshToken = (id) => {
  return jwt.sign(id, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '30d' })
}

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: 'https://app-final-backend.onrender.com/auth/login/google/callback',
  passReqToCallback: true
}, async (req, accessToken, refreshToken, profile, callback) => {
  const user = await AllowedUsers.findOne({ email: profile.emails[0].value });
  if (!user) {
    return callback('You Are Not Authorized', null);
  } else {
    try {
    const data= {
      image: profile.photos[0].value,
      email: profile.emails[0].value,
      googleId: profile.id,
      name: profile.displayName,
      department: user.department
    }
    data.department = user.department;
    if (user.role === 'staff') {
      const staff = await Staffs.findOne({ email: user?.email });
      if (!staff) {
        const newUser = await Staffs.create(data);
        const accessToken = generateAccessToken({ id: newUser.id });
        const refreshToken = generateRefreshToken({ id: newUser.id });
        return callback(null, { accessToken, refreshToken, role: 'staff' });
      } else {
        const accessToken = generateAccessToken({ id: staff.id });
        const refreshToken = generateRefreshToken({ id: staff.id });
        return callback(null, { accessToken, refreshToken, role: 'staff' });
      }
    } else if (user.role === 'hod') {
      const hod = await Hod.findOne({ email: user?.email });
      if (!hod) {
        const newUser = await Hod.create(data);
        const accessToken = generateAccessToken({ id: newUser.id });
        const refreshToken = generateRefreshToken({ id: newUser.id });
        return callback(null, { accessToken, refreshToken, role: 'hod' });
      } else {
        const accessToken = generateAccessToken({ id: hod.id });
        const refreshToken = generateRefreshToken({ id: hod.id });
        return callback(null, { accessToken, refreshToken, role: 'hod' });
      }
    }
    } catch (error) {
      console.log(error.message)
    }
    
  }
}))