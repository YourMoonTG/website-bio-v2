// Основная логика сайта
console.log('[main] main.js loaded');

// Инициализация при загрузке DOM
document.addEventListener('DOMContentLoaded', () => {
    console.log('[main] DOM ready, init components...');
    
    // Инициализируем все компоненты
    setImageFallbacks();
    initThemeToggle();
    initSmoothScroll();
    initScrollAnimations();
    initTypewriterEffect();
    
    console.log('[main] components initialized');
});

// Переключение темы
function initThemeToggle() {
    console.log('[theme] init toggle...');
    
    // Определяем базовый путь к иконкам в зависимости от глубины страницы
    const isProjectPage = window.location.pathname.includes('/projects/');
    const iconBasePath = isProjectPage ? '../assets/icons/' : 'assets/icons/';
    
    const icons = {
        sun: iconBasePath + 'icon-sun.svg',
        moon: iconBasePath + 'icon-moon.svg'
    };
    
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;
    
    if (!themeToggle) {
        console.log('[theme] toggle not found');
        return;
    }
    
    // Загружаем сохраненную тему
    const savedTheme = localStorage.getItem('theme') || 'dark';
    body.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
    
    themeToggle.addEventListener('click', () => {
        const currentTheme = body.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        body.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme);
        
        console.log(`[theme] switched to: ${newTheme}`);
    });
    
    function updateThemeIcon(theme) {
        const icon = themeToggle.querySelector('.theme-icon');
        if (icon) {
            icon.src = theme === 'dark' ? icons.sun : icons.moon;
            icon.alt = theme === 'dark' ? 'Светлая тема' : 'Тёмная тема';
        }
    }
}

// Плавная прокрутка
function initSmoothScroll() {
    console.log('[scroll] init smooth scroll...');
    
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const targetId = link.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                e.preventDefault();
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = targetElement.offsetTop - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
                
                console.log(`[scroll] to section: ${targetId}`);
            } else {
                // Элемента нет на странице — переходим по ссылке (например, с внутренних страниц)
                window.location.href = link.href;
            }
        });
    });
}

// Анимации при скролле
function initScrollAnimations() {
    console.log('[scroll] init animations...');
    
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                console.log(`[scroll] visible: ${entry.target.className}`);
            }
        });
    }, observerOptions);
    
    // Наблюдаем за элементами
    const animatedElements = document.querySelectorAll('.project-card, .about-content, .contact-content');
    animatedElements.forEach(el => {
        el.classList.add('scroll-animate');
        observer.observe(el);
    });
}

// Эффект печатания с постоянным курсором
function initTypewriterEffect() {
    console.log('[typewriter] init...');
    
    const greetingElement = document.getElementById('greeting');
    const nameElement = document.getElementById('name');
    const questionElement = document.getElementById('question');
    
    if (!greetingElement || !nameElement || !questionElement) {
        console.log('[typewriter] elements not found');
        return;
    }
    
    // Очищаем все элементы
    greetingElement.textContent = '';
    nameElement.textContent = '';
    questionElement.textContent = '';
    
    // Функция печатания БЕЗ курсора (для промежуточных элементов)
    function typeTextNoCursor(element, text, speed = 100) {
        return new Promise((resolve) => {
            let i = 0;
            
            function typeChar() {
                if (i < text.length) {
                    // Показываем текст + курсор во время печатания
                    element.innerHTML = text.substring(0, i + 1) + '<span class="cursor">|</span>';
                    i++;
                    setTimeout(typeChar, speed);
                } else {
                    // Убираем курсор в конце
                    element.innerHTML = text;
                    resolve();
                }
            }
            
            typeChar();
        });
    }
    
    // Функция добавления текста БЕЗ курсора
    function appendTextNoCursor(element, additionalText, speed = 100) {
        return new Promise((resolve) => {
            const currentText = element.textContent;
            const newText = currentText + additionalText;
            let i = currentText.length;
            
            function typeChar() {
                if (i < newText.length) {
                    element.innerHTML = newText.substring(0, i + 1) + '<span class="cursor">|</span>';
                    i++;
                    setTimeout(typeChar, speed);
                } else {
                    element.innerHTML = newText;
                    resolve();
                }
            }
            
            typeChar();
        });
    }
    
    // Функция печатания С курсором (только для последнего элемента)
    function typeTextWithCursor(element, text, speed = 100) {
        return new Promise((resolve) => {
            let i = 0;
            
            function typeChar() {
                if (i < text.length) {
                    // Показываем текст + курсор
                    element.innerHTML = text.substring(0, i + 1) + '<span class="cursor">|</span>';
                    i++;
                    setTimeout(typeChar, speed);
                } else {
                    // Оставляем курсор в конце
                    element.innerHTML = text + '<span class="cursor">|</span>';
                    resolve();
                }
            }
            
            typeChar();
        });
    }
    
    // Последовательность печатания
    async function startTyping() {
        console.log('[typewriter] start typing...');
        
        // 1. "Привет" - БЕЗ курсора в конце
        await typeTextNoCursor(greetingElement, 'Привет', 80);
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // 2. ", я" - БЕЗ курсора в конце
        await appendTextNoCursor(greetingElement, ', я', 80);
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // 3. "Moon" - БЕЗ курсора в конце
        await typeTextNoCursor(nameElement, 'Moon', 120);
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 4. "познакомимся?" - С курсором в конце (единственный курсор)
        await typeTextWithCursor(questionElement, 'познакомимся?', 150);
        
        console.log('[typewriter] completed');
    }
    
    // Запускаем через задержку
    setTimeout(startTyping, 1000);
}

// Утилиты
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Обработка изменения размера окна
window.addEventListener('resize', debounce(() => {
    console.log('[responsive] window resized');
    // Здесь можно добавить логику для адаптивности
}, 250));

// Обработка ошибок
window.addEventListener('error', (e) => {
    console.error('[error] JavaScript:', e.error);
});

// Фолбек для иконок (если CDN недоступен)
function setImageFallbacks() {
    const fallback =
        'data:image/svg+xml;base64,' +
        'PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgZmlsbD0ibm9uZSIgdmlld0JveD0iMCAwIDI0IDI0Ij4KPHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiByeD0iNSIgZmlsbD0iIzBiMGIwZiIvPgo8cGF0aCBkPSJNMTIgNWE3IDcgMCAxIDEgMCAxNGMwLTIuMjA5LS44OTItMy43NTgtMi4yOTItNS4wNTctMS40MDItMS4yOTgtMy4yMzktMS45NDEtNC43MDgtMS45NDFAIiBmaWxsPSIjMDBmZjg4Ii8+Cjwvc3ZnPg==';
    
    document.querySelectorAll('img.icon-img, img.theme-icon, img.contact-icon').forEach(img => {
        img.referrerPolicy = 'no-referrer';
        img.addEventListener('error', () => {
            if (img.dataset.fallbackApplied) return;
            img.src = fallback;
            img.dataset.fallbackApplied = '1';
        }, { once: true });
    });
}

// Экспорт функций для использования в других модулях
window.BioWebsite = {
    initThemeToggle,
    initSmoothScroll,
    initScrollAnimations,
    initTypewriterEffect
};
