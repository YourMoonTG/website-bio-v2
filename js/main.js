// Основная логика сайта
console.log('🚀 Загружен main.js');

// Инициализация при загрузке DOM
document.addEventListener('DOMContentLoaded', () => {
    console.log('📄 DOM загружен, инициализируем компоненты...');
    
    // Инициализируем все компоненты
    initThemeToggle();
    initSmoothScroll();
    initScrollAnimations();
    initTypewriterEffect();
    
    console.log('✅ Все компоненты инициализированы');
});

// Переключение темы
function initThemeToggle() {
    console.log('🎨 Инициализируем переключатель темы...');
    
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;
    
    if (!themeToggle) {
        console.log('❌ Переключатель темы не найден');
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
        
        console.log(`🔄 Тема изменена на: ${newTheme}`);
    });
    
    function updateThemeIcon(theme) {
        const icon = themeToggle.querySelector('.theme-icon');
        if (icon) {
            icon.textContent = theme === 'dark' ? '☀️' : '🌙';
        }
    }
}

// Плавная прокрутка
function initSmoothScroll() {
    console.log('📜 Инициализируем плавную прокрутку...');
    
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            const targetId = link.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = targetElement.offsetTop - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
                
                console.log(`📍 Прокрутка к секции: ${targetId}`);
            }
        });
    });
}

// Анимации при скролле
function initScrollAnimations() {
    console.log('✨ Инициализируем анимации при скролле...');
    
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                console.log(`👁️ Элемент появился: ${entry.target.className}`);
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
    console.log('⌨️ Инициализируем печатание...');
    
    const greetingElement = document.getElementById('greeting');
    const nameElement = document.getElementById('name');
    const questionElement = document.getElementById('question');
    
    if (!greetingElement || !nameElement || !questionElement) {
        console.log('❌ Элементы для печатания не найдены');
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
        console.log('⌨️ Начинаем печатание...');
        
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
        
        console.log('✅ Печатание завершено');
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
    console.log('📱 Размер окна изменен');
    // Здесь можно добавить логику для адаптивности
}, 250));

// Обработка ошибок
window.addEventListener('error', (e) => {
    console.error('❌ Ошибка JavaScript:', e.error);
});

// Экспорт функций для использования в других модулях
window.BioWebsite = {
    initThemeToggle,
    initSmoothScroll,
    initScrollAnimations,
    initTypewriterEffect
};
