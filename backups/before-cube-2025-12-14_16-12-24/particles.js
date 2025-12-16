// Модуль звездного неба с эффектом "звездного ветра"
console.log('✨ Загружен particles.js');

class StarField {
    constructor() {
        this.container = null;
        this.stars = [];
        this.animationId = null;
        this.mouseX = 0;
        this.mouseY = 0;
        this.mouseVelocity = { x: 0, y: 0 };
        this.lastMouseX = 0;
        this.lastMouseY = 0;
        this.isVisible = true; // Флаг видимости страницы
        
        this.init();
    }
    
    init() {
        console.log('✨ Инициализируем звездное небо...');
        
        this.container = document.getElementById('particles');
        if (!this.container) {
            console.log('❌ Контейнер частиц не найден');
            return;
        }
        
        this.createStars();
        this.addEventListeners();
        this.animate();
        
        console.log('✅ Звездное небо инициализировано');
    }
    
    createStars() {
        const starCount = 200; // Больше звезд для реалистичности
        
        for (let i = 0; i < starCount; i++) {
            const star = document.createElement('div');
            star.className = 'star';
            
            // Случайные параметры звезды
            const size = Math.random() * 3 + 1; // Размер от 1 до 4px (увеличили)
            const x = Math.random() * 100;
            const y = Math.random() * 100;
            const opacity = Math.random() * 0.8 + 0.2; // Яркость от 0.2 до 1
            const twinkleSpeed = Math.random() * 3 + 1; // Скорость мерцания
            const layer = Math.floor(Math.random() * 3) + 1; // Слой глубины (1-3)
            
            // Новые цвета звезд (белые, голубые, зеленые оттенки)
            const colors = ['#ffffff', '#e8f5e8', '#c8f7c8', '#a8ffa8', '#88ff88', '#b8e6ff', '#d8f0ff'];
            const color = colors[Math.floor(Math.random() * colors.length)];
            
            // Применяем стили
            star.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                background: ${color};
                border-radius: 50%;
                left: ${x}%;
                top: ${y}%;
                opacity: ${opacity};
                pointer-events: none;
                box-shadow: 0 0 ${size * 2}px ${color};
                animation: twinkle ${twinkleSpeed}s ease-in-out infinite;
                z-index: ${layer};
            `;
            
            this.container.appendChild(star);
            this.stars.push({
                element: star,
                x: x,
                y: y,
                originalX: x,
                originalY: y,
                vx: 0,
                vy: 0,
                size: size,
                layer: layer,
                color: color,
                twinkleSpeed: twinkleSpeed
            });
        }
        
        console.log(`✅ Создано ${this.stars.length} звезд`);
    }
    
    addEventListeners() {
        // Отслеживаем движение мыши относительно контейнера звезд
        this.container.addEventListener('mousemove', (e) => {
            this.lastMouseX = this.mouseX;
            this.lastMouseY = this.mouseY;
            
            // Получаем координаты относительно контейнера звезд
            const rect = this.container.getBoundingClientRect();
            this.mouseX = e.clientX - rect.left;
            this.mouseY = e.clientY - rect.top;
            
            // Вычисляем скорость движения мыши
            this.mouseVelocity.x = this.mouseX - this.lastMouseX;
            this.mouseVelocity.y = this.mouseY - this.lastMouseY;
        });
        
        // Обработка выхода мыши из контейнера
        this.container.addEventListener('mouseleave', () => {
            this.mouseX = -1000; // Убираем влияние мыши
            this.mouseY = -1000;
        });
        
        // Обработка изменения размера окна
        window.addEventListener('resize', () => {
            this.updateStarPositions();
        });
        
        // Обработка видимости hero секции
        this.setupIntersectionObserver();
    }
    
    animate() {
        this.animationId = requestAnimationFrame(() => this.animate());
        
        // Пропускаем анимацию если страница не видна
        if (!this.isVisible) {
            return;
        }
        
        this.stars.forEach(star => {
            // Вычисляем расстояние до курсора (координаты уже относительно контейнера)
            const dx = this.mouseX - (star.x * this.container.offsetWidth / 100);
            const dy = this.mouseY - (star.y * this.container.offsetHeight / 100);
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Эффект "звездного ветра" - звезды отклоняются от курсора
            const windStrength = Math.max(0, 1 - distance / 150); // Влияние в радиусе 150px
            const windForce = windStrength * 0.3; // Уменьшили силу ветра
            
            // Направление "ветра" - от курсора (только если курсор близко)
            if (distance < 150) {
                const windX = -dx / distance * windForce;
                const windY = -dy / distance * windForce;
                
                // Применяем силу ветра (слои реагируют по-разному)
                const layerMultiplier = 1 / star.layer; // Ближние слои сильнее реагируют
                star.vx += windX * layerMultiplier;
                star.vy += windY * layerMultiplier;
            }
            
            // Сильное затухание (звезды возвращаются к исходной позиции)
            const returnForce = 0.05; // Увеличили силу возврата
            star.vx += (star.originalX - star.x) * returnForce;
            star.vy += (star.originalY - star.y) * returnForce;
            
            // Ограничиваем скорость
            const maxSpeed = 2;
            star.vx = Math.max(-maxSpeed, Math.min(maxSpeed, star.vx));
            star.vy = Math.max(-maxSpeed, Math.min(maxSpeed, star.vy));
            
            // Затухание скорости (более сильное)
            star.vx *= 0.9;
            star.vy *= 0.9;
            
            // Обновляем позицию
            star.x += star.vx;
            star.y += star.vy;
            
            // Границы экрана
            if (star.x < 0 || star.x > 100) {
                star.vx *= -0.5;
                star.x = Math.max(0, Math.min(100, star.x));
            }
            
            if (star.y < 0 || star.y > 100) {
                star.vy *= -0.5;
                star.y = Math.max(0, Math.min(100, star.y));
            }
            
            // Обновляем позицию элемента
            star.element.style.left = star.x + '%';
            star.element.style.top = star.y + '%';
            
            // Эффект свечения при движении
            const speed = Math.sqrt(star.vx * star.vx + star.vy * star.vy);
            const glowIntensity = Math.min(1, speed * 0.5);
            star.element.style.boxShadow = `0 0 ${star.size * (2 + glowIntensity * 3)}px ${star.color}`;
        });
    }
    
    updateStarPositions() {
        // Обновляем позиции звезд при изменении размера окна
        this.stars.forEach(star => {
            star.x = Math.random() * 100;
            star.y = Math.random() * 100;
            star.originalX = star.x;
            star.originalY = star.y;
        });
    }
    
    setupIntersectionObserver() {
        // Создаем observer для отслеживания видимости hero секции
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.resumeAnimation();
                } else {
                    this.pauseAnimation();
                }
            });
        }, {
            threshold: 0.1 // Срабатывает когда 10% секции видно
        });
        
        // Наблюдаем за hero секцией
        const heroSection = document.querySelector('.hero');
        if (heroSection) {
            observer.observe(heroSection);
        }
    }
    
    pauseAnimation() {
        this.isVisible = false;
        console.log('⏸️ Анимация звезд приостановлена (hero не виден)');
    }
    
    resumeAnimation() {
        this.isVisible = true;
        console.log('▶️ Анимация звезд возобновлена (hero виден)');
    }
    
    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        if (this.container) {
            this.container.innerHTML = '';
        }
        
        console.log('🗑️ Звездное небо уничтожено');
    }
}

// Инициализируем звездное небо при загрузке DOM
document.addEventListener('DOMContentLoaded', () => {
    console.log('✨ Инициализируем звездное небо...');
    window.starField = new StarField();
});

// Экспорт для использования в других модулях
window.StarField = StarField;
