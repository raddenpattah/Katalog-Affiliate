import { head } from '@vercel/blob';
const token = process.env.BLOB_AI_CONFIG_READ_WRITE_TOKEN;
const info = await head('ai-settings.json', { token });
const res = await fetch(info.url, { headers: { Authorization: `Bearer ${token}` } });
const data = await res.json();
console.log(JSON.stringify(data, null, 2));
