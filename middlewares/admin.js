const jwt = require('jsonwebtoken');
const Admin = require('../models/admin');

const isAdmin = (req, res, next) => {
  try {
    const auth = req.headers['authorization']
    const token = auth?.split(' ')[1];
    if (!token) return res.status(401)
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, token) => {
      if (err) return res.json({ message: err.message })
      const admin = await Admin.findById(token.id)
      if (!admin) return res.status(403)
      next()
    })
  } catch (error) {
    res.status(503).json({ message: error.message })
  }
}

module.exports = { isAdmin }