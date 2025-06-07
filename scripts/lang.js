async function translatePage(lang) {
  const elementsToTranslate = document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, a, button, span, li, label, th, td');
  const texts = Array.from(elementsToTranslate).map(el => el.textContent);

  try {
    const response = await fetch('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ texts, targetLang: lang })
    });
    if (!response.ok) throw new Error('Translation API error');
    const translated = await response.json();
    elementsToTranslate.forEach((el, idx) => {
      el.textContent = translated[idx];
    });
  } catch (error) {
    alert('Translation failed. Please try again.');
  }
}

function applyTranslations() {
  const savedLang = localStorage.getItem('selectedLanguage');
  if (savedLang) {
    const languageSelect = document.getElementById('languageSelect');
    if (languageSelect) languageSelect.value = savedLang;
    translatePage(savedLang);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const languageSelect = document.getElementById('languageSelect');
  if (languageSelect) {
    languageSelect.addEventListener('change', function() {
      const lang = this.value;
      localStorage.setItem('selectedLanguage', lang);
      translatePage(lang);
    });
  }
  applyTranslations();
});