// =============================
// Config
// =============================
const YOUTUBE_API_KEY = 'YOUR_YOUTUBE_API_KEY'; // Optional: only needed if extending with Data API

// =============================
// Init
// =============================
document.addEventListener('DOMContentLoaded', () => {
  setupSmoothScrolling(); // Basic anchor smooth scroll
  setupEnterToGenerate(); // UX convenience
});

// =============================
// Helpers
// =============================

// Smooth scroll for in-page anchors
function setupSmoothScrolling() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}

// Allow Enter key to trigger Generate in URL field
function setupEnterToGenerate() {
  const input = document.getElementById('youtube-url');
  if (!input) return;
  input.addEventListener('keypress', e => {
    if (e.key === 'Enter') generateContent();
  });
}

// Extract videoId from common YouTube URL formats
function extractVideoId(url) {
  const regExp = /^.*(?:youtu.be\/|v\/|\/u\/\w\/|embed\/|watch\?v=|watch\?.*&v=)([^#&?]{11}).*/;
  const m = url.match(regExp);
  return m ? m[1] : null;
}

// =============================
// Main Flow - Modified to open new tab
// =============================
async function generateContent() {
  const input = document.getElementById('youtube-url');
  const url = input ? input.value.trim() : '';
  if (!url) {
    alert('Please enter a YouTube video URL');
    return;
  }

  const videoId = extractVideoId(url);
  if (!videoId) {
    alert('Please enter a valid YouTube video URL');
    return;
  }

  // Open results in new tab
  const resultsUrl = `results.html?v=${videoId}&url=${encodeURIComponent(url)}`;
  window.open(resultsUrl, '_blank');
}

// =============================
// Expose functions to global scope (for inline handlers)
// =============================
window.generateContent = generateContent;
