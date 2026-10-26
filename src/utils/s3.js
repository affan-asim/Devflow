import { S3Client } from '@aws-sdk/client-s3';
import { createClient } from '@supabase/supabase-js';

// Lazily create the S3 client so credentials are read after env vars are loaded.
// Instantiating at module load time causes the worker to pick up empty strings
// because the S3Client is constructed before loadEnv.js runs.
let _s3;
export const s3 = new Proxy(
  {},
  {
    get(_target, prop) {
      if (!_s3) {
        _s3 = new S3Client({
          region: process.env.S3_REGION || 'us-east-1',
          endpoint: process.env.S3_ENDPOINT,
          forcePathStyle: true,
          credentials: {
            accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
            secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
          },
        });
      }
      const value = _s3[prop];
      return typeof value === 'function' ? value.bind(_s3) : value;
    },
  }
);


export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);
