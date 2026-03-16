const { verifyJwt } = require('../utils/jwt');
const User = require('../models/User.model');

async function authenticate(req, res, next) {
  try {
    const header = req.header('Authorization') || '';
    const token = header.replace('Bearer ', '');

    if (!token) return res.status(401).json({ error: 'no token' });

    const payload = verifyJwt(token);

    const user = await User.findById(payload.sub);
    if (!user) return res.status(401).json({ error: 'invalid token' });

    req.user = { userId: user._id.toString(), role: user.role, name: user.name };

    next();
  } catch (err) {
    console.error(err);
    return res.status(401).json({ error: 'unauthorized' });
  }
}

module.exports = { authenticate };
