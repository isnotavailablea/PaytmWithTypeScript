import jwt from "jsonwebtoken"
import { JWT_SECRET } from "../config"
interface JwtPayload{
    "userOId" : string,
    "iat" : number
}

const GetToken = (payload: JwtPayload): string => {
    const token = jwt.sign({
        userOId: payload.userOId
    }, JWT_SECRET);
    return token;
};


function isJwtPayload(payload: any): payload is JwtPayload {
    return (
        typeof payload === 'object' &&
        typeof payload.userOId === 'string' &&
        typeof payload.iat === 'number'
    );
}

function verifyToken(token: string): JwtPayload | null {
    try {
        // console.log(token)
        const decoded = jwt.verify(token, JWT_SECRET);
        // console.log(decoded)
        if (isJwtPayload(decoded)) {
            return decoded;
        } else {
            return null;
        }
    } catch (err) {
        return null;
    }
}

export {
    verifyToken , GetToken
}