'use strict';

const { getClient, getConfigStatus } = require('../config/supabaseClient');
const { createSuccess, createError } = require('../utils/helpers');

module.exports = {
  async listMyCalls(req, res) {
    try {
      const supabase = getClient();
      const { data, error } = await supabase
        .from('calls')
        .select('*')
        .or(`caller_user_id.eq.${req.user.id},callee_user_id.eq.${req.user.id}`)
        .order('started_at', { ascending: false })
        .limit(100);
      if (error) {
        // eslint-disable-next-line no-console
        console.error('[calls.listMyCalls] error:', error, 'config:', getConfigStatus());
        return res.status(500).json(createError(error.message));
      }

      return res.json(createSuccess('calls fetched', data));
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('[calls.listMyCalls] unexpected error:', err);
      return res.status(500).json(createError(err.message || 'Failed to fetch calls'));
    }
  },

  async createCall(req, res) {
    try {
      const { calleeUserId, calleePhone, direction, status, startedAt, context } = req.body || {};
      if (!calleePhone || !direction) {
        return res.status(400).json(createError('calleePhone and direction are required'));
      }

      const supabase = getClient();
      const payload = {
        caller_user_id: req.user.id,
        callee_user_id: calleeUserId || null,
        callee_phone: calleePhone,
        direction,
        status: status || 'dialed',
        started_at: startedAt ? new Date(startedAt).toISOString() : new Date().toISOString(),
        context: context || {},
      };

      const { data, error } = await supabase
        .from('calls')
        .insert([payload])
        .select('*')
        .single();

      if (error) {
        return res.status(500).json(createError(error.message));
      }

      return res.json(createSuccess('call created', data));
    } catch (err) {
      return res.status(500).json(createError(err.message || 'Failed to create call'));
    }
  },

  async updateCall(req, res) {
    try {
      const id = req.params.id;
      const { status, endedAt, durationSeconds, context } = req.body || {};
      if (!id) return res.status(400).json(createError('id is required'));

      const updates = {};
      if (status) updates.status = status;
      if (endedAt) updates.ended_at = new Date(endedAt).toISOString();
      if (typeof durationSeconds === 'number') updates.duration_seconds = durationSeconds;
      if (context && typeof context === 'object') updates.context = context;
      updates.created_at = undefined; // ensure not set

      const supabase = getClient();
      const { data, error } = await supabase
        .from('calls')
        .update(updates)
        .eq('id', id)
        .select('*')
        .single();

      if (error) {
        return res.status(500).json(createError(error.message));
      }

      return res.json(createSuccess('call updated', data));
    } catch (err) {
      return res.status(500).json(createError(err.message || 'Failed to update call'));
    }
  },
};


