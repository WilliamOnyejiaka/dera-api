import jwt from 'jsonwebtoken'
import dotenv from 'dotenv';

dotenv.config()

const generateToken = id => {
  const token = jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '1h'
  })

  return token
}

export default generateToken
