'use strict';

const { getClient, getConfigStatus } = require('../config/supabaseClient');
const { createSuccess, createError } = require('../utils/helpers');

module.exports = {
  async list(req, res) {
    try {
      const supabase = getClient();
      const { data, error } = await supabase
        .from('buyers')
        .select('id,name,village,taluk,district,profileimage,updatedat,isverified,userplan,score,cropnames,meta,capacity_kg')
        .order('updatedat', { ascending: false })
        .limit(50);
      if (error) {
        // eslint-disable-next-line no-console
        console.error('[Supabase buyers.list] error:', error, 'config:', getConfigStatus());
        return res.status(500).json(createError(error.message));
      }
      return res.json(createSuccess('buyers fetched', data));
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('[buyers.list] unexpected error:', err, 'config:', getConfigStatus());
      return res.status(500).json(createError(err.message || 'Failed to fetch buyers'));
    }
  },

  async search(req, res) {
    try {
      const { cropType, quantity, location, limit } = req.body || {};
      if (!cropType) {
        return res.status(400).json(createError('cropType is required'));
      }

      const supabase = getClient();

      // 1) Base filter: buyers that have the crop in their cropnames enum[]
      const { data: rows, error } = await supabase
        .from('buyers')
        .select('*')
        .filter('cropnames', 'cs', `{${cropType}}`) // contains cropType
        .limit(500);

      if (error) {
        return res.status(500).json(createError(error.message));
      }

      const taluk = location?.taluk || null;
      const district = location?.district || null;
      const pincode = location?.pincode || null;
      const lat = location?.lat || null;
      const lon = location?.lon || null;

      // 2) Score and sort in JS per priority: premium > locality > distance > recency
      const scored = (rows || []).map((b) => {
        const isPremium = (b.userplan || '').toLowerCase() === 'premium' ? 1 : 0;
        const localityScore =
          (taluk && b.taluk === taluk ? 3 : 0) +
          (district && b.district === district ? 2 : 0) +
          (pincode && b.pincode === pincode ? 1 : 0);

        // Simple distance calc (haversine) if all coords available
        let distanceKm = 99999;
        if (
          typeof lat === 'number' && typeof lon === 'number' &&
          typeof b.latitude === 'number' && typeof b.longitude === 'number'
        ) {
          const toRad = (d) => (d * Math.PI) / 180;
          const R = 6371;
          const dLat = toRad(b.latitude - lat);
          const dLon = toRad(b.longitude - lon);
          const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRad(lat)) * Math.cos(toRad(b.latitude)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          distanceKm = R * c;
        }

        return {
          ...b,
          __score: {
            isPremium,
            localityScore,
            distanceKm,
            updatedAt: b.updatedat ? new Date(b.updatedat).getTime() : 0,
          },
        };
      });

      scored.sort((a, b) => {
        // premium desc
        if (b.__score.isPremium !== a.__score.isPremium) return b.__score.isPremium - a.__score.isPremium;
        // locality desc
        if (b.__score.localityScore !== a.__score.localityScore) return b.__score.localityScore - a.__score.localityScore;
        // distance asc
        if (a.__score.distanceKm !== b.__score.distanceKm) return a.__score.distanceKm - b.__score.distanceKm;
        // recency desc
        return b.__score.updatedAt - a.__score.updatedAt;
      });

      const top = scored.slice(0, Math.max(1, Math.min(limit || 20, 50)));
      return res.json(createSuccess('buyers ranked', { buyers: top }));
    } catch (err) {
      return res.status(500).json(createError(err.message || 'Failed to search buyers'));
    }
  },
};
