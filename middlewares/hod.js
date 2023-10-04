const jwt = require('jsonwebtoken');
const Hod = require('../models/hod');

const isHod = (req, res, next) => {
  try {
    const auth = req.headers['authorization']
    const token = auth.split(' ')[1]
    if (!token) return res.json({ message: 'Token Not Found' })
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, token) => {
      if (err) return res.json({ message: err.message })
      const hod = await Hod.findById(token.id)
      if (!hod) return res.status(403)
      req.email = hod.email;
      req.id = token.id;
      next()
    })
  } catch (error) {
    res.status(503).json({ message: error.message })
  }
}

module.exports = { isHod }