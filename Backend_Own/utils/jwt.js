const jwt = require('jsonwebtoken');

const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const JWT_SECRET = process.env.JWT_SECRET;

function signJwt(payload) {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
}

function verifyJwt(token) {
  return jwt.verify(token, JWT_SECRET);
}

module.exports = {
  signJwt,
  verifyJwt,
}