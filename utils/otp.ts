import crypto from 'crypto';

export function generateOtp(): { otp: string; expire: Date } {
  const otp = crypto.randomInt(100000, 999999).toString();
  const expire = new Date(Date.now() + 10 * 60 * 1000); // 10 mins expiry
  return { otp, expire };
}
