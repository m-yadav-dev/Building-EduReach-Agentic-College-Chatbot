

import dotenv from 'dotenv';

dotenv.config();

const trimEnvValue = (value: string | undefined): string | undefined => {
    if (typeof value !== 'string') {
        return value;
    }

    const trimmedValue = value.trim();
    return trimmedValue.length > 0 ? trimmedValue : undefined;
};

const ENV_VARS = {
    PORT: trimEnvValue(process.env.PORT),
    MONGODB_URI: trimEnvValue(process.env.MONGODB_URI),
    JWT_SECRET: trimEnvValue(process.env.JWT_SECRET),
    JWT_EXPIRES_IN: trimEnvValue(process.env.JWT_EXPIRES_IN),
    CLIENT_URL: trimEnvValue(process.env.CLIENT_URL),
    GOOGLE_API_KEY: trimEnvValue(process.env.GOOGLE_API_KEY),
    VAPI_API_KEY: trimEnvValue(process.env.VAPI_API_KEY),
    VAPI_ASSISTANT_ID: trimEnvValue(process.env.VAPI_ASSISTANT_ID),
    VAPI_PHONE_NUMBER_ID: trimEnvValue(process.env.VAPI_PHONE_NUMBER_ID),
    NODE_ENV: trimEnvValue(process.env.NODE_ENV) || 'production',

}

export default ENV_VARS;



