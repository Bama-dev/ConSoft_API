import dotenv from 'dotenv';

dotenv.config();

export const env = {
	nodeEnv: process.env.NODE_ENV ?? 'development',
	port: Number(process.env.PORT ?? 3000),
	mongoUri: process.env.MONGO_URI ?? 'mongodb://localhost:27017/consoft',
	jwt_secret: process.env.JWT_SECRET ?? "alksdjklajlskd",
};
