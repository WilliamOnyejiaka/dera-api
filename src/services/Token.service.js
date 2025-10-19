import jsonwebtoken from 'jsonwebtoken';

export default class Token {
    
    static validateToken(token, types, tokenSecret) {
        let result = {};
        try {
            result = jsonwebtoken.verify(token, tokenSecret);
        } catch (err) {
            console.error("\nError: ", err.message, "\n");

            const message = err.message[0].toUpperCase() + err.message.slice(1);
            return {
                error: true,
                message: message,
                data: {}
            };
        }

        let validTypes = true;
        if (types.includes("any")) {
            return {
                error: false,
                message: null,
                data: result
            };
        } else {
            for (const type of result.types) {
                if (!types.includes(type)) {
                    validTypes = false;
                    break;
                }
            }
        }

        return validTypes ? {
            error: false,
            message: null,
            data: result
        } : {
            error: true,
            message: "Unauthorized",
            data: {}
        };
    }

    static createToken(secretKey, data, types = ["access"], expiresIn = "100y") {
        return jsonwebtoken.sign(
            { data: data, types: types },
            secretKey,
            { expiresIn: expiresIn }
        );
    }

    static decodeToken(token) {
        const decoded = jsonwebtoken.decode(token);
        const expiresAt = decoded.exp - Math.floor(Date.now() / 1000); // Token's remaining time-to-live

        return {
            expiresAt: expiresAt,
            data: decoded.data,
            types: decoded.types,
            issuedAt: decoded.iat
        };
    }
}
