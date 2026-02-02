const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const userService = require('../masters/user/user.service');
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

    const token = jwt.sign(
      {
        id: user.id,
        role: user.role_name,
        company_id: user.company_id
      },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
