import jwt, { type JwtPayload } from 'jsonwebtoken';
import ENV_VARS from './env.ts';


export interface JWTPayload {
    userId: string;
    email: string;
}


export const generationToken = (payload: JwtPayload): string => {
    const secret = ENV_VARS.JWT_SECRET;
    const expiresIn = ENV_VARS.JWT_EXPIRES_IN || '7h';

    if (!secret) {
        throw new Error('JWT secret is not defined in environment variables');
    }

    return jwt.sign(payload, secret, { expiresIn } as jwt.SignOptions);
}

export const verifyToken = (token: string): JWTPayload => {
    const secret = ENV_VARS.JWT_SECRET;

    if (!secret) {
        throw new Error('JWT secret is not defined in environment variables');
    }
    return jwt.verify(token, secret) as JWTPayload;

}


