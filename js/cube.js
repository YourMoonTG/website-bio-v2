// 3D Cube с эффектами стекла, частицами и интерактивностью
console.log('🎲 Загружен cube.js');

// Глобальные переменные для куба
let scene, camera, renderer, cube;
let mouse = { x: 0, y: 0 };
let targetRotation = { x: 0, y: 0 };
let particles = [];
let particleSystem;
let animationFrameId;
let isAnimating = false;
let isExploding = false;

// Конфигурация
const CUBE_CONFIG = {
    size: 2,
    color: 0x00ff88,
    opacity: 0.8,
    wireframe: false,
    particlesCount: 50,
    rotationSpeed: 0.005,
    mouseSensitivity: 0.5,
    autoRotation: true
};

// Инициализация куба
function initCube() {
    console.log('🎲 Инициализируем 3D куб...');
    
    const container = document.getElementById('cube-container');
    if (!container) {
        console.log('❌ Контейнер куба не найден');
        return;
    }

    // Проверка поддержки WebGL и Three.js
    if (typeof THREE === 'undefined') {
        console.log('❌ Three.js не загружен, используем fallback');
        createFallbackCube(container);
        return;
    }

    if (!isWebGLSupported()) {
        console.log('❌ WebGL не поддерживается, используем fallback');
        createFallbackCube(container);
        return;
    }

    // Создаем сцену
    scene = new THREE.Scene();
    scene.background = null; // Прозрачный фон

    // Создаем камеру
    let width = container.clientWidth;
    let height = container.clientHeight;
    
    // Если размеры не определены, используем дефолтные
    if (!width || width === 0) {
        width = 300;
        container.style.width = width + 'px';
    }
    if (!height || height === 0) {
        height = 300;
        container.style.height = height + 'px';
    }
    
    console.log(`📐 Размеры контейнера: ${width}x${height}`);
    
    camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 5;

    // Создаем рендерер
    try {
        renderer = new THREE.WebGLRenderer({ 
            alpha: true, 
            antialias: true,
            powerPreference: "high-performance"
        });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        container.appendChild(renderer.domElement);
        console.log('✅ Рендерер создан и добавлен в контейнер');
    } catch (error) {
        console.error('❌ Ошибка при создании рендерера:', error);
        createFallbackCube(container);
        return;
    }

    // Создаем куб с эффектом стекла
    createGlassCube();

    // Создаем систему частиц
    createParticleSystem();

    // Добавляем освещение
    setupLighting();

    // Добавляем обработчики событий
    setupEventHandlers(container);

    // Запускаем анимацию
    animate();

    // Обработка изменения размера
    handleResize(container);

    console.log('✅ 3D куб инициализирован');
}

// Проверка поддержки WebGL
function isWebGLSupported() {
    try {
        const canvas = document.createElement('canvas');
        return !!(window.WebGLRenderingContext && 
                 (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
    } catch (e) {
        return false;
    }
}

// Создание куба с эффектом жидкого стекла
function createGlassCube() {
    // Создаем группу для всей структуры куба
    cube = new THREE.Group();
    
    const layerHeight = CUBE_CONFIG.size * 0.4; // Высота каждого слоя
    const totalHeight = CUBE_CONFIG.size * 1.2; // Общая высота структуры
    
    // ========== ВЕРХНИЙ СПЛОШНОЙ КУБ ==========
    const topCubeSize = CUBE_CONFIG.size * 0.8;
    const topCubeGeometry = new THREE.BoxGeometry(topCubeSize, topCubeSize, topCubeSize);
    
    // Материал для верхнего куба - матовое стекло с свечением
    const topCubeMaterial = new THREE.MeshStandardMaterial({
        color: CUBE_CONFIG.color,
        transparent: true,
        opacity: 0.7,
        metalness: 0.1,
        roughness: 0.3,
        emissive: CUBE_CONFIG.color,
        emissiveIntensity: 0.5,
        side: THREE.FrontSide
    });
    
    const topCube = new THREE.Mesh(topCubeGeometry, topCubeMaterial);
    topCube.position.y = totalHeight / 2 - layerHeight / 2;
    
    // Добавляем края верхнего куба
    const topEdges = new THREE.EdgesGeometry(topCubeGeometry);
    const topEdgeMaterial = new THREE.LineBasicMaterial({
        color: CUBE_CONFIG.color,
        linewidth: 3,
        transparent: true,
        opacity: 1.0
    });
    const topEdgeLines = new THREE.LineSegments(topEdges, topEdgeMaterial);
    topCube.add(topEdgeLines);
    
    // Свечение верхнего куба
    const topGlowGeometry = new THREE.BoxGeometry(topCubeSize * 1.05, topCubeSize * 1.05, topCubeSize * 1.05);
    const topGlowMaterial = new THREE.MeshBasicMaterial({
        color: CUBE_CONFIG.color,
        transparent: true,
        opacity: 0.2,
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending
    });
    const topGlow = new THREE.Mesh(topGlowGeometry, topGlowMaterial);
    topCube.add(topGlow);
    
    // Иконка на верхнем кубе (стилизованный квадрат/U)
    const iconSize = topCubeSize * 0.25;
    
    // Создаем иконку из линий (более надежный способ)
    const iconGroup = new THREE.Group();
    
    // Внешний квадрат (толстые линии)
    const squareSize = iconSize * 0.5;
    const lineWidth = iconSize * 0.08;
    
    // Верхняя линия
    const topLineGeometry = new THREE.PlaneGeometry(squareSize, lineWidth);
    const topLineMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const topLine = new THREE.Mesh(topLineGeometry, topLineMaterial);
    topLine.position.set(0, squareSize / 2 - lineWidth / 2, 0);
    iconGroup.add(topLine);
    
    // Левая линия
    const leftLineGeometry = new THREE.PlaneGeometry(lineWidth, squareSize);
    const leftLineMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const leftLine = new THREE.Mesh(leftLineGeometry, leftLineMaterial);
    leftLine.position.set(-squareSize / 2 + lineWidth / 2, 0, 0);
    iconGroup.add(leftLine);
    
    // Правая линия
    const rightLineGeometry = new THREE.PlaneGeometry(lineWidth, squareSize);
    const rightLineMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const rightLine = new THREE.Mesh(rightLineGeometry, rightLineMaterial);
    rightLine.position.set(squareSize / 2 - lineWidth / 2, 0, 0);
    iconGroup.add(rightLine);
    
    // Нижняя часть (только боковые части, создает эффект открытого квадрата)
    const bottomLeftGeometry = new THREE.PlaneGeometry(lineWidth, squareSize * 0.3);
    const bottomLeftMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const bottomLeft = new THREE.Mesh(bottomLeftGeometry, bottomLeftMaterial);
    bottomLeft.position.set(-squareSize / 2 + lineWidth / 2, -squareSize / 2 + squareSize * 0.15, 0);
    iconGroup.add(bottomLeft);
    
    const bottomRightGeometry = new THREE.PlaneGeometry(lineWidth, squareSize * 0.3);
    const bottomRightMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const bottomRight = new THREE.Mesh(bottomRightGeometry, bottomRightMaterial);
    bottomRight.position.set(squareSize / 2 - lineWidth / 2, -squareSize / 2 + squareSize * 0.15, 0);
    iconGroup.add(bottomRight);
    
    iconGroup.position.set(0, topCubeSize / 2 + 0.01, 0);
    iconGroup.rotation.x = -Math.PI / 2;
    topCube.add(iconGroup);
    
    cube.add(topCube);
    
    // ========== СРЕДНЯЯ ЧАСТЬ - WIREFRAME СЛОИ ==========
    const wireframeLayers = 3; // Количество wireframe слоев
    const wireframeSpacing = layerHeight / (wireframeLayers + 1);
    
    for (let i = 0; i < wireframeLayers; i++) {
        const layerY = -totalHeight / 2 + layerHeight / 2 + (i + 1) * wireframeSpacing;
        const layerSize = CUBE_CONFIG.size * (0.9 - i * 0.1); // Каждый слой немного меньше
        
        // Wireframe геометрия (только края)
        const wireframeGeometry = new THREE.BoxGeometry(layerSize, layerSize * 0.1, layerSize);
        const wireframeMaterial = new THREE.LineBasicMaterial({
            color: CUBE_CONFIG.color,
            transparent: true,
            opacity: 0.6,
            linewidth: 2
        });
        
        // Создаем пунктирные линии (используем EdgesGeometry)
        const edges = new THREE.EdgesGeometry(wireframeGeometry);
        const wireframe = new THREE.LineSegments(edges, wireframeMaterial);
        wireframe.position.y = layerY;
        
        // Добавляем свечение для wireframe
        const wireframeGlowGeometry = new THREE.BoxGeometry(layerSize * 1.02, layerSize * 0.12, layerSize * 1.02);
        const wireframeGlowMaterial = new THREE.MeshBasicMaterial({
            color: CUBE_CONFIG.color,
            transparent: true,
            opacity: 0.1,
            wireframe: true,
            blending: THREE.AdditiveBlending
        });
        const wireframeGlow = new THREE.Mesh(wireframeGlowGeometry, wireframeGlowMaterial);
        wireframeGlow.position.y = layerY;
        cube.add(wireframeGlow);
        
        cube.add(wireframe);
        
        // Узлы соединений (точки на углах)
        if (i < wireframeLayers - 1) {
            const nodeGeometry = new THREE.SphereGeometry(0.08, 16, 16);
            const nodeMaterial = new THREE.MeshBasicMaterial({
                color: CUBE_CONFIG.color,
                transparent: true,
                opacity: 0.9,
                emissive: CUBE_CONFIG.color,
                emissiveIntensity: 0.8
            });
            
            // Добавляем узлы на углах каждого слоя
            const nodePositions = [
                { x: layerSize / 2, z: layerSize / 2 },
                { x: -layerSize / 2, z: layerSize / 2 },
                { x: layerSize / 2, z: -layerSize / 2 },
                { x: -layerSize / 2, z: -layerSize / 2 }
            ];
            
            nodePositions.forEach(pos => {
                const node = new THREE.Mesh(nodeGeometry, nodeMaterial);
                node.position.set(pos.x, layerY, pos.z);
                cube.add(node);
            });
        }
    }
    
    // ========== НИЖНИЙ СПЛОШНОЙ КУБ ==========
    const bottomCubeSize = CUBE_CONFIG.size * 0.8;
    const bottomCubeGeometry = new THREE.BoxGeometry(bottomCubeSize, bottomCubeSize, bottomCubeSize);
    
    // Материал для нижнего куба - такой же как у верхнего
    const bottomCubeMaterial = new THREE.MeshStandardMaterial({
        color: CUBE_CONFIG.color,
        transparent: true,
        opacity: 0.7,
        metalness: 0.1,
        roughness: 0.3,
        emissive: CUBE_CONFIG.color,
        emissiveIntensity: 0.5,
        side: THREE.FrontSide
    });
    
    const bottomCube = new THREE.Mesh(bottomCubeGeometry, bottomCubeMaterial);
    bottomCube.position.y = -totalHeight / 2 + layerHeight / 2;
    
    // Добавляем края нижнего куба
    const bottomEdges = new THREE.EdgesGeometry(bottomCubeGeometry);
    const bottomEdgeMaterial = new THREE.LineBasicMaterial({
        color: CUBE_CONFIG.color,
        linewidth: 3,
        transparent: true,
        opacity: 1.0
    });
    const bottomEdgeLines = new THREE.LineSegments(bottomEdges, bottomEdgeMaterial);
    bottomCube.add(bottomEdgeLines);
    
    // Свечение нижнего куба
    const bottomGlowGeometry = new THREE.BoxGeometry(bottomCubeSize * 1.05, bottomCubeSize * 1.05, bottomCubeSize * 1.05);
    const bottomGlowMaterial = new THREE.MeshBasicMaterial({
        color: CUBE_CONFIG.color,
        transparent: true,
        opacity: 0.2,
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending
    });
    const bottomGlow = new THREE.Mesh(bottomGlowGeometry, bottomGlowMaterial);
    bottomCube.add(bottomGlow);
    
    cube.add(bottomCube);
    
    // Добавляем общее свечение для всей структуры
    const overallGlowGeometry = new THREE.BoxGeometry(
        CUBE_CONFIG.size * 1.1, 
        totalHeight * 1.1, 
        CUBE_CONFIG.size * 1.1
    );
    const overallGlowMaterial = new THREE.MeshBasicMaterial({
        color: CUBE_CONFIG.color,
        transparent: true,
        opacity: 0.08,
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending
    });
    const overallGlow = new THREE.Mesh(overallGlowGeometry, overallGlowMaterial);
    cube.add(overallGlow);
    
    // Добавляем всю структуру в сцену
    scene.add(cube);
}

// Создание системы частиц
function createParticleSystem() {
    const particleGeometry = new THREE.BufferGeometry();
    const particleCount = CUBE_CONFIG.particlesCount;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    // Цвет частиц (зеленый оттенок)
    const color = new THREE.Color(CUBE_CONFIG.color);

    for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        
        // Случайные позиции вокруг куба
        const radius = CUBE_CONFIG.size * 2;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI;
        
        positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
        positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
        positions[i3 + 2] = radius * Math.cos(phi);

        // Цвета частиц
        colors[i3] = color.r;
        colors[i3 + 1] = color.g;
        colors[i3 + 2] = color.b;
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particleMaterial = new THREE.PointsMaterial({
        size: 0.05,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending
    });

    particleSystem = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particleSystem);
}

// Настройка освещения
function setupLighting() {
    // Мягкое окружающее освещение
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    // Основной направленный свет (имитация солнца)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
    directionalLight.position.set(5, 8, 5);
    scene.add(directionalLight);

    // Дополнительный направленный свет для контраста
    const directionalLight2 = new THREE.DirectionalLight(CUBE_CONFIG.color, 0.6);
    directionalLight2.position.set(-5, 3, -5);
    scene.add(directionalLight2);

    // Точечный свет для эффекта свечения в центре
    const pointLight = new THREE.PointLight(CUBE_CONFIG.color, 2, 50);
    pointLight.position.set(0, 0, 0);
    scene.add(pointLight);

    // Дополнительные точечные источники для объемного освещения
    const pointLight2 = new THREE.PointLight(CUBE_CONFIG.color, 1.5, 30);
    pointLight2.position.set(3, 3, 3);
    scene.add(pointLight2);

    const pointLight3 = new THREE.PointLight(CUBE_CONFIG.color, 1.5, 30);
    pointLight3.position.set(-3, -3, -3);
    scene.add(pointLight3);
}

// Обработчики событий
function setupEventHandlers(container) {
    // Движение мыши
    container.addEventListener('mousemove', (e) => {
        const rect = container.getBoundingClientRect();
        mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        // Инвертируем Y: вверху = +1, внизу = -1
        mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        
        targetRotation.y = mouse.x * Math.PI * CUBE_CONFIG.mouseSensitivity;
        // Инвертируем для правильного направления вращения
        targetRotation.x = -mouse.y * Math.PI * CUBE_CONFIG.mouseSensitivity;
    });

    // Touch события для мобильных устройств
    container.addEventListener('touchmove', (e) => {
        e.preventDefault();
        const rect = container.getBoundingClientRect();
        const touch = e.touches[0];
        mouse.x = ((touch.clientX - rect.left) / rect.width) * 2 - 1;
        // Инвертируем Y: вверху = +1, внизу = -1
        mouse.y = -((touch.clientY - rect.top) / rect.height) * 2 + 1;
        
        targetRotation.y = mouse.x * Math.PI * CUBE_CONFIG.mouseSensitivity;
        // Инвертируем для правильного направления вращения
        targetRotation.x = -mouse.y * Math.PI * CUBE_CONFIG.mouseSensitivity;
    });

    // Клик для взрыва частиц
    container.addEventListener('click', () => {
        if (!isExploding) {
            explodeParticles();
        }
    });

    // Остановка анимации при скрытой странице
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
                isAnimating = false;
            }
        } else {
            if (!isAnimating) {
                animate();
            }
        }
    });
}

// Анимация
function animate() {
    if (isAnimating) return;
    isAnimating = true;

    function render() {
        if (!cube || !renderer || !scene || !camera) {
            isAnimating = false;
            return;
        }

        // Плавное вращение куба
        if (CUBE_CONFIG.autoRotation) {
            cube.rotation.y += CUBE_CONFIG.rotationSpeed;
            cube.rotation.x += CUBE_CONFIG.rotationSpeed * 0.5;
        }

        // Плавное следование за мышью
        const lerpFactor = 0.05;
        cube.rotation.y += (targetRotation.y - cube.rotation.y) * lerpFactor;
        cube.rotation.x += (targetRotation.x - cube.rotation.x) * lerpFactor;

        // Анимация частиц
        if (particleSystem) {
            particleSystem.rotation.y += 0.001;
            particleSystem.rotation.x += 0.0005;
        }

        renderer.render(scene, camera);
        animationFrameId = requestAnimationFrame(render);
    }

    render();
}

// Взрыв частиц при клике
function explodeParticles() {
    if (!particleSystem || isExploding) return;
    
    isExploding = true;

    const positions = particleSystem.geometry.attributes.position.array;
    const velocities = [];
    
    // Сохраняем исходные позиции для восстановления
    const originalPositions = new Float32Array(positions);

    // Создаем скорости для каждой частицы
    for (let i = 0; i < positions.length; i += 3) {
        velocities.push({
            x: (Math.random() - 0.5) * 0.2,
            y: (Math.random() - 0.5) * 0.2,
            z: (Math.random() - 0.5) * 0.2
        });
    }

    // Анимация взрыва
    let frame = 0;
    const maxFrames = 30;
    let explodeAnimationId;

    function explode() {
        if (frame >= maxFrames) {
            // Восстанавливаем исходные позиции вместо создания новой системы
            for (let i = 0; i < positions.length; i++) {
                positions[i] = originalPositions[i];
            }
            particleSystem.geometry.attributes.position.needsUpdate = true;
            isExploding = false;
            return;
        }

        for (let i = 0; i < positions.length; i += 3) {
            const vel = velocities[i / 3];
            positions[i] += vel.x;
            positions[i + 1] += vel.y;
            positions[i + 2] += vel.z;
        }

        particleSystem.geometry.attributes.position.needsUpdate = true;
        frame++;
        explodeAnimationId = requestAnimationFrame(explode);
    }

    explode();
}

// Обработка изменения размера
function handleResize(container) {
    window.addEventListener('resize', () => {
        if (!camera || !renderer) return;

        const width = container.clientWidth || 300;
        const height = container.clientHeight || 300;

        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
    });
}

// Fallback куб (CSS 3D) если WebGL не поддерживается
function createFallbackCube(container) {
    console.log('🔄 Создаем fallback CSS куб...');
    container.innerHTML = `
        <div class="css-cube-fallback">
            <div class="css-cube">
                <div class="css-cube-face front"></div>
                <div class="css-cube-face back"></div>
                <div class="css-cube-face right"></div>
                <div class="css-cube-face left"></div>
                <div class="css-cube-face top"></div>
                <div class="css-cube-face bottom"></div>
            </div>
        </div>
    `;
    console.log('✅ Fallback куб создан');
}

// Очистка ресурсов
function cleanupCube() {
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        isAnimating = false;
    }

    if (renderer) {
        renderer.dispose();
    }

    if (scene) {
        scene.traverse((object) => {
            if (object.geometry) object.geometry.dispose();
            if (object.material) {
                if (Array.isArray(object.material)) {
                    object.material.forEach(m => m.dispose());
                } else {
                    object.material.dispose();
                }
            }
        });
    }
}

// Инициализация при загрузке DOM и Three.js
function initializeWhenReady() {
    console.log('🔄 Проверяем готовность Three.js...', typeof THREE);
    
    if (typeof THREE === 'undefined') {
        console.log('⏳ Three.js еще не загружен, ждем...');
        // Three.js еще не загрузился, ждем
        setTimeout(initializeWhenReady, 100);
        return;
    }

    console.log('✅ Three.js загружен!');
    
    // Ждем полной загрузки DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            console.log('📄 DOM загружен, инициализируем куб...');
            setTimeout(initCube, 200);
        });
    } else { 
        // DOM уже загружен
        console.log('📄 DOM уже загружен, инициализируем куб...');
        setTimeout(initCube, 200);
    }
}

// Запускаем инициализацию
initializeWhenReady();

// Экспорт для использования в других модулях
window.Cube3D = {
    init: initCube,
    cleanup: cleanupCube,
    config: CUBE_CONFIG
};

