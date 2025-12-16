// Smart Committer — логика страницы проекта
console.log('🤖 Smart Committer page loaded');

// ========================================
// Инициализация при загрузке DOM
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('📄 Initializing Smart Committer components...');
    
    // Этап 2: Матрица сообщений
    initMatrixBackground();
    
    // Этап 3: Интерактивная архитектура
    // initArchitectureDiagram();
    
    // Этап 4: Демо-чат
    // initDemoChat();
    
    // Этап 5: Антидетект
    // initAntidetectDemo();
    
    // Этап 6: Мелкие улучшения
    // initAccountCards();
    // initSecretMode();
    
    console.log('✅ Smart Committer initialized');
});

// Инициализация матрицы
function initMatrixBackground() {
    const matrix = new MatrixBackground('matrix-bg');
    window.matrixBackground = matrix;
}

// ========================================
// Этап 2: Матрица сообщений
// ========================================

class MatrixBackground {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            console.log('❌ Matrix container not found');
            return;
        }
        
        this.columns = [];
        // Символы для матрицы — микс иконок и текстовых фрагментов
        this.symbols = [
            '💬', '📨', '✉️', '🤖', '📱', '💭', '✨', '⚡',
            'AI', 'Tg', '>>>', '...', '←', '→', '◆', '●',
            '01', '10', '{}', '[]', '//', '**', '##', '@@'
        ];
        this.columnCount = this.calculateColumnCount();
        
        this.init();
        this.setupResizeHandler();
        
        console.log('✅ Matrix background initialized');
    }
    
    calculateColumnCount() {
        // Адаптивное количество колонок
        const width = window.innerWidth;
        if (width < 480) return 8;
        if (width < 768) return 12;
        if (width < 1024) return 18;
        return 25;
    }
    
    init() {
        this.container.innerHTML = '';
        this.columns = [];
        
        for (let i = 0; i < this.columnCount; i++) {
            this.createColumn(i);
        }
    }
    
    createColumn(index) {
        const column = document.createElement('div');
        column.className = 'matrix-column';
        
        // Позиция колонки
        const left = (index / this.columnCount) * 100 + (Math.random() * 3 - 1.5);
        column.style.left = `${left}%`;
        
        // Случайная скорость (1-5)
        const speed = Math.floor(Math.random() * 5) + 1;
        column.classList.add(`speed-${speed}`);
        
        // Случайная задержка (1-8)
        const delay = Math.floor(Math.random() * 8) + 1;
        column.classList.add(`delay-${delay}`);
        
        // Генерируем символы для колонки (5-12 символов)
        const charCount = Math.floor(Math.random() * 8) + 5;
        for (let j = 0; j < charCount; j++) {
            const char = document.createElement('span');
            char.className = 'matrix-char';
            char.textContent = this.getRandomSymbol();
            column.appendChild(char);
        }
        
        this.container.appendChild(column);
        this.columns.push(column);
    }
    
    getRandomSymbol() {
        return this.symbols[Math.floor(Math.random() * this.symbols.length)];
    }
    
    setupResizeHandler() {
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                const newCount = this.calculateColumnCount();
                if (newCount !== this.columnCount) {
                    this.columnCount = newCount;
                    this.init();
                }
            }, 250);
        });
    }
    
    // Метод для обновления символов (можно вызывать периодически)
    refreshSymbols() {
        this.columns.forEach(column => {
            const chars = column.querySelectorAll('.matrix-char');
            chars.forEach(char => {
                if (Math.random() < 0.1) { // 10% шанс замены
                    char.textContent = this.getRandomSymbol();
                }
            });
        });
    }
    
    destroy() {
        this.container.innerHTML = '';
        this.columns = [];
        console.log('🗑️ Matrix background destroyed');
    }
}

// ========================================
// Этап 3: Интерактивная архитектура
// ========================================

class ArchitectureDiagram {
    constructor(svgId) {
        this.svg = document.getElementById(svgId);
        this.nodes = [];
        this.activeNode = null;
    }
    
    // TODO: Реализовать в Этапе 3
}

// ========================================
// Этап 4: Демо-чат
// ========================================

class TypingSimulator {
    constructor() {
        this.baseSpeed = 80; // ms между символами
        this.typoChance = 0.1; // 10% шанс опечатки
        this.pauseChance = 0.05; // 5% шанс паузы
    }
    
    // TODO: Реализовать в Этапе 4
}

class DemoChat {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.typingSimulator = new TypingSimulator();
        this.scenarios = [
            {
                input: "Привет, кто тут?",
                responses: [
                    "Прив!) тоже тут сижу, читаю",
                    "Привет, да вот залипаю в канале",
                    "Хай! Что нового?"
                ]
            },
            {
                input: "Что думаете о крипте?",
                responses: [
                    "Ну смотря какой... битка норм держится",
                    "Сложная тема, я бы осторожно",
                    "Не особо слежу, но вроде растёт"
                ]
            },
            {
                input: "Посоветуйте что почитать",
                responses: [
                    "Зависит от темы, тебе про что?",
                    "Недавно читал интересную статью, скину если найду",
                    "Ммм, сложно так сказать, что тебе интересно?"
                ]
            },
            {
                input: "Кто-нибудь пробовал...?",
                responses: [
                    "Я пробовал, но давно уже",
                    "Не, не сталкивался пока",
                    "Слышал про это, но сам не юзал"
                ]
            },
            {
                input: "Админ тут?",
                responses: [
                    "Хз, вроде иногда появляется",
                    "Видел его недавно в чате",
                    "Не видел сегодня, но обычно отвечает"
                ]
            }
        ];
    }
    
    // TODO: Реализовать в Этапе 4
}

// ========================================
// Этап 5: Антидетект + Наблюдатель
// ========================================

class NeuralNetworkViz {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.nodes = [];
        this.connections = [];
        this.mode = 'normal'; // 'normal' | 'conservative'
    }
    
    // TODO: Реализовать в Этапе 5
}

class ObserverEye {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.isWatching = false;
        this.isEnabled = false;
    }
    
    // TODO: Реализовать в Этапе 5
}

// ========================================
// Этап 6: Мелкие улучшения
// ========================================

class AccountCards {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.accounts = [
            { id: 1, status: 'active' },
            { id: 2, status: 'active' },
            { id: 3, status: 'working' },
            { id: 4, status: 'active' },
            { id: 5, status: 'cooldown' },
            { id: 6, status: 'active' }
        ];
    }
    
    // TODO: Реализовать в Этапе 6
}

// Секретный режим
function initSecretMode() {
    // Триггер: ввод /debug в демо-чат
    // TODO: Реализовать в Этапе 6
}

// ========================================
// Экспорт для отладки
// ========================================

window.SmartCommitter = {
    MatrixBackground,
    ArchitectureDiagram,
    TypingSimulator,
    DemoChat,
    NeuralNetworkViz,
    ObserverEye,
    AccountCards
};

