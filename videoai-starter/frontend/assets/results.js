// =============================
// Config
// =============================
const YOUTUBE_API_KEY = 'YOUR_YOUTUBE_API_KEY'; // Optional

// =============================
// State
// =============================
let currentVideoId = null;
let currentTabContent = {
  summary: '',
  keyPoints: '',
  quizzes: ''
};
let keyPointsData = [];
let currentSort = 'importance';
let mindMapState = {
  zoom: 1,
  layout: 'radial'
};

// =============================
// Init
// =============================
document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const videoIdParam = urlParams.get('v');
  const videoUrlParam = urlParams.get('url');

  const extractedId = videoIdParam || extractVideoId(videoUrlParam);
  if (extractedId) {
      currentVideoId = extractedId;
      processVideoForResults(extractedId, videoUrlParam || `https://www.youtube.com/watch?v=${extractedId}`);
  } else {
      // fallback demo video
      currentVideoId = 'dQw4w9WgXcQ';
      processVideoForResults(currentVideoId, `https://www.youtube.com/watch?v=${currentVideoId}`);
  }
});

// =============================
// Helpers
// =============================
function extractVideoId(url) {
  if (!url) return null;
  const regExp = /^.*(?:youtu.be\/|v\/|\/u\/\w\/|embed\/|watch\?v=|watch\?.*&v=)([^#&?]{11}).*/;
  const m = url.match(regExp);
  return m ? m[1] : null;
}

// =============================
// Loading Overlay
// =============================
function showLoadingOverlay() {
  const overlay = document.getElementById('loading-overlay');
  if (overlay) overlay.style.display = 'flex';
}

function hideLoadingOverlay() {
  const overlay = document.getElementById('loading-overlay');
  if (overlay) overlay.style.display = 'none';
}

async function simulateVideoProcessing() {
  const steps = [
    'Initializing...',
    'Extracting audio...',
    'Transcribing speech...',
    'Analyzing content...',
    'Generating summary...',
    'Creating key points...',
    'Building mind map...',
    'Preparing quizzes...',
    'Finalizing results...'
  ];
  const bar = document.getElementById('progress-bar');
  const status = document.getElementById('loading-status');

  for (let i = 0; i < steps.length; i++) {
    if (status) status.textContent = steps[i];
    if (bar) bar.style.width = `${Math.min(100, Math.round(((i + 1) / steps.length) * 100))}%`;
    await new Promise(res => setTimeout(res, 500));
  }
}

// =============================
// Main Process
// =============================
async function processVideoForResults(videoId, url) {
  try {
    showLoadingOverlay();
    await simulateVideoProcessing();
    fillDemoData(videoId, url);
  } catch (err) {
    console.error(err);
  } finally {
    hideLoadingOverlay();
  }
}

// =============================
// Fill Demo Data
// =============================
function fillDemoData(videoId, videoUrl) {
  // Video info
  const thumb = document.getElementById('video-thumbnail');
  const title = document.getElementById('video-title');
  const channel = document.getElementById('video-channel');
  const duration = document.getElementById('video-duration');
  const processed = document.getElementById('processed-time');
  const quality = document.getElementById('quality-score');

  if (thumb && videoId) thumb.src = `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`;
  if (title) title.textContent = 'How AI is Transforming Content Creation in 2023';
  if (channel) channel.textContent = 'Techinsights Channel';
  if (duration) duration.textContent = 'Duration: 18:42';
  if (processed) processed.textContent = `Processed on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`;
  if (quality) quality.textContent = '85';

  // Summary demo
  currentTabContent.summary = `
    <h3>Overview</h3>
    <p>The video explores how AI is revolutionizing content creation in 2023, highlighting tools that enhance productivity across text, image, and video domains.</p>
    <h3>Key Sections</h3>
    <h4>AI Writing Tools</h4>
    <p>Platforms like GPT-4 assist with drafting, ideation, and social content while raising disclosure and over-reliance questions.</p>
    <h4>Visual Content Creation</h4>
    <p>Image generators like DALL-E, Midjourney, and Stable Diffusion democratize design with text prompts.</p>
    <h4>Video & Future Outlook</h4>
    <p>Automated editing, voice synthesis, and avatar presenters enable lean educational content production.</p>
  `;

  // Key points demo
  keyPointsData = [
    { n: '01', title: 'AI revolutionizes workflows', desc: 'Modern AI reduces creation time while maintaining quality.', ts: '2:15', importance: 1, order: 1 },
    { n: '02', title: 'Generative AI specialization', desc: 'Domain-tuned models outperform general models.', ts: '5:42', importance: 2, order: 2 },
    { n: '03', title: 'Human-AI collaboration', desc: 'Best outcomes occur when humans and AI collaborate.', ts: '7:18', importance: 3, order: 3 }
  ];

  // Quizzes demo
  currentTabContent.quizzes = `
    <div class="quiz-item">
      <h4>Q1: Which AI tool assists with text generation?</h4>
      <p>A: GPT-4</p>
    </div>
    <div class="quiz-item">
      <h4>Q2: Name one AI tool for image generation.</h4>
      <p>A: DALL-E, Midjourney, or Stable Diffusion</p>
    </div>
    <div class="quiz-item">
      <h4>Q3: Why is human oversight important?</h4>
      <p>A: Ensures strategy, brand voice, and ethics are preserved.</p>
    </div>
  `;

  // Render tabs immediately
  const summaryEl = document.getElementById('summary-content');
  const keyPointsEl = document.getElementById('key-points-content');
  const quizEl = document.getElementById('study-notes-content'); // repurposed as quizzes

  if (summaryEl) summaryEl.innerHTML = currentTabContent.summary;
  if (keyPointsEl) renderKeyPoints(); // now renders immediately
  if (quizEl) quizEl.innerHTML = currentTabContent.quizzes;

  // Render mind map immediately
  renderMindMap();
}

// =============================
// Tabs
// =============================
function openTab(evt, tabName) {
  document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  const tab = document.getElementById(tabName);
  if (tab) tab.classList.add('active');
  if (evt && evt.currentTarget) evt.currentTarget.classList.add('active');
}

// =============================
// Key Points
// =============================
function renderKeyPoints() {
  const container = document.getElementById('key-points-content');
  if (!container) return;

  let list = [...keyPointsData];
  if (currentSort === 'importance') list.sort((a,b)=>a.importance-b.importance);
  else list.sort((a,b)=>a.order-b.order);

  container.innerHTML = list.map(item=>`
    <div class="key-point-item">
      <span class="key-point-number">${item.n}</span>
      <strong>${item.title}</strong>
      <p>${item.desc}</p>
      <span class="timestamp">${item.ts}</span>
    </div>
  `).join('');
}

function sortKeyPoints(type) {
  currentSort = type;
  document.querySelectorAll('.sort-btn').forEach(b=>b.classList.remove('active'));
  const btn = Array.from(document.querySelectorAll('.sort-btn')).find(b=>b.textContent.toLowerCase().includes(type));
  if (btn) btn.classList.add('active');
  renderKeyPoints();
}

// =============================
// Mind Map
// =============================
function renderMindMap() {
  const container = document.getElementById('mind-map-content');
  if (!container) return;
  container.innerHTML = '';
  container.style.transform = `scale(${mindMapState.zoom})`;
  container.style.transformOrigin = 'center center';

  const central = makeNode('AI in Content Creation', true);
  central.style.left = '50%';
  central.style.top = '50%';
  central.style.transform = 'translate(-50%, -50%)';
  container.appendChild(central);

  const nodes = ['Text Generation','Image Creation','Video Editing','Voice Synthesis','Content Strategy','Analytics'];
  const radius = 180;
  nodes.forEach((label,i)=>{
    const angle = (i/nodes.length)*Math.PI*2;
    const x = 50 + (radius*Math.cos(angle))/(container.clientWidth?(container.clientWidth/100):6);
    const y = 50 + (radius*Math.sin(angle))/(container.clientHeight?(container.clientHeight/100):6);
    const node = makeNode(label,false);
    node.style.left = `calc(${x}% )`;
    node.style.top = `calc(${y}% )`;
    node.style.transform = 'translate(-50%, -50%)';
    container.appendChild(node);
  });

  const placeholder = document.createElement('div');
  placeholder.className = 'mind-map-placeholder';
  placeholder.style.position='absolute';
  placeholder.style.bottom='10px';
  placeholder.style.right='14px';
  placeholder.style.fontSize='12px';
  placeholder.style.color='#999';
  placeholder.textContent = `Layout: ${mindMapState.layout.toUpperCase()} | Zoom: ${mindMapState.zoom.toFixed(1)}x`;
  container.appendChild(placeholder);
}

function makeNode(text, central=false) {
  const el = document.createElement('div');
  el.className = 'mind-map-node'+(central?' central':'');
  el.textContent = text;
  el.addEventListener('click', ()=>alert(text));
  return el;
}

function zoomIn() { mindMapState.zoom = Math.min(2.5,mindMapState.zoom+0.1); renderMindMap(); }
function zoomOut() { mindMapState.zoom = Math.max(0.6,mindMapState.zoom-0.1); renderMindMap(); }
function changeLayout() {
  const select = document.querySelector('.layout-select');
  if(!select) return;
  mindMapState.layout = select.value;
  renderMindMap();
}

// =============================
// Utilities
// =============================
async function copyToClipboard(sectionId) {
  const el = document.getElementById(sectionId==='summary'?'summary-content':
    sectionId==='key-points'?'key-points-content':'study-notes-content');
  if(!el) return;
  const text = el.innerText||el.textContent||'';
  try{await navigator.clipboard.writeText(text);alert('Copied to clipboard!');}
  catch{fallbackCopyText(text);}
}

function fallbackCopyText(text){
  const ta=document.createElement('textarea');ta.value=text;ta.style.position='fixed';ta.style.top='-2000px';document.body.appendChild(ta);ta.focus();ta.select();
  try{document.execCommand('copy');alert('Copied to clipboard!');}catch{alert('Copy failed.');}finally{document.body.removeChild(ta);}
}

function downloadPDF(sectionId){
  alert("Use your browser's print dialog and select 'Save as PDF'.");
}
function printNotes(){window.print();}
function shareContent(){
  const url=window.location.href,title='VideoAI Results',text='Check out this analyzed YouTube video.';
  if(navigator.share){navigator.share({title,text,url}).catch(()=>{});}else{alert('Copy the URL manually.');}
}

// =============================
// Expose to global
// =============================
window.openTab=openTab;
window.sortKeyPoints=sortKeyPoints;
window.zoomIn=zoomIn;
window.zoomOut=zoomOut;
window.changeLayout=changeLayout;
window.copyToClipboard=copyToClipboard;
window.downloadPDF=downloadPDF;
window.printNotes=printNotes;
window.shareContent=shareContent;
