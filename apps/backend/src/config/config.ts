import { registerAs } from '@nestjs/config';
import * as process from 'node:process';

export default registerAs('config', () => ({
  google: {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
  },
  secret: process.env.JWT_SECRET,
  signOptions: {
    expiresIn: process.env.JWT_EXPIRE,
  },
  clientUrl: process.env.CLIENT_URL,
}));

