/**
 * supabase-client.js
 * ------------------
 * Shared Supabase client and helper utilities for Lala Motors frontend.
 *
 * Provides:
 *   - window.supabaseClient (singleton Supabase client instance)
 *   - window.getSupabaseClient() (returns the active client, initializing if needed)
 *   - window.showUserMessage(msg, isError) (toast notification helper)
 *   - window.safeSupabaseQuery(queryPromise, errorFallbackMessage) (try/catch wrapper)
 */

(function () {
  'use strict';

  const SUPABASE_URL = 'https://fjhlglaivlbrowsuxres.supabase.co';
  const SUPABASE_ANON_KEY =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' +
    'eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZqaGxnbGFpdmxicm93c3V4cmVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1OTUwNDYsImV4cCI6MjA2NjE3MTA0Nn0.' +
    '0p7afOyJ_Q67d0k7ZTQWnxYIJ6eseuNx_7yjupT6eWo';

  window.SUPABASE_URL = SUPABASE_URL;
  window.SUPABASE_ANON_KEY = SUPABASE_ANON_KEY;

  function initClient() {
    if (window.supabaseClient) return window.supabaseClient;

    if (window.supabase && typeof window.supabase.createClient === 'function') {
      try {
        window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      } catch (err) {
        console.error('[supabase-client] Initialization failed:', err);
      }
    }
    return window.supabaseClient || null;
  }

  window.getSupabaseClient = initClient;

  // Initialize immediately if library is present
  initClient();

  // Retry on DOMContentLoaded if library script was placed below or deferred
  if (!window.supabaseClient) {
    document.addEventListener('DOMContentLoaded', initClient);
  }

  /**
   * Displays a user-friendly notification toast.
   */
  window.showUserMessage = function (message, isError) {
    let el = document.getElementById('notification');
    if (!el) {
      el = document.createElement('div');
      el.id = 'notification';
      el.className = 'notification';
      document.body.appendChild(el);
    }
    el.textContent = message;
    el.style.backgroundColor = isError ? '#e53e3e' : '#2e7d32';
    el.style.color = '#ffffff';
    el.classList.add('show');
    setTimeout(() => {
      el.classList.remove('show');
    }, 3500);
  };

  /**
   * Safe Supabase query execution with user-friendly error fallback
   */
  window.safeSupabaseQuery = async function (queryPromise, fallbackMsg) {
    try {
      const result = await queryPromise;
      if (result.error) {
        console.error('[Supabase Query Error]', result.error);
        if (fallbackMsg) window.showUserMessage(fallbackMsg, true);
        return { data: null, error: result.error };
      }
      return { data: result.data, error: null };
    } catch (err) {
      console.error('[Supabase Network/Unexpected Error]', err);
      if (fallbackMsg) window.showUserMessage(fallbackMsg, true);
      return { data: null, error: err };
    }
  };
})();
