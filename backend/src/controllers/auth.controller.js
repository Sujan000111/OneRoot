'use strict';

const OtpService = require('../services/otp.service');
const { createSuccess, createError } = require('../utils/helpers');
const jwt = require('jsonwebtoken');
const { getClient } = require('../config/supabaseClient');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';
// Set a very long expiration time for testing
const JWT_EXPIRES_IN = '24h'; // 24 hours for testing
console.log('🔐 Auth Controller - Using fixed JWT_EXPIRES_IN:', JWT_EXPIRES_IN);

console.log('🔐 Auth Controller - JWT_SECRET loaded:', JWT_SECRET ? 'YES' : 'NO');
console.log('🔐 Auth Controller - JWT_SECRET length:', JWT_SECRET ? JWT_SECRET.length : 0);
console.log('🔐 Auth Controller - JWT_SECRET preview:', JWT_SECRET ? JWT_SECRET.substring(0, 20) + '...' : 'NONE');

async function upsertUserByPhone(phone) {
  const supabase = getClient();
  // Ensure a table 'auth_users' with columns: id (uuid), phone (text unique), created_at (timestamp)
  const { data: existing, error: findErr } = await supabase
    .from('auth_users')
    .select('id, phone')
    .eq('phone', phone)
    .maybeSingle();
  if (findErr && findErr.code !== 'PGRST116') throw new Error(findErr.message);
  if (existing) return existing;
  const { data: inserted, error: insErr } = await supabase
    .from('auth_users')
    .insert({ phone })
    .select('id, phone')
    .maybeSingle();
  if (insErr) throw new Error(insErr.message);
  return inserted;
}

module.exports = {
  async sendOtp(req, res) {
    try {
      const { phone } = req.body;
      if (!phone) return res.status(400).json(createError('Phone is required'));

      await OtpService.sendOtp(phone);
      return res.json(createSuccess('OTP sent'));
    } catch (err) {
      return res.status(500).json(createError(err.message || 'Failed to send OTP'));
    }
  },

  async verifyOtp(req, res) {
    try {
      const { phone, otp } = req.body;
      if (!phone || !otp) return res.status(400).json(createError('Phone and OTP are required'));

      const verified = await OtpService.verifyOtp(phone, otp);
      if (!verified) return res.status(401).json(createError('Invalid OTP'));

      console.log('🔐 Auth Controller - OTP verified, creating user and JWT token');
      
      const user = await upsertUserByPhone(phone);
      console.log('🔐 Auth Controller - User created/found:', user);
      
      const token = jwt.sign({ sub: user.id, phone: user.phone }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
      console.log('🔐 Auth Controller - JWT token generated, length:', token.length);
      console.log('🔐 Auth Controller - JWT_EXPIRES_IN used:', JWT_EXPIRES_IN);
      console.log('🔐 Auth Controller - Token creation time:', new Date().toISOString());
      
      // Decode token to check expiration
      const decoded = jwt.decode(token);
      console.log('🔐 Auth Controller - Token expiration:', new Date(decoded.exp * 1000).toISOString());
      console.log('🔐 Auth Controller - Token will expire in:', Math.floor((decoded.exp * 1000 - Date.now()) / 1000), 'seconds');
      
      return res.json(createSuccess('Login successful', { token, user }));
    } catch (err) {
      return res.status(500).json(createError(err.message || 'Failed to verify OTP'));
    }
  },

  async logout(req, res) {
    try {
      return res.json(createSuccess('Logged out'));
    } catch (err) {
      return res.status(500).json(createError(err.message || 'Logout failed'));
    }
  },
};
