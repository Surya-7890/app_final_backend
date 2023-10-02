const jwt = require('jsonwebtoken');
const Staff = require('../models/staff');
const Hod = require('../models/hod');

const isUser = (req, res, next) => {
  try {
    const auth = req.headers['authorization']
    const token = auth.split(' ')[1]
    if (!token) return res.status(401)
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, decoded) => {
      if (req.url !== '/refresh-token') {
        if (err) return res.json({ message: err.message })
        const user = await Staff.findById(decoded.id);
        if (!user) {
          const hod = await Hod.findById(decoded.id);
          req.staff = { email: hod.email, department: hod.department }
        } else {
          req.staff = { email: user.email, department: user.department }
          return next()
        }
      }
      const { payload } = jwt.decode(token, { complete: true, json: true });
      req.token = payload.id;
      next()
    })
  } catch (error) {
    res.status(503).json({ message: error.message })
  }
}

module.exports = { isUser }