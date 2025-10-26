
const API_BASE = localStorage.getItem('apiBase') || 'http://127.0.0.1:8000';
const token = () => localStorage.getItem('token');
const headers = () => token() ? { 'Authorization': 'Bearer ' + token(), 'Content-Type':'application/json' } : { 'Content-Type':'application/json' };

// Landing analyze
const analyzeBtn = document.getElementById('analyzeBtn');
if (analyzeBtn) {
  analyzeBtn.addEventListener('click', async () => {
    const url = document.getElementById('ytUrl').value.trim();
    const status = document.getElementById('status');
    status.textContent = 'Submitting...';
    const resp = await fetch(`${API_BASE}/api/analyze`, { method:'POST', headers: headers(), body: JSON.stringify({ youtube_url: url })});
    const data = await resp.json();
    if (resp.ok) {
      status.textContent = 'Processing finished.';
      window.location.href = `result.html?id=${data.id}`;
    } else {
      status.textContent = data.detail || 'Error';
    }
  });
}

// Auth
const signupForm = document.getElementById('signupForm');
if (signupForm) {
  signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const body = Object.fromEntries(new FormData(signupForm).entries());
    const r = await fetch(`${API_BASE}/auth/signup`, {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body)});
    const d = await r.json();
    document.getElementById('signupMsg').textContent = r.ok ? 'Account created. Please login.' : (d.detail||'Error');
  });
}
const loginForm = document.getElementById('loginForm');
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const body = Object.fromEntries(new FormData(loginForm).entries());
    const r = await fetch(`${API_BASE}/auth/login`, {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body)});
    const d = await r.json();
    if (r.ok) { localStorage.setItem('token', d.access_token); window.location.href = 'dashboard.html'; }
    else document.getElementById('loginMsg').textContent = d.detail||'Error';
  });
}

// Dashboard
async function loadList() {
  const el = document.getElementById('list');
  if (!el) return;
  const r = await fetch(`${API_BASE}/api/videos`, {headers: headers()});
  const d = await r.json();
  el.innerHTML = d.map(v => `
    <a class="card block" href="result.html?id=${v.id}">
      <div class="text-sm text-gray-500">${new Date(v.created_at).toLocaleString()}</div>
      <div class="font-semibold">${v.title || 'Untitled Video'}</div>
      <div class="text-xs truncate">${v.youtube_url}</div>
    </a>`).join('');
}
loadList();

// Result
async function loadResult() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  if (!id) return;
  const r = await fetch(`${API_BASE}/api/videos/${id}`, {headers: headers()});
  const v = await r.json();
  document.getElementById('title').textContent = v.title || 'Analysis';
  document.getElementById('videoUrl').textContent = v.youtube_url;
  document.getElementById('summary').textContent = v.summary;
  document.getElementById('notes').textContent = v.study_notes;
  document.getElementById('mindmap').textContent = JSON.stringify(v.mind_map, null, 2);
  document.getElementById('keypoints').innerHTML = (v.key_points||[]).map(k=>`<li>${k}</li>`).join('');
}
loadResult();
