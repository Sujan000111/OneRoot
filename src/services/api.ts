import { API, getJson, postJson } from '../config/api';

export type CreateCallPayload = {
  calleeUserId?: string | null;
  calleePhone: string;
  direction: 'outgoing' | 'incoming';
  status?: 'dialed' | 'missed' | 'answered' | 'rejected' | 'failed' | 'completed';
  startedAt?: string;
  context?: Record<string, unknown>;
};

export type UpdateCallPayload = {
  status?: 'dialed' | 'missed' | 'answered' | 'rejected' | 'failed' | 'completed';
  endedAt?: string;
  durationSeconds?: number;
  context?: Record<string, unknown>;
};

export const CallsApi = {
  async listMyCalls() {
    return getJson<{ success: boolean; message: string; data: any }>(API.endpoints.calls.list);
  },
  async createCall(payload: CreateCallPayload) {
    return postJson<CreateCallPayload, { success: boolean; message: string; data: any }>(API.endpoints.calls.create, payload);
  },
  async updateCall(id: string, payload: UpdateCallPayload) {
    const res = await fetch(API.baseUrl ? `${API.baseUrl}${API.endpoints.calls.update(id)}` : API.endpoints.calls.update(id), {
      method: 'PATCH',
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json?.message || 'Request failed');
    return json as { success: boolean; message: string; data: any };
  }
};


