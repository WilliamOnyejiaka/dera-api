import Token from "./../services/Token.service.js";
import { JWT_SECRET } from "./../config/env.js";

const verifyJWT = (types, neededData = ['data']) => async (req, res, next) => {
    const tokenSecret = JWT_SECRET;
    if (!req.headers.authorization || req.headers.authorization.indexOf('Bearer ') === -1) {
        res.status(401).json({ error: true, message: 'Missing Bearer Authorization Header' });
        return;
    }

    const token = req.headers.authorization.split(' ')[1];
    if (!token) {
        res.status(401).json({
            error: true,
            message: "Token missing"
        });
        return;
    }

    const tokenValidationResult = Token.validateToken(token, types, tokenSecret);

    if (tokenValidationResult.error) {
        const statusCode = tokenValidationResult.message == "Unauthorized" ? 401 : 400;
        res.status(statusCode).json({
            error: true,
            message: tokenValidationResult.message
        });
        return;
    }

    for (let item of neededData) {
        res.locals[item] = tokenValidationResult.data[item];
    }

    res.locals['userType'] = tokenValidationResult.data['types'][0];
    next();
}

export default verifyJWT;