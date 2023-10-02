const jwt = require('jsonwebtoken');

const isUser = (req, res, next) => {
  try {
    const auth = req.headers['authorization']
    const token = auth.split(' ')[1]
    if (!token) return res.status(401)
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
      if (req.url !== '/refresh-token') {
        if (err) return res.json({ message: err.message })
        return next()
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