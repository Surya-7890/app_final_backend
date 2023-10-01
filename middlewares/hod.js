const jwt = require('jsonwebtoken');
const Hod = require('../models/hod');

const isHod = (req, res, next) => {
  try {
    const auth = req.headers['authorization']
    const token = auth.split(' ')[1]
    if (!token) return res.status(401)
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, token) => {
      if (err) return res.status(403).json({ message: err.message })
      if (!(await Hod.findById(token))) return res.status(403)
      next()
    })
  } catch (error) {
    res.status(503).json({ message: error.message })
  }
}

module.exports = { isHod }