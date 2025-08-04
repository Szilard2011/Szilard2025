/*
    =================================================================
    Chimera OS - System Script
    Version: FINAL
    =================================================================
*/

document.addEventListener('DOMContentLoaded', () => {

    // --- Component Initialization ---
    const desktop = document.getElementById('desktop');
    const preloader = document.getElementById('preloader');
    const preloaderText = document.getElementById('preloader-text');
    const dock = document.getElementById('dock');
    const dockItems = document.querySelectorAll('.dock-item');
    const windows = document.querySelectorAll('.window');
    const clockElement = document.getElementById('clock');
    const themeSwitcher = document.getElementById('theme-switcher');
    
    const sound = {
        click: new Audio('click.mp3'),
        ambient: new Audio('ambience.mp3'),
        type: new Audio('type.mp3'),
        error: new Audio('error.mp3')
    };

    const terminalWindow = document.getElementById('window-terminal');
    const terminalOutput = document.getElementById('terminal-output');
    const terminalInput = document.getElementById('terminal-input');

    const cursorDot = document.getElementById('cursor-dot');
    const cursorCircle = document.getElementById('cursor-circle');
    
    const themes = ['cyberpunk', 'matrix', 'vaporwave', 'pipboy', 'arcade', 'solaris', 'blood-dragon'];
    let currentThemeIndex = 0;
    
    // --- Ambient Systems ---
    function initAmbientSystems() {
        sound.ambient.loop = true;
        document.body.addEventListener('click', () => {
            if (sound.ambient.paused) {
                sound.ambient.volume = 0.05;
                sound.ambient.play().catch(e => {});
            }
        }, { once: true });

        window.addEventListener('mousemove', e => {
            cursorDot.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
            cursorCircle.style.transform = `translate(${e.clientX - 15}px, ${e.clientY - 15}px)`;
        });

        document.body.addEventListener('mousedown', () => cursorCircle.style.transform = `translate(${cursorCircle.offsetLeft}px, ${cursorCircle.offsetTop}px) scale(0.5)`);
        document.body.addEventListener('mouseup', () => cursorCircle.style.transform = `translate(${cursorCircle.offsetLeft}px, ${cursorCircle.offsetTop}px) scale(1)`);

        setInterval(() => {
            clockElement.textContent = new Date().toTimeString().split(' ')[0];
        }, 1000);
    }

    // --- OS Boot Sequence ---
    function runBootSequence() {
        const bootSteps = [
            { time: 1500, text: '> Chimera Kernel Initializing...' },
            { time: 3000, text: '> Mounting virtual filesystem...' },
            { time: 4500, text: '> Starting hybrid interface...' },
            { time: 6000, text: '> System Ready. Welcome, User.' }
        ];
        bootSteps.forEach(step => setTimeout(() => preloaderText.textContent = step.text, step.time));
        setTimeout(() => {
            preloader.classList.add('hidden');
            openWindow('window-about');
            openWindow('window-terminal');
        }, 7500);
    }

    // --- Window Manager ---
    function openWindow(windowId) {
        const win = document.getElementById(windowId);
        if (!win || win.classList.contains('open')) return;
        win.style.display = 'flex';
        setTimeout(() => win.classList.add('open'), 10);
        focusWindow(win);
        updateDock(windowId, true);
        playSound('click');
    }

    function closeWindow(windowId) {
        const win = document.getElementById(windowId);
        if (!win || !win.classList.contains('open')) return;
        win.classList.remove('open');
        setTimeout(() => win.style.display = 'none', 300);
        updateDock(windowId, false);
        playSound('click');
    }

    function focusWindow(targetWindow) {
        windows.forEach(win => win.classList.remove('active'));
        targetWindow.classList.add('active');
        const maxZ = Array.from(windows).reduce((max, w) => Math.max(max, parseInt(w.style.zIndex) || 0), 0);
        targetWindow.style.zIndex = maxZ + 1;
    }

    function updateDock(windowId, isActive) {
        const item = document.querySelector(`.dock-item[data-window="${windowId}"]`);
        if (item) item.classList.toggle('active', isActive);
    }

    // --- Theme Manager ---
    function initTheming() {
        themeSwitcher.addEventListener('click', () => {
            currentThemeIndex = (currentThemeIndex + 1) % themes.length;
            setTheme(themes[currentThemeIndex]);
            playSound('click');
        });
    }
    
    function setTheme(themeName) {
        if (themes.includes(themeName)) {
            document.body.dataset.theme = themeName;
            currentThemeIndex = themes.indexOf(themeName);
            renderAsciiArt();
        }
    }

    // --- Terminal ---
    function initTerminal() {
        terminalWindow.addEventListener('click', () => terminalInput.focus());
        terminalInput.addEventListener('keydown', (e) => {
            playSound('type');
            if (e.key === 'Enter') {
                const command = e.target.value.trim();
                if (command) {
                    typeOutput(`user@chimera:~$ ${command}`, 'command');
                    processCommand(command);
                }
                e.target.value = '';
            }
        });
        renderAsciiArt();
        typeOutput('Chimera OS [vFINAL]. Type "help" for a list of commands.');
    }
    
    const asciiArt = {
        cyberpunk: `  _______   __   __  _______  __    _  ___   __   __  _______ \n |       | |  | |  ||   _   ||  |  | ||   | |  | |  ||       |\n |  _    | |  |_|  ||  |_|  ||   |_| ||   | |  |_|  ||    ___|\n | | |   | |       ||       ||       ||   | |       ||   |___ \n | |_|   | |       ||       ||  _    ||   | |       ||    ___|\n |       |  |     | |   _   || | |   ||   |  |     | |   |___ \n |_______|   |___|  |__| |__||_|  |__||___|   |___|  |_______|`,
        matrix: ` __ __   ___   __ __  _      __      __    \n|  |  |.'   \\ |  |  || |    |  |    |  |   \n|  |  ||     ||  |  || |    |  |    |  |   \n|  _  ||  O  ||  |  || |  _ |  |___ |  |___ \n|  |  ||     ||  |  || |.' ||  |  ||  |  |\n|  |  ||\___/ |  :  ||  /  ||  |  ||  |  |\n|__|__|      '\\___.' |__\\__||__|__||__|__|`,
        pipboy: ` __ __  ___      ___ ___  __  _ \n|  |  ||   |    |   |   ||  |/ ]\n|  |  || _ |    | _   _ | |  ' / \n|  _  ||  _||_  |  _|_  | |    \\ \n|  |  ||  _||_ |  _|_  | |     \\\n|  |  ||   ||_ |  | |  | |  .  |\n|__|__||___|   |__| |__| |__|\_|`,
        default: ` __ __  _     _    _      ___   __  \n|  |  || |   | |  | |    |   | /  ] \n|  |  || |   | |  | |    | _ |/  /  \n|  _  || |__ | |  | |    |  _ |  /   \n|  |  ||    || |  | |    |  _ | /    \n|  |  ||    || |  | |___ |  _ |/     \n|__|__||____||____|____||__| /      `
    };
    
    function renderAsciiArt() {
        const existingArt = document.getElementById('terminal-ascii-art');
        if (existingArt) existingArt.remove();
        
        const theme = document.body.dataset.theme;
        const art = asciiArt[theme] || asciiArt.default;
        
        const artContainer = document.createElement('pre');
        artContainer.id = 'terminal-ascii-art';
        artContainer.textContent = art;
        terminalOutput.insertBefore(artContainer, terminalOutput.firstChild);
    }
    
    function processCommand(command) {
        const [cmd, ...args] = command.toLowerCase().split(' ');
        switch (cmd) {
            case 'help': typeOutput('Commands: help, open, close, theme, themes, neofetch, clear, reboot'); break;
            case 'open': args[0] ? openWindow(`window-${args[0]}`) : typeOutput('Error: Missing argument.', 'error'); break;
            case 'close': args[0] ? closeWindow(`window-${args[0]}`) : typeOutput('Error: Missing argument.', 'error'); break;
            case 'themes': typeOutput('Available: cyberpunk, matrix, vaporwave, pipboy, arcade, solaris, blood-dragon'); break;
            case 'theme': if (args[0]) { setTheme(args[0]); typeOutput(`Theme set to: ${args[0]}`); } else { typeOutput('Error: Missing theme name.', 'error'); } break;
            case 'neofetch': typeOutput(`Szilard2011@CHIMERA\nOS: Chimera OS vFINAL\nKernel: JS DOM vFINAL\nUptime: ${Math.floor(performance.now() / 1000)}s\nTheme: ${document.body.dataset.theme}`); break;
            case 'reboot': typeOutput('System rebooting...'); setTimeout(() => location.reload(), 1000); break;
            case 'clear': terminalOutput.innerHTML = ''; renderAsciiArt(); break;
            case 'fnaf': typeOutput('WAS THAT THE BITE OF \'87?!', 'special'); break;
            default: typeOutput(`Command not found: ${cmd}`, 'error'); playSound('error');
        }
    }

    function typeOutput(text, className = '') {
        const line = document.createElement('div');
        line.className = `terminal-line ${className}`;
        line.innerHTML = text.replace(/\n/g, '<br>');
        terminalOutput.appendChild(line);
        terminalOutput.scrollTop = terminalOutput.scrollHeight;
    }
    
    // --- Event Listener Initialization ---
    function initInteractivity() {
        dockItems.forEach(item => {
            const windowId = item.dataset.window;
            if (!windowId) return;
            item.addEventListener('click', () => {
                const windowEl = document.getElementById(windowId);
                if (windowEl.classList.contains('open')) {
                    focusWindow(windowEl);
                } else { openWindow(windowId); }
            });
        });
        windows.forEach(win => {
            win.addEventListener('mousedown', () => focusWindow(win), true);
            const closeBtn = win.querySelector('.close-btn');
            if (closeBtn) closeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                closeWindow(closeBtn.dataset.window);
            });
        });
    }

    // --- Dock Magnification ---
    function initDockMagnification() {
        const dockGroup = dock.querySelector('.dock-group');
        dockGroup.addEventListener('mousemove', e => {
            const dockRect = dockGroup.getBoundingClientRect();
            const mouseX = e.clientX - dockRect.left;
            dockGroup.querySelectorAll('.dock-item').forEach(item => {
                const itemRect = item.getBoundingClientRect();
                const itemCenterX = (itemRect.left - dockRect.left) + itemRect.width / 2;
                const distance = Math.abs(mouseX - itemCenterX);
                const scale = Math.max(1, 1.8 - distance / 70);
                item.style.transform = `scale(${scale}) translateY(-${(scale - 1) * 20}px)`;
            });
        });
        dockGroup.addEventListener('mouseleave', () => {
            dockGroup.querySelectorAll('.dock-item').forEach(item => item.style.transform = 'scale(1)');
        });
    }

    // --- Interact.js Configuration ---
    interact('.window')
        .draggable({
            allowFrom: '.title-bar',
            inertia: true,
            modifiers: [interact.modifiers.restrictRect({ restriction: 'parent', endOnly: true })],
            listeners: { move(event) { const t = event.target; const x = (parseFloat(t.getAttribute('data-x')) || 0) + event.dx; const y = (parseFloat(t.getAttribute('data-y')) || 0) + event.dy; t.style.transform = `translate(${x}px, ${y}px)`; t.setAttribute('data-x', x); t.setAttribute('data-y', y); } }
        })
        .resizable({
            edges: { left: true, right: true, bottom: true, top: false },
            listeners: { move(event) { let { x, y } = event.target.dataset; x = parseFloat(x) || 0; y = parseFloat(y) || 0; Object.assign(event.target.style, { width: `${event.rect.width}px`, height: `${event.rect.height}px`, }); Object.assign(event.target.dataset, { x, y }); } },
            modifiers: [interact.modifiers.restrictSize({ min: { width: 300, height: 200 } })],
        });
    
    // --- Utilities ---
    function playSound(soundId) { const s = sound[soundId]; if (s) { s.currentTime = 0; s.play().catch(e => {}); } }
    
    // --- System Start ---
    initAmbientSystems();
    initInteractivity();
    initTheming();
    initTerminal();
    initDockMagnification();
    runBootSequence();
});