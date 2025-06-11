// Translation Manager
class TranslationManager {
    constructor() {
        // Always use browser language as default
        let browserLang = this.detectBrowserLanguage();
        
        this.currentLanguage = browserLang;
        this.translations = {};
        this.translationCache = new Map();
        this.pageTranslations = new Map(); // Cache translations per page
        this.GOOGLE_TRANSLATE_API_KEY = 'YOUR_GOOGLE_TRANSLATE_API_KEY'; // Replace with your API key
        
        // Initialize and apply translations immediately
        this.initializeLanguageSelector();
        this.setupPageNavigationListener();
        this.applyCurrentLanguage();
    }

    // Detect browser language with fallback
    detectBrowserLanguage() {
        // Try multiple methods to detect browser language
        let browserLang = 'en'; // Default fallback
        
        // Method 1: navigator.language (most reliable)
        if (navigator.language) {
            browserLang = navigator.language.split('-')[0];
        }
        // Method 2: navigator.languages (array of preferred languages)
        else if (navigator.languages && navigator.languages.length > 0) {
            browserLang = navigator.languages[0].split('-')[0];
        }
        // Method 3: navigator.userLanguage (IE fallback)
        else if (navigator.userLanguage) {
            browserLang = navigator.userLanguage.split('-')[0];
        }
        
        // Supported languages
        const supported = ['en', 'es', 'fr', 'zh', 'ar', 'de', 'it', 'pt', 'ru', 'ja', 'ko'];
        if (!supported.includes(browserLang)) {
            browserLang = 'en';
        }
        
        return browserLang;
    }

    // Initialize language selector
    initializeLanguageSelector() {
        const languageSelect = document.getElementById('languageSelect');
        if (languageSelect) {
            languageSelect.value = this.currentLanguage;
            languageSelect.addEventListener('change', async (event) => {
                const newLanguage = event.target.value;
                await this.changeLanguage(newLanguage);
            });
        }
    }

    // Setup listener for page navigation to maintain language
    setupPageNavigationListener() {
        // Listen for navigation events
        window.addEventListener('popstate', () => {
            this.applyCurrentLanguage();
        });

        // Intercept link clicks to maintain language
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a');
            if (link && link.href && link.href.startsWith(window.location.origin)) {
                e.preventDefault();
                const url = new URL(link.href);
                url.searchParams.set('lang', this.currentLanguage);
                window.location.href = url.toString();
            }
        });
    }

    // Apply current language to the page
    async applyCurrentLanguage() {
        const urlParams = new URLSearchParams(window.location.search);
        const langParam = urlParams.get('lang');
        
        if (langParam && langParam !== this.currentLanguage) {
            await this.changeLanguage(langParam);
        } else {
            await this.changeLanguage(this.currentLanguage);
        }
    }

    // Change website language
    async changeLanguage(languageCode) {
        try {
            // Show loading state
            document.body.style.opacity = '0.5';
            
            // Get current page path for caching
            const currentPage = window.location.pathname;
            
            // Get translations for the selected language and current page
            const translations = await this.getTranslations(languageCode, currentPage);
            
            // Update all translatable elements
            this.updatePageContent(translations);
            
            // Save selected language and translations
            this.currentLanguage = languageCode;
            localStorage.setItem('selectedLanguage', languageCode);
            
            // Update URL with language parameter
            const url = new URL(window.location.href);
            url.searchParams.set('lang', languageCode);
            window.history.replaceState({}, '', url);
            
            // Update HTML lang attribute
            document.documentElement.lang = languageCode;
            
            // Update RTL if needed
            this.updateTextDirection(languageCode);

            // Update meta tags
            this.updateMetaTags(translations);
            
        } catch (error) {
            console.error('Translation error:', error);
            // Don't show alert for automatic translation failures
            console.log('Automatic translation failed, using fallback translations');
        } finally {
            // Reset loading state
            document.body.style.opacity = '1';
        }
    }

    // Get translations using Google Translate API
    async getTranslations(languageCode, pagePath) {
        // Check page-specific cache first
        const cacheKey = `${pagePath}-${languageCode}`;
        if (this.pageTranslations.has(cacheKey)) {
            return this.pageTranslations.get(cacheKey);
        }

        // Check if API key is configured
        if (!this.GOOGLE_TRANSLATE_API_KEY || this.GOOGLE_TRANSLATE_API_KEY === 'YOUR_GOOGLE_TRANSLATE_API_KEY') {
            console.log('Google Translate API key not configured, using fallback translations');
            return this.getFallbackTranslations(languageCode);
        }

        try {
            // Get all translatable elements
            const elements = document.querySelectorAll('[data-i18n]');
            const texts = Array.from(elements).map(el => ({
                key: el.getAttribute('data-i18n'),
                text: el.textContent.trim(),
                type: el.tagName.toLowerCase()
            }));

            // Filter out empty texts and duplicates
            const uniqueTexts = texts.filter((item, index, self) => 
                item.text && 
                index === self.findIndex(t => t.key === item.key)
            );

            // Prepare texts for translation
            const textArray = uniqueTexts.map(t => t.text);
            
            // Call Google Translate API
            const response = await fetch(`https://translation.googleapis.com/language/translate/v2?key=${this.GOOGLE_TRANSLATE_API_KEY}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    q: textArray,
                    target: languageCode,
                    source: 'en',
                    format: 'html' // Enable HTML translation
                })
            });

            if (!response.ok) {
                throw new Error('Google Translate API error');
            }

            const data = await response.json();
            
            // Create translations object
            const translations = {};
            uniqueTexts.forEach((item, index) => {
                translations[item.key] = {
                    text: data.data.translations[index].translatedText,
                    type: item.type
                };
            });

            // Cache translations for this page
            this.pageTranslations.set(cacheKey, translations);
            
            return translations;

        } catch (error) {
            console.error('Error fetching translations:', error);
            // Fallback to local translations if API fails
            return this.getFallbackTranslations(languageCode);
        }
    }

    // Update page content with translations
    updatePageContent(translations) {
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            if (translations[key]) {
                const translation = translations[key];
                
                // Handle different element types
                switch (element.tagName) {
                    case 'INPUT':
                        if (element.type === 'text' || element.type === 'email' || element.type === 'password') {
                            element.placeholder = translation.text;
                        }
                        break;
                    case 'IMG':
                        element.alt = translation.text;
                        break;
                    case 'META':
                        element.content = translation.text;
                        break;
                    case 'OPTION':
                        element.textContent = translation.text;
                        break;
                    default:
                        // Handle HTML content safely
                        if (translation.text.includes('<')) {
                            element.innerHTML = translation.text;
                        } else {
                            element.textContent = translation.text;
                        }
                }
            }
        });

        // Update dynamic content
        this.updateDynamicContent(translations);
    }

    // Update dynamic content (content added after page load)
    updateDynamicContent(translations) {
        // Handle dynamically added elements
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === 1) { // Element node
                        const elements = node.querySelectorAll('[data-i18n]');
                        elements.forEach(element => {
                            const key = element.getAttribute('data-i18n');
                            if (translations[key]) {
                                const translation = translations[key];
                                if (translation.text.includes('<')) {
                                    element.innerHTML = translation.text;
                                } else {
                                    element.textContent = translation.text;
                                }
                            }
                        });
                    }
                });
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    // Fallback translations (basic translations for common elements)
    getFallbackTranslations(languageCode) {
        const fallbackTranslations = {
            'en': {
                'nav-features': 'Features',
                'nav-pricing': 'Pricing',
                'nav-about': 'About',
                'nav-login': 'Login',
                'nav-get-started': 'Get Started',
                'nav-dashboard': 'Dashboard',
                'nav-settings': 'Settings',
                'nav-profile': 'Profile',
                'nav-logout': 'Logout',
                'action-save': 'Save',
                'action-cancel': 'Cancel',
                'action-submit': 'Submit',
                'action-delete': 'Delete',
                'action-edit': 'Edit',
                'action-back': 'Back',
                'action-next': 'Next',
                'action-continue': 'Continue',
                'form-email': 'Email',
                'form-password': 'Password',
                'form-confirm-password': 'Confirm Password',
                'form-username': 'Username',
                'form-full-name': 'Full Name',
                'form-phone': 'Phone Number',
                'form-submit': 'Submit',
                'form-reset': 'Reset',
                'msg-loading': 'Loading...',
                'msg-success': 'Success!',
                'msg-error': 'Error!',
                'msg-warning': 'Warning!',
                'msg-info': 'Information'
            },
            'es': {
                'nav-features': 'Características',
                'nav-pricing': 'Precios',
                'nav-about': 'Acerca de',
                'nav-login': 'Iniciar sesión',
                'nav-get-started': 'Comenzar',
                'nav-dashboard': 'Panel',
                'nav-settings': 'Configuración',
                'nav-profile': 'Perfil',
                'nav-logout': 'Cerrar sesión',
                'action-save': 'Guardar',
                'action-cancel': 'Cancelar',
                'action-submit': 'Enviar',
                'action-delete': 'Eliminar',
                'action-edit': 'Editar',
                'action-back': 'Atrás',
                'action-next': 'Siguiente',
                'action-continue': 'Continuar',
                'form-email': 'Correo electrónico',
                'form-password': 'Contraseña',
                'form-confirm-password': 'Confirmar contraseña',
                'form-username': 'Nombre de usuario',
                'form-full-name': 'Nombre completo',
                'form-phone': 'Número de teléfono',
                'form-submit': 'Enviar',
                'form-reset': 'Restablecer',
                'msg-loading': 'Cargando...',
                'msg-success': '¡Éxito!',
                'msg-error': '¡Error!',
                'msg-warning': '¡Advertencia!',
                'msg-info': 'Información'
            },
            'fr': {
                'nav-features': 'Fonctionnalités',
                'nav-pricing': 'Tarifs',
                'nav-about': 'À propos',
                'nav-login': 'Connexion',
                'nav-get-started': 'Commencer',
                'nav-dashboard': 'Tableau de bord',
                'nav-settings': 'Paramètres',
                'nav-profile': 'Profil',
                'nav-logout': 'Déconnexion',
                'action-save': 'Enregistrer',
                'action-cancel': 'Annuler',
                'action-submit': 'Soumettre',
                'action-delete': 'Supprimer',
                'action-edit': 'Modifier',
                'action-back': 'Retour',
                'action-next': 'Suivant',
                'action-continue': 'Continuer',
                'form-email': 'E-mail',
                'form-password': 'Mot de passe',
                'form-confirm-password': 'Confirmer le mot de passe',
                'form-username': 'Nom d\'utilisateur',
                'form-full-name': 'Nom complet',
                'form-phone': 'Numéro de téléphone',
                'form-submit': 'Soumettre',
                'form-reset': 'Réinitialiser',
                'msg-loading': 'Chargement...',
                'msg-success': 'Succès !',
                'msg-error': 'Erreur !',
                'msg-warning': 'Attention !',
                'msg-info': 'Information'
            },
            'zh': {
                'nav-features': '功能',
                'nav-pricing': '定价',
                'nav-about': '关于',
                'nav-login': '登录',
                'nav-get-started': '开始使用',
                'nav-dashboard': '仪表板',
                'nav-settings': '设置',
                'nav-profile': '个人资料',
                'nav-logout': '退出登录',
                'action-save': '保存',
                'action-cancel': '取消',
                'action-submit': '提交',
                'action-delete': '删除',
                'action-edit': '编辑',
                'action-back': '返回',
                'action-next': '下一步',
                'action-continue': '继续',
                'form-email': '电子邮件',
                'form-password': '密码',
                'form-confirm-password': '确认密码',
                'form-username': '用户名',
                'form-full-name': '全名',
                'form-phone': '电话号码',
                'form-submit': '提交',
                'form-reset': '重置',
                'msg-loading': '加载中...',
                'msg-success': '成功！',
                'msg-error': '错误！',
                'msg-warning': '警告！',
                'msg-info': '信息'
            },
            'ar': {
                'nav-features': 'الميزات',
                'nav-pricing': 'الأسعار',
                'nav-about': 'حول',
                'nav-login': 'تسجيل الدخول',
                'nav-get-started': 'ابدأ الآن',
                'nav-dashboard': 'لوحة التحكم',
                'nav-settings': 'الإعدادات',
                'nav-profile': 'الملف الشخصي',
                'nav-logout': 'تسجيل الخروج',
                'action-save': 'حفظ',
                'action-cancel': 'إلغاء',
                'action-submit': 'إرسال',
                'action-delete': 'حذف',
                'action-edit': 'تعديل',
                'action-back': 'رجوع',
                'action-next': 'التالي',
                'action-continue': 'متابعة',
                'form-email': 'البريد الإلكتروني',
                'form-password': 'كلمة المرور',
                'form-confirm-password': 'تأكيد كلمة المرور',
                'form-username': 'اسم المستخدم',
                'form-full-name': 'الاسم الكامل',
                'form-phone': 'رقم الهاتف',
                'form-submit': 'إرسال',
                'form-reset': 'إعادة تعيين',
                'msg-loading': 'جاري التحميل...',
                'msg-success': 'نجح!',
                'msg-error': 'خطأ!',
                'msg-warning': 'تحذير!',
                'msg-info': 'معلومات'
            },
            'de': {
                'nav-features': 'Funktionen',
                'nav-pricing': 'Preise',
                'nav-about': 'Über uns',
                'nav-login': 'Anmelden',
                'nav-get-started': 'Loslegen',
                'nav-dashboard': 'Dashboard',
                'nav-settings': 'Einstellungen',
                'nav-profile': 'Profil',
                'nav-logout': 'Abmelden',
                'action-save': 'Speichern',
                'action-cancel': 'Abbrechen',
                'action-submit': 'Senden',
                'action-delete': 'Löschen',
                'action-edit': 'Bearbeiten',
                'action-back': 'Zurück',
                'action-next': 'Weiter',
                'action-continue': 'Fortfahren',
                'form-email': 'E-Mail',
                'form-password': 'Passwort',
                'form-confirm-password': 'Passwort bestätigen',
                'form-username': 'Benutzername',
                'form-full-name': 'Vollständiger Name',
                'form-phone': 'Telefonnummer',
                'form-submit': 'Senden',
                'form-reset': 'Zurücksetzen',
                'msg-loading': 'Lädt...',
                'msg-success': 'Erfolg!',
                'msg-error': 'Fehler!',
                'msg-warning': 'Warnung!',
                'msg-info': 'Information'
            },
            'it': {
                'nav-features': 'Funzionalità',
                'nav-pricing': 'Prezzi',
                'nav-about': 'Chi siamo',
                'nav-login': 'Accedi',
                'nav-get-started': 'Inizia ora',
                'nav-dashboard': 'Dashboard',
                'nav-settings': 'Impostazioni',
                'nav-profile': 'Profilo',
                'nav-logout': 'Esci',
                'action-save': 'Salva',
                'action-cancel': 'Annulla',
                'action-submit': 'Invia',
                'action-delete': 'Elimina',
                'action-edit': 'Modifica',
                'action-back': 'Indietro',
                'action-next': 'Avanti',
                'action-continue': 'Continua',
                'form-email': 'Email',
                'form-password': 'Password',
                'form-confirm-password': 'Conferma password',
                'form-username': 'Nome utente',
                'form-full-name': 'Nome completo',
                'form-phone': 'Numero di telefono',
                'form-submit': 'Invia',
                'form-reset': 'Reimposta',
                'msg-loading': 'Caricamento...',
                'msg-success': 'Successo!',
                'msg-error': 'Errore!',
                'msg-warning': 'Attenzione!',
                'msg-info': 'Informazioni'
            },
            'pt': {
                'nav-features': 'Recursos',
                'nav-pricing': 'Preços',
                'nav-about': 'Sobre',
                'nav-login': 'Entrar',
                'nav-get-started': 'Começar',
                'nav-dashboard': 'Painel',
                'nav-settings': 'Configurações',
                'nav-profile': 'Perfil',
                'nav-logout': 'Sair',
                'action-save': 'Salvar',
                'action-cancel': 'Cancelar',
                'action-submit': 'Enviar',
                'action-delete': 'Excluir',
                'action-edit': 'Editar',
                'action-back': 'Voltar',
                'action-next': 'Próximo',
                'action-continue': 'Continuar',
                'form-email': 'E-mail',
                'form-password': 'Senha',
                'form-confirm-password': 'Confirmar senha',
                'form-username': 'Nome de usuário',
                'form-full-name': 'Nome completo',
                'form-phone': 'Número de telefone',
                'form-submit': 'Enviar',
                'form-reset': 'Redefinir',
                'msg-loading': 'Carregando...',
                'msg-success': 'Sucesso!',
                'msg-error': 'Erro!',
                'msg-warning': 'Aviso!',
                'msg-info': 'Informação'
            },
            'ru': {
                'nav-features': 'Функции',
                'nav-pricing': 'Цены',
                'nav-about': 'О нас',
                'nav-login': 'Войти',
                'nav-get-started': 'Начать',
                'nav-dashboard': 'Панель управления',
                'nav-settings': 'Настройки',
                'nav-profile': 'Профиль',
                'nav-logout': 'Выйти',
                'action-save': 'Сохранить',
                'action-cancel': 'Отмена',
                'action-submit': 'Отправить',
                'action-delete': 'Удалить',
                'action-edit': 'Редактировать',
                'action-back': 'Назад',
                'action-next': 'Далее',
                'action-continue': 'Продолжить',
                'form-email': 'Электронная почта',
                'form-password': 'Пароль',
                'form-confirm-password': 'Подтвердите пароль',
                'form-username': 'Имя пользователя',
                'form-full-name': 'Полное имя',
                'form-phone': 'Номер телефона',
                'form-submit': 'Отправить',
                'form-reset': 'Сбросить',
                'msg-loading': 'Загрузка...',
                'msg-success': 'Успех!',
                'msg-error': 'Ошибка!',
                'msg-warning': 'Предупреждение!',
                'msg-info': 'Информация'
            },
            'ja': {
                'nav-features': '機能',
                'nav-pricing': '料金',
                'nav-about': '会社概要',
                'nav-login': 'ログイン',
                'nav-get-started': '始める',
                'nav-dashboard': 'ダッシュボード',
                'nav-settings': '設定',
                'nav-profile': 'プロフィール',
                'nav-logout': 'ログアウト',
                'action-save': '保存',
                'action-cancel': 'キャンセル',
                'action-submit': '送信',
                'action-delete': '削除',
                'action-edit': '編集',
                'action-back': '戻る',
                'action-next': '次へ',
                'action-continue': '続行',
                'form-email': 'メールアドレス',
                'form-password': 'パスワード',
                'form-confirm-password': 'パスワード確認',
                'form-username': 'ユーザー名',
                'form-full-name': '氏名',
                'form-phone': '電話番号',
                'form-submit': '送信',
                'form-reset': 'リセット',
                'msg-loading': '読み込み中...',
                'msg-success': '成功！',
                'msg-error': 'エラー！',
                'msg-warning': '警告！',
                'msg-info': '情報'
            },
            'ko': {
                'nav-features': '기능',
                'nav-pricing': '가격',
                'nav-about': '소개',
                'nav-login': '로그인',
                'nav-get-started': '시작하기',
                'nav-dashboard': '대시보드',
                'nav-settings': '설정',
                'nav-profile': '프로필',
                'nav-logout': '로그아웃',
                'action-save': '저장',
                'action-cancel': '취소',
                'action-submit': '제출',
                'action-delete': '삭제',
                'action-edit': '편집',
                'action-back': '뒤로',
                'action-next': '다음',
                'action-continue': '계속',
                'form-email': '이메일',
                'form-password': '비밀번호',
                'form-confirm-password': '비밀번호 확인',
                'form-username': '사용자 이름',
                'form-full-name': '전체 이름',
                'form-phone': '전화번호',
                'form-submit': '제출',
                'form-reset': '재설정',
                'msg-loading': '로딩 중...',
                'msg-success': '성공!',
                'msg-error': '오류!',
                'msg-warning': '경고!',
                'msg-info': '정보'
            }
        };

        return fallbackTranslations[languageCode] || fallbackTranslations['en'];
    }

    // Update meta tags
    updateMetaTags(translations) {
        // Update meta description
        const metaDescription = document.querySelector('meta[name="description"]');
        if (metaDescription && translations['meta-description']) {
            metaDescription.content = translations['meta-description'];
        }

        // Update title
        if (translations['page-title']) {
            document.title = translations['page-title'];
        }

        // Update other meta tags
        const metaTags = document.querySelectorAll('meta[data-i18n]');
        metaTags.forEach(tag => {
            const key = tag.getAttribute('data-i18n');
            if (translations[key]) {
                tag.content = translations[key];
            }
        });
    }

    // Update text direction based on language
    updateTextDirection(languageCode) {
        const rtlLanguages = ['ar', 'he', 'fa', 'ur'];
        document.body.dir = rtlLanguages.includes(languageCode) ? 'rtl' : 'ltr';
        
        // Add/remove RTL class
        if (rtlLanguages.includes(languageCode)) {
            document.body.classList.add('rtl');
        } else {
            document.body.classList.remove('rtl');
        }
    }

    // Get current language
    getCurrentLanguage() {
        return this.currentLanguage;
    }

    // Get translation for a specific key
    getTranslation(key) {
        return this.translations[key] || key;
    }
}

// Create and export singleton instance
const translationManager = new TranslationManager();

// Log detected language for debugging
console.log(`Translation Manager initialized with language: ${translationManager.getCurrentLanguage()}`);

export default translationManager;