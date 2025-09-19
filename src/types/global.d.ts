declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV?: 'development' | 'test' | 'production';
    PORT?: string;
    MONGO_URI?: string;
    JWT_SECRET?: string;
  }
}



