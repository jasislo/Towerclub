<!DOCTYPE html>
<html lang="en">
<head>
  <title>Page with Google Translate</title>
  <!-- Google Translate scripts -->
  <script type="text/javascript">
    function googleTranslateElementInit() {
      new google.translate.TranslateElement({
        pageLanguage: 'en',
        includedLanguages: 'en,es,fr',
        layout: google.translate.TranslateElement.InlineLayout.SIMPLE
      }, 'google_translate_element');
    }
  </script>
  <script 
    type="text/javascript" 
    src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit">
  </script>
</head>
<body>
  <header>
    <h1>Welcome to My Website</h1>
    <!-- Google Translate widget -->
    <div id="google_translate_element"></div>
  </header>

  <main>
    <p>Use the language selector above to translate.</p>
  </main>

  <script>
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
  </script>
</body>
</html>