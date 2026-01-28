import dotenv from 'dotenv';

dotenv.config();

interface Config {
  nodeEnv: string;
  port: number;
  apiUrl: string;
  db: {
    host: string;
    port: number;
    name: string;
    user: string;
    password: string;
  };
  jwt: {
    secret: string;
    refreshSecret: string;
    expiresIn: string;
    refreshExpiresIn: string;
  };
  session: {
    secret: string;
  };
  oauth: {
    google: {
      clientId: string;
      clientSecret: string;
    };
    github: {
      clientId: string;
      clientSecret: string;
    };
  };
  external: {
    unsplash: {
      accessKey: string;
    };
    openweather: {
      apiKey: string;
    };
  };
  ai: {
    openai: {
      apiKey: string;
    };
    anthropic: {
      apiKey: string;
    };
  };
  stripe: {
    secretKey: string;
    publishableKey: string;
    webhookSecret: string;
  };
  storage: {
    type: string;
    s3?: {
      bucket: string;
      region: string;
      accessKeyId: string;
      secretAccessKey: string;
    };
  };
  redis: {
    host: string;
    port: number;
  };
}

const getEnv = (key: string, defaultValue?: string): string => {
  const value = process.env[key];
  if (!value && !defaultValue) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value || defaultValue || '';
};

export const config: Config = {
  nodeEnv: getEnv('NODE_ENV', 'development'),
  port: parseInt(getEnv('PORT', '3000'), 10),
  apiUrl: getEnv('API_URL', 'http://localhost:3000'),
  db: {
    host: getEnv('DB_HOST', 'localhost'),
    port: parseInt(getEnv('DB_PORT', '5432'), 10),
    name: getEnv('DB_NAME', 'momentum_db'),
    user: getEnv('DB_USER', 'momentum_user'),
    password: getEnv('DB_PASSWORD', 'momentum_password'),
  },
  jwt: {
    secret: getEnv('JWT_SECRET', 'change-me-in-production'),
    refreshSecret: getEnv('JWT_REFRESH_SECRET', 'change-me-in-production'),
    expiresIn: getEnv('JWT_EXPIRES_IN', '15m'),
    refreshExpiresIn: getEnv('JWT_REFRESH_EXPIRES_IN', '7d'),
  },
  session: {
    secret: getEnv('SESSION_SECRET', 'change-me-in-production-session-secret'),
  },
  oauth: {
    google: {
      clientId: getEnv('GOOGLE_CLIENT_ID', ''),
      clientSecret: getEnv('GOOGLE_CLIENT_SECRET', ''),
    },
    github: {
      clientId: getEnv('GITHUB_CLIENT_ID', ''),
      clientSecret: getEnv('GITHUB_CLIENT_SECRET', ''),
    },
  },
  external: {
    unsplash: {
      accessKey: getEnv('UNSPLASH_ACCESS_KEY', ''),
    },
    openweather: {
      apiKey: getEnv('OPENWEATHER_API_KEY', ''),
    },
  },
  ai: {
    openai: {
      apiKey: getEnv('OPENAI_API_KEY', ''),
    },
    anthropic: {
      apiKey: getEnv('ANTHROPIC_API_KEY', ''),
    },
  },
  stripe: {
    secretKey: getEnv('STRIPE_SECRET_KEY', ''),
    publishableKey: getEnv('STRIPE_PUBLISHABLE_KEY', ''),
    webhookSecret: getEnv('STRIPE_WEBHOOK_SECRET', ''),
  },
  storage: {
    type: getEnv('STORAGE_TYPE', 'local'),
    s3: {
      bucket: getEnv('AWS_S3_BUCKET', ''),
      region: getEnv('AWS_S3_REGION', 'us-east-1'),
      accessKeyId: getEnv('AWS_ACCESS_KEY_ID', ''),
      secretAccessKey: getEnv('AWS_SECRET_ACCESS_KEY', ''),
    },
  },
  redis: {
    host: getEnv('REDIS_HOST', 'localhost'),
    port: parseInt(getEnv('REDIS_PORT', '6379'), 10),
  },
};

