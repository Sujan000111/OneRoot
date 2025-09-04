'use strict';

const { getClient } = require('../config/supabaseClient');
const twilio = require('twilio');

const ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID || '';
const AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN || '';
const FROM_NUMBER = process.env.TWILIO_PHONE_NUMBER || '';
const OTP_EXPIRY_MINUTES = parseInt(process.env.OTP_EXPIRY_MINUTES || '5', 10);
const OTP_LENGTH = parseInt(process.env.OTP_LENGTH || '6', 10);

const client = ACCOUNT_SID && AUTH_TOKEN ? twilio(ACCOUNT_SID, AUTH_TOKEN) : null;

function randomOtp(len) {
  const min = Math.pow(10, len - 1);
  const max = Math.pow(10, len) - 1;
  return String(Math.floor(min + Math.random() * (max - min + 1)));
}

async function saveOtp(phone, otp, expiresAt) {
  const supabase = getClient();
  // Ensure a table 'otps' exists in Supabase with columns:
  // id (uuid, default uuid_generate_v4), phone (text), otp (text), expires_at (timestamp), created_at (timestamp default now())
  const { error } = await supabase.from('otps').insert({ phone, otp, expires_at: expiresAt.toISOString() });
  if (error) throw new Error(error.message);
}

async function getValidOtp(phone) {
  const supabase = getClient();
  const nowIso = new Date().toISOString();
  const { data, error } = await supabase
    .from('otps')
    .select('id, otp, expires_at')
    .eq('phone', phone)
    .gt('expires_at', nowIso)
    .order('expires_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error && error.code !== 'PGRST116') throw new Error(error.message);
  return data || null;
}

async function deleteOtp(id) {
  const supabase = getClient();
  if (!id) return;
  await supabase.from('otps').delete().eq('id', id);
}

module.exports = {
  async sendOtp(phone) {
    if (!phone) throw new Error('Phone is required');
    const otp = randomOtp(OTP_LENGTH);
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    if (!client || !FROM_NUMBER) {
      // eslint-disable-next-line no-console
      console.warn('[Twilio] Not configured, skipping SMS. OTP:', otp);
    } else {
      await client.messages.create({
        body: `Your verification code is ${otp}`,
        from: FROM_NUMBER,
        to: phone,
      });
    }

    await saveOtp(phone, otp, expiresAt);
    return true;
  },

  async verifyOtp(phone, otp) {
    if (!phone || !otp) return false;
    const record = await getValidOtp(phone);
    if (!record) return false;
    const ok = record.otp === otp;
    if (ok) await deleteOtp(record.id);
    return ok;
  },
};
