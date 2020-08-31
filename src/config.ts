import * as dotenv from 'dotenv';
dotenv.config();

export default {
  email: process.env.USER_EMAIL ?? '',
  password: process.env.USER_PASSWORD ?? '',
  currentDate: new Date(process.env.CURRENT_DATE ?? ''),
  webhookUrl: process.env.WEBHOOK_URL ?? '',
  mentionRole: process.env.MENTION_ROLE ?? '',
}
