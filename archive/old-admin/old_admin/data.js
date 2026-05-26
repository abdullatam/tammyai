// data.js — Live API layer for Tammy Admin Panel
// All data comes from the backend.

window.BACKEND = window.location.origin && window.location.origin !== 'null'
  ? window.location.origin
  : 'http://localhost:7861';

// ── Credential management ────────────────────────────────────────────────────

window.AdminCreds = {
  _pwd: null,

  get() {
    if (!this._pwd) {
      this._pwd = localStorage.getItem('tammy_admin_pwd') || null;
    }
    return this._pwd;
  },

  set(pwd) {
    this._pwd = pwd;
    localStorage.setItem('tammy_admin_pwd', pwd);
  },

  clear() {
    this._pwd = null;
    localStorage.removeItem('tammy_admin_pwd');
  },
};

// ── Auth state (React-driven, no prompt()) ───────────────────────────────────

window.AdminAuth = {
  _loggedIn: false,
  _onAuthChange: null, // set by App component

  get loggedIn() { return this._loggedIn; },

  async checkSession() {
    // Try saved password first
    const pwd = window.AdminCreds.get();
    if (pwd) {
      const ok = await this.login(pwd);
      if (ok) return true;
      window.AdminCreds.clear();
    }
    return false;
  },

  async login(password) {
    try {
      const res = await fetch(window.BACKEND + '/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'admin', password }),
        credentials: 'include',
      });
      if (!res.ok) return false;
      this._loggedIn = true;
      window.AdminCreds.set(password);
      if (this._onAuthChange) this._onAuthChange(true);
      return true;
    } catch (e) {
      return false;
    }
  },

  logout() {
    this._loggedIn = false;
    window.AdminCreds.clear();
    if (this._onAuthChange) this._onAuthChange(false);
  },

  forceLogin() {
    // Called on 401 — redirect to login screen
    this._loggedIn = false;
    window.AdminCreds.clear();
    if (this._onAuthChange) this._onAuthChange(false);
  },
};

// ── API client ───────────────────────────────────────────────────────────────

window.AdminAPI = {

  async _fetch(path, opts = {}) {
    if (!window.AdminAuth._loggedIn) throw new Error('Not authenticated');
    const url = window.BACKEND + path;
    const res = await fetch(url, {
      ...opts,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + (window.AdminCreds.get() || ''),
        ...(opts.headers || {}),
      },
    });
    if (res.status === 401) {
      window.AdminAuth.forceLogin();
      throw new Error('Session expired');
    }
    if (!res.ok) throw new Error(`HTTP ${res.status} — ${path}`);
    return res.json();
  },

  // ── Overview
  async getStats() { return this._fetch('/admin/api/stats'); },

  // ── System Prompt
  async getActivePrompt() { return this._fetch('/admin/prompts/active'); },
  async listPromptVersions() {
    const r = await this._fetch('/admin/prompts?limit=20');
    return r.versions || [];
  },
  async savePrompt(content, note) {
    const draft = await this._fetch('/admin/prompts', {
      method: 'POST',
      body: JSON.stringify({ content, note: note || 'Saved from admin panel' }),
    });
    await this._fetch(`/admin/prompts/${draft._id}/publish`, { method: 'POST', body: '{}' });
    return draft;
  },
  async rollbackPrompt(versionId) {
    return this._fetch(`/admin/prompts/${versionId}/rollback`, { method: 'POST', body: '{}' });
  },
  async testPrompt(versionId, messages) {
    return this._fetch(`/admin/prompts/${versionId}/playground`, {
      method: 'POST',
      body: JSON.stringify({ messages }),
    });
  },

  // ── RAG books
  async getRagStats() { return this._fetch('/admin/rag/stats'); },
  async getRagHistory() { return this._fetch('/admin/rag/history'); },

  // ── Users
  async getUsers() { return this._fetch('/admin/api/users'); },

  // ── Conversations
  async getSessions(limit) {
    const q = limit ? `?limit=${limit}` : '';
    return this._fetch(`/admin/api/sessions${q}`);
  },

  // ── Emotional threads
  async getEmotionalThreads() { return this._fetch('/admin/api/emotional-threads'); },

  // ── Self-test
  async runSelfTest(prompt) {
    const body = prompt ? JSON.stringify({ prompt }) : '{}';
    return this._fetch('/admin/self-test', { method: 'POST', body });
  },

  // ── Health
  async getHealth() { return this._fetch('/health'); },
};

// ── Minimal AdminData for sidebar / meta ─────────────────────────────────────

window.AdminData = {
  meta: {
    admin: { name: 'Admin', initial: 'A', role: 'Founder' },
    activeNow: 0,
    totalUsers: 0,
    convosToday: 0,
    avgResponse: 0,
    promptVersion: 'v—',
    promptVersions: [],
    uptime: '—',
    region: '—',
  },
  feed: [],
  dauTrend: [0, 0, 0, 0, 0, 0, 0],
  responseTrend: [0, 0, 0, 0, 0, 0, 0],
  dauLabels: ['—', '—', '—', '—', '—', '—', '—'],
  systemPrompt: '',
  promptSelfTest: [],
  testHistory: [],
  books: [],
  userKnowledge: [],
  users: [],
  conversations: [],
  fullTranscript: [],
  scatter: [],
  emotionalThreads: [],
  emotionSummary: { mostCommon: '—', mostCommonPct: 0, posValencePct: 0, highArousalPct: 0, shifts: [] },
  apiKeys: [],
  triggers: [],
  auditLog: [],
};

// ── Bootstrap helper (called after login) ────────────────────────────────────

window.AdminBootstrap = async function () {
  try {
    const stats = await window.AdminAPI.getStats().catch(() => null);
    if (stats) {
      Object.assign(window.AdminData.meta, {
        activeNow: stats.activeNow,
        totalUsers: stats.totalUsers,
        convosToday: stats.convosToday,
        avgResponse: stats.avgResponse,
        promptVersion: stats.promptVersion,
        uptime: stats.uptime,
        region: stats.region,
      });
    }

    const prompt = await window.AdminAPI.getActivePrompt().catch(() => null);
    if (prompt && prompt.content) {
      window.AdminData.systemPrompt = prompt.content;
      window.AdminData._activePromptId = prompt._id;
    }

    const versions = await window.AdminAPI.listPromptVersions().catch(() => []);
    window.AdminData.meta.promptVersions = versions.map(v => `v${v.version}`);
    window.AdminData._promptVersionDocs = versions;
  } catch (e) {
    console.warn('[AdminData] Bootstrap error:', e.message);
  }
};
