import { S3Client, ListBucketsCommand } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';
dotenv.config();

console.log('Credentials:');
console.log('ID:', process.env.SUPABASE_ACCESS_KEY_ID);
console.log('Secret:', process.env.SUPABASE_SECRET_ACCESS_KEY);

const client = new S3Client({
  endpoint: process.env.SUPABASE_S3_ENDPOINT,
  region: 'ap-southeast-1',
  forcePathStyle: true,
  credentials: {
    accessKeyId: process.env.SUPABASE_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.SUPABASE_SECRET_ACCESS_KEY || ''
  }
});

async function test() {
  try {
    const data = await client.send(new ListBucketsCommand({}));
    console.log('Success:', data.Buckets);
  } catch(err) {
    console.log('Error:', err.message);
  }
}
test();

