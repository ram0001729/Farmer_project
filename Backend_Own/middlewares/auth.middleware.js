const { verifyJwt } = require('../utils/jwt');
const User = require('../models/User.model');

async function authenticate(req, res, next) {
  try {
    const header = req.header('Authorization') || '';
    const token = header.replace('Bearer ', '');
        console.log("TOKENnew:", token);

    if (!token) return res.status(401).json({ error: 'no token' });

    const payload = verifyJwt(token);
        console.log("PAYLOAD:", payload);

    const user = await User.findById(payload.sub);
    if (!user) return res.status(401).json({ error: 'invalid token' });
 console.log("REQ USER:", req.user);

    req.user = { userId: user._id,role: user.role };
      console.log("REQ USER:", req.user);

    next();
  } catch (err) {
    console.error(err);
    return res.status(401).json({ error: 'unauthorized' });
  }
}

module.exports = { authenticate };
