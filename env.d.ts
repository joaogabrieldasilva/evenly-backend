declare namespace NodeJS {
  interface ProcessEnv {
    DATABASE_URL: string;
    JWT_SECRET: string;
    AI_ENDPOINT: string;
    AI_MODEL: string;
  }
}
