import dotenv from 'dotenv';

dotenv.config();

export const env = {
	nodeEnv: process.env.NODE_ENV ?? 'development',
	port: Number(process.env.PORT ?? 3000),
	mongoUri: process.env.MONGO_URI ?? 'mongodb://localhost:27017/consoft',
	jwt_secret: process.env.JWT_SECRET ?? "alksdjklajlskd",
	googleClientId: process.env.GOOGLE_CLIENT_ID,
  defaultUserRoleId: process.env.DEFAULT_USER_ROLE_ID ?? "68ccb444b45b03f1a65cbd26",
  adminRoleId: process.env.ADMIN_ROLE_ID,
  frontendOrigins: (process.env.FRONTEND_ORIGINS ?? 'http://localhost:3000')
    .split(',')
    .map((s) => s.trim()),
};
