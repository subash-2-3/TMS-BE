const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userService = require('../masters/user/user.service');
const refreshTokenService = require('./refreshToken.service');
const tokenUtil = require('./token.util');
require('dotenv').config();

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await userService.getByEmail(email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const accessToken = tokenUtil.generateAccessToken(user);
    const refreshToken = tokenUtil.generateRefreshToken(user);

    const decoded = jwt.decode(refreshToken);

    await refreshTokenService.save(
      user.id,
      refreshToken,
      new Date(decoded.exp * 1000)
    );

    res.json({
      accessToken,
      refreshToken
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    await refreshTokenService.delete(refreshToken);

    res.json({ message: 'Logged out successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

