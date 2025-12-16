# Дизайн-система - Bio Website v2

## 🎨 Цветовая палитра

### **Основные цвета**

```css
:root {
  /* Primary Colors - Неоновые акценты */
  --primary-500: #00ff88;        /* Основной зеленый неон */
  --primary-400: #33ff99;        /* Светлый зеленый */
  --primary-600: #00cc6a;        /* Темный зеленый */
  --primary-700: #00a855;        /* Очень темный зеленый */
  
  --secondary-500: #00d4ff;      /* Голубой неон */
  --secondary-400: #33ddff;      /* Светлый голубой */
  --secondary-600: #00aacc;      /* Темный голубой */
  
  --accent-500: #ff6b6b;         /* Красный акцент */
  --accent-400: #ff8a8a;        /* Светлый красный */
  --accent-600: #cc5555;         /* Темный красный */
  
  /* Neutral Colors - Темная тема */
  --dark-900: #0a0a0a;          /* Основной фон */
  --dark-800: #1a1a1a;          /* Вторичный фон */
  --dark-700: #2a2a2a;          /* Третичный фон */
  --dark-600: #3a3a3a;          /* Границы */
  --dark-500: #4a4a4a;          /* Неактивные элементы */
  
  /* Text Colors */
  --text-primary: #ffffff;      /* Основной текст */
  --text-secondary: #b0b0b0;     /* Вторичный текст */
  --text-muted: #808080;         /* Приглушенный текст */
  --text-inverse: #000000;       /* Текст на светлом фоне */
  
  /* Status Colors */
  --success: #66bb6a;             /* Успех */
  --warning: #ffa726;            /* Предупреждение */
  --error: #f44336;              /* Ошибка */
  --info: #29b6f6;              /* Информация */
}
```

### **Градиенты**

```css
:root {
  /* Primary Gradients */
  --gradient-primary: linear-gradient(135deg, var(--primary-500), var(--secondary-500));
  --gradient-primary-hover: linear-gradient(135deg, var(--primary-400), var(--secondary-400));
  --gradient-primary-dark: linear-gradient(135deg, var(--primary-600), var(--secondary-600));
  
  /* Background Gradients */
  --gradient-bg: linear-gradient(135deg, var(--dark-900), var(--dark-800));
  --gradient-card: linear-gradient(145deg, var(--dark-800), var(--dark-700));
  --gradient-hero: radial-gradient(circle at 20% 50%, rgba(0, 255, 136, 0.1) 0%, transparent 50%);
  
  /* Text Gradients */
  --gradient-text: linear-gradient(135deg, var(--primary-500), var(--secondary-500));
  --gradient-text-hover: linear-gradient(135deg, var(--primary-400), var(--secondary-400));
}
```

### **Тени и эффекты**

```css
:root {
  /* Glow Effects */
  --glow-primary: 0 0 20px rgba(0, 255, 136, 0.3);
  --glow-secondary: 0 0 20px rgba(0, 212, 255, 0.3);
  --glow-accent: 0 0 20px rgba(255, 107, 107, 0.3);
  
  /* Card Shadows */
  --shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.1);
  --shadow-md: 0 4px 8px rgba(0, 0, 0, 0.15);
  --shadow-lg: 0 8px 16px rgba(0, 0, 0, 0.2);
  --shadow-xl: 0 16px 32px rgba(0, 0, 0, 0.25);
  --shadow-glow: 0 0 30px rgba(0, 255, 136, 0.2);
  
  /* Inset Shadows */
  --shadow-inset: inset 0 2px 4px rgba(0, 0, 0, 0.1);
  --shadow-inset-glow: inset 0 0 10px rgba(0, 255, 136, 0.1);
}
```

## 📝 Типографика

### **Шрифты**

```css
:root {
  /* Font Families */
  --font-primary: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-heading: 'Orbitron', 'Courier New', monospace;
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;
  
  /* Font Weights */
  --font-light: 300;
  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;
  --font-extrabold: 800;
  --font-black: 900;
}
```

### **Размеры текста**

```css
:root {
  /* Text Sizes - Desktop */
  --text-xs: 0.75rem;      /* 12px */
  --text-sm: 0.875rem;     /* 14px */
  --text-base: 1rem;       /* 16px */
  --text-lg: 1.125rem;     /* 18px */
  --text-xl: 1.25rem;      /* 20px */
  --text-2xl: 1.5rem;      /* 24px */
  --text-3xl: 1.875rem;    /* 30px */
  --text-4xl: 2.25rem;     /* 36px */
  --text-5xl: 3rem;        /* 48px */
  --text-6xl: 3.75rem;     /* 60px */
  
  /* Text Sizes - Mobile */
  --text-xs-mobile: 0.75rem;    /* 12px */
  --text-sm-mobile: 0.875rem;   /* 14px */
  --text-base-mobile: 0.875rem; /* 14px */
  --text-lg-mobile: 1rem;       /* 16px */
  --text-xl-mobile: 1.125rem;  /* 18px */
  --text-2xl-mobile: 1.25rem;   /* 20px */
  --text-3xl-mobile: 1.5rem;    /* 24px */
  --text-4xl-mobile: 1.875rem;  /* 30px */
  --text-5xl-mobile: 2.25rem;   /* 36px */
}
```

### **Line Heights**

```css
:root {
  --leading-none: 1;
  --leading-tight: 1.25;
  --leading-snug: 1.375;
  --leading-normal: 1.5;
  --leading-relaxed: 1.625;
  --leading-loose: 2;
}
```

## 🧩 Компоненты

### **Кнопки**

```css
/* Primary Button */
.btn-primary {
  background: var(--gradient-primary);
  color: var(--text-inverse);
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-weight: var(--font-semibold);
  font-size: var(--text-base);
  cursor: pointer;
  transition: all var(--transition-normal);
  box-shadow: var(--shadow-md);
}

.btn-primary:hover {
  background: var(--gradient-primary-hover);
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg), var(--glow-primary);
}

/* Secondary Button */
.btn-secondary {
  background: transparent;
  color: var(--primary-500);
  border: 2px solid var(--primary-500);
  border-radius: 8px;
  padding: 10px 22px;
  font-weight: var(--font-semibold);
  font-size: var(--text-base);
  cursor: pointer;
  transition: all var(--transition-normal);
}

.btn-secondary:hover {
  background: var(--primary-500);
  color: var(--text-inverse);
  box-shadow: var(--glow-primary);
}

/* Ghost Button */
.btn-ghost {
  background: transparent;
  color: var(--text-primary);
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-weight: var(--font-medium);
  font-size: var(--text-base);
  cursor: pointer;
  transition: all var(--transition-normal);
}

.btn-ghost:hover {
  background: rgba(0, 255, 136, 0.1);
  color: var(--primary-500);
}
```

### **Карточки**

```css
.card {
  background: var(--gradient-card);
  border-radius: 12px;
  padding: 24px;
  box-shadow: var(--shadow-md);
  border: 1px solid var(--dark-600);
  transition: all var(--transition-normal);
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-xl), var(--glow-primary);
  border-color: var(--primary-500);
}

.card-header {
  margin-bottom: 16px;
}

.card-title {
  font-family: var(--font-heading);
  font-size: var(--text-xl);
  font-weight: var(--font-bold);
  color: var(--text-primary);
  margin-bottom: 8px;
}

.card-description {
  color: var(--text-secondary);
  font-size: var(--text-sm);
  line-height: var(--leading-relaxed);
}
```

### **Формы**

```css
.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  margin-bottom: 8px;
  font-weight: var(--font-medium);
  color: var(--text-primary);
  font-size: var(--text-sm);
}

.form-input {
  width: 100%;
  padding: 12px 16px;
  background: var(--dark-700);
  border: 2px solid var(--dark-600);
  border-radius: 8px;
  color: var(--text-primary);
  font-size: var(--text-base);
  transition: all var(--transition-normal);
}

.form-input:focus {
  outline: none;
  border-color: var(--primary-500);
  box-shadow: 0 0 0 3px rgba(0, 255, 136, 0.1);
}

.form-input::placeholder {
  color: var(--text-muted);
}

.form-textarea {
  min-height: 120px;
  resize: vertical;
}
```

### **Навигация**

```css
.nav {
  display: flex;
  align-items: center;
  gap: 32px;
}

.nav-link {
  color: var(--text-primary);
  text-decoration: none;
  font-weight: var(--font-medium);
  font-size: var(--text-base);
  padding: 8px 0;
  position: relative;
  transition: all var(--transition-fast);
}

.nav-link:hover {
  color: var(--primary-500);
}

.nav-link::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 0;
  height: 2px;
  background: var(--gradient-primary);
  transition: width var(--transition-fast);
}

.nav-link:hover::after,
.nav-link.active::after {
  width: 100%;
}
```

### **Теги и чипы**

```css
.tag {
  display: inline-block;
  padding: 4px 12px;
  background: rgba(0, 255, 136, 0.1);
  color: var(--primary-500);
  border: 1px solid var(--primary-500);
  border-radius: 20px;
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
  margin: 2px;
  transition: all var(--transition-fast);
}

.tag:hover {
  background: var(--primary-500);
  color: var(--text-inverse);
  transform: scale(1.05);
}

.tag-primary {
  background: var(--primary-500);
  color: var(--text-inverse);
}

.tag-secondary {
  background: var(--secondary-500);
  color: var(--text-inverse);
}

.tag-accent {
  background: var(--accent-500);
  color: var(--text-inverse);
}
```

## 🎭 Анимации

### **Переходы**

```css
:root {
  --transition-fast: 0.15s ease;
  --transition-normal: 0.3s ease;
  --transition-slow: 0.5s ease;
  --transition-slower: 0.8s ease;
  
  /* Easing Functions */
  --ease-in: cubic-bezier(0.4, 0, 1, 1);
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
  --ease-elastic: cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
```

### **Keyframes**

```css
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes glow {
  0%, 100% {
    box-shadow: 0 0 20px rgba(0, 255, 136, 0.3);
  }
  50% {
    box-shadow: 0 0 30px rgba(0, 255, 136, 0.5);
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}
```

### **Анимационные классы**

```css
.animate-fade-in {
  animation: fadeIn 0.6s var(--ease-out);
}

.animate-slide-in-left {
  animation: slideInLeft 0.6s var(--ease-out);
}

.animate-slide-in-right {
  animation: slideInRight 0.6s var(--ease-out);
}

.animate-scale-in {
  animation: scaleIn 0.4s var(--ease-bounce);
}

.animate-glow {
  animation: glow 2s ease-in-out infinite;
}

.animate-float {
  animation: float 3s ease-in-out infinite;
}
```

## 📐 Spacing System

### **Отступы (8px grid)**

```css
:root {
  --space-1: 0.25rem;   /* 4px */
  --space-2: 0.5rem;     /* 8px */
  --space-3: 0.75rem;    /* 12px */
  --space-4: 1rem;       /* 16px */
  --space-5: 1.25rem;    /* 20px */
  --space-6: 1.5rem;     /* 24px */
  --space-8: 2rem;       /* 32px */
  --space-10: 2.5rem;    /* 40px */
  --space-12: 3rem;      /* 48px */
  --space-16: 4rem;      /* 64px */
  --space-20: 5rem;      /* 80px */
  --space-24: 6rem;      /* 96px */
  --space-32: 8rem;      /* 128px */
}
```

### **Border Radius**

```css
:root {
  --radius-none: 0;
  --radius-sm: 0.25rem;    /* 4px */
  --radius-md: 0.5rem;     /* 8px */
  --radius-lg: 0.75rem;    /* 12px */
  --radius-xl: 1rem;       /* 16px */
  --radius-2xl: 1.5rem;    /* 24px */
  --radius-full: 9999px;
}
```

## 📱 Responsive Design

### **Breakpoints**

```css
:root {
  --breakpoint-sm: 640px;
  --breakpoint-md: 768px;
  --breakpoint-lg: 1024px;
  --breakpoint-xl: 1280px;
  --breakpoint-2xl: 1536px;
}

/* Mobile First Approach */
@media (min-width: 640px) { /* sm */ }
@media (min-width: 768px) { /* md */ }
@media (min-width: 1024px) { /* lg */ }
@media (min-width: 1280px) { /* xl */ }
@media (min-width: 1536px) { /* 2xl */ }
```

### **Container Sizes**

```css
.container {
  width: 100%;
  margin: 0 auto;
  padding: 0 var(--space-4);
}

@media (min-width: 640px) {
  .container { max-width: 640px; }
}

@media (min-width: 768px) {
  .container { max-width: 768px; }
}

@media (min-width: 1024px) {
  .container { max-width: 1024px; }
}

@media (min-width: 1280px) {
  .container { max-width: 1280px; }
}

@media (min-width: 1536px) {
  .container { max-width: 1536px; }
}
```

## 🎯 Utility Classes

### **Display**

```css
.hidden { display: none; }
.block { display: block; }
.inline { display: inline; }
.inline-block { display: inline-block; }
.flex { display: flex; }
.inline-flex { display: inline-flex; }
.grid { display: grid; }
```

### **Flexbox**

```css
.flex-row { flex-direction: row; }
.flex-col { flex-direction: column; }
.flex-wrap { flex-wrap: wrap; }
.items-start { align-items: flex-start; }
.items-center { align-items: center; }
.items-end { align-items: flex-end; }
.justify-start { justify-content: flex-start; }
.justify-center { justify-content: center; }
.justify-end { justify-content: flex-end; }
.justify-between { justify-content: space-between; }
```

### **Spacing**

```css
.m-0 { margin: 0; }
.m-1 { margin: var(--space-1); }
.m-2 { margin: var(--space-2); }
.m-4 { margin: var(--space-4); }
.m-8 { margin: var(--space-8); }

.p-0 { padding: 0; }
.p-1 { padding: var(--space-1); }
.p-2 { padding: var(--space-2); }
.p-4 { padding: var(--space-4); }
.p-8 { padding: var(--space-8); }
```

---

*Эта дизайн-система обеспечивает консистентность, масштабируемость и современный вид веб-сайта, следуя лучшим практикам 2024 года.*
