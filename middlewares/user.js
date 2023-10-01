const jwt = require('jsonwebtoken');

const isUser = (req, res, next) => {
  try {
    const auth = req.headers['authorization']
    const token = auth.split(' ')[1]
    if (!token) return res.status(401)
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, token) => {
      if (err) return res.status(403).json({ message: err.message })
      next()
    })
  } catch (error) {
    res.status(503).json({ message: error.message })
  }
}

module.exports = { isUser }