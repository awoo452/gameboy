// --- UI Element Selectors ---
const onOffButton = document.querySelector('#onOffButton');
const batteryLight = document.querySelector('#batteryLight');
const display = document.querySelector('#display');
const nintendoLogoContainer = document.querySelector('#nintendoLogoContainer');
const nintendoLogo = document.querySelector('#nintendoLogo');
const screenContent = document.querySelector('#screenContent');
const screenTitle = document.querySelector('#screenTitle');
const screenBadge = document.querySelector('#screenBadge');
const navMenu = document.querySelector('#navMenu');
const navItems = navMenu ? Array.from(navMenu.querySelectorAll('.navItem')) : [];
const devNavItem = document.querySelector('#devNavItem');
const menu = document.querySelector('#menu');
const menuItems = menu ? Array.from(menu.querySelectorAll('.menuItem')) : [];
const devMenu = document.querySelector('#devMenu');
const devMenuItems = devMenu ? Array.from(devMenu.querySelectorAll('.menuItem')) : [];
const statusText = document.querySelector('#statusText');
const pokemonCard = document.querySelector('#pokemonCard');
const aboutCard = document.querySelector('#aboutCard');
const pokemonId = document.querySelector('#pokemonId');
const pokemonName = document.querySelector('#pokemonName');
const pokemonTypes = document.querySelector('#pokemonTypes');
const pokemonHW = document.querySelector('#pokemonHW');
const dPadUp = document.querySelector('.dPadUp');
const dPadDown = document.querySelector('.dPadDown');
const dPadLeft = document.querySelector('.dPadLeft');
const dPadRight = document.querySelector('.dPadRight');
const startButton = document.querySelector('.startButton');
const aButton = document.querySelector('.aButton');
const bButton = document.querySelector('.bButton');

// --- UI Ready State Check ---
const uiReady = [
    onOffButton,
    batteryLight,
    display,
    nintendoLogoContainer,
    nintendoLogo,
    screenContent,
    screenTitle,
    screenBadge,
    navMenu,
    menu,
    devMenu,
    statusText,
    pokemonCard,
    aboutCard,
    pokemonId,
    pokemonName,
    pokemonTypes,
    pokemonHW,
    dPadUp,
    dPadDown,
    dPadLeft,
    dPadRight,
    startButton,
    aButton,
    bButton
].every(Boolean);

// --- API/Network Config & Error Codes ---
const apiMeta = document.querySelector('meta[name="pokemon-api-base"]');
const API_BASE_URL = (apiMeta && apiMeta.content ? apiMeta.content : 'http://localhost:3000').replace(/\/$/, '');

const REQUEST_TIMEOUT_MS = 20000;
const RETRY_LIMIT = 2;
const RETRY_BASE_DELAY_MS = 900;
const RETRYABLE_STATUS = new Set([408, 429, 500, 502, 503, 504]);

const ERROR_CODES = {
    NETWORK: { code: 'GB-001', reason: 'Network error or CORS blocked.' },
    TIMEOUT: { code: 'GB-002', reason: 'Request timed out.' },
    NOT_FOUND: { code: 'GB-003', reason: 'API endpoint not found.' },
    RATE_LIMITED: { code: 'GB-004', reason: 'Rate limited.' },
    UNAVAILABLE: { code: 'GB-005', reason: 'Service unavailable.' }
};

// --- Dev Menu Sequence ---
const DEV_SEQUENCE = [
    { direction: 'left', count: 4 },
    { direction: 'up', count: 2 },
    { direction: 'down', count: 69 }
];

// --- State Variables ---
let bootTimeoutId = null;
let screenTimeoutId = null;
let selectedIndex = 0;
let currentScreen = 'boot';
let devSequenceStep = 0;
let devSequenceCount = 0;
let devUnlocked = false;

// --- Classes ---
class ApiError extends Error {
    constructor(status, statusText) {
        super(`HTTP ${status}`);
        this.name = 'ApiError';
        this.status = status;
        this.statusText = statusText;
    }
}

// --- Power & Display Management ---
function isOn() {
    return onOffButton.classList.contains('on');
}

function turnOn() {
    onOffButton.classList.add('on');
    onOffButton.classList.remove('off');
}

function turnOnBatteryLight() {
    batteryLight.classList.remove('batteryLightOff');
    batteryLight.classList.add('batteryLightOn');
}

function turnOnDisplay() {
    display.classList.remove('displayOff');
    display.classList.add('displayOn');
}

function turnOff() {
    onOffButton.classList.add('off');
    onOffButton.classList.remove('on');
}

function turnOffBatteryLight() {
    batteryLight.classList.remove('batteryLightOn');
    batteryLight.classList.add('batteryLightOff');
}

function turnOffDisplay() {
    display.classList.remove('displayOn');
    display.classList.add('displayOff');
}

// --- Boot Logo Animation ---
function addDrop() {
    if (!isOn()) {
        return;
    }
    nintendoLogoContainer.classList.add('drop');
}

function startGame() {
    if (!isOn()) {
        return;
    }
    nintendoLogo.classList.remove('hidden');
    bootTimeoutId = setTimeout(addDrop, 500);
}

function removeInitialScreen() {
    nintendoLogo.classList.add('hidden');
    nintendoLogoContainer.classList.remove('drop');
}

// --- Timers ---
function clearTimers() {
    if (bootTimeoutId !== null) {
        clearTimeout(bootTimeoutId);
        bootTimeoutId = null;
    }
    if (screenTimeoutId !== null) {
        clearTimeout(screenTimeoutId);
        screenTimeoutId = null;
    }
}

// --- Delay Utility ---
function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

// --- Network ---
async function fetchWithTimeout(url, options = {}, timeoutMs = REQUEST_TIMEOUT_MS) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    try {
        return await fetch(url, { ...options, signal: controller.signal });
    } finally {
        clearTimeout(timeoutId);
    }
}

async function fetchJsonWithRetry(url, options = {}) {
    let attempt = 0;
    let delayMs = RETRY_BASE_DELAY_MS;
    while (true) {
        try {
            const response = await fetchWithTimeout(url, options);
            if (!response.ok) {
                if (attempt < RETRY_LIMIT && RETRYABLE_STATUS.has(response.status)) {
                    attempt += 1;
                    await delay(delayMs);
                    delayMs = Math.round(delayMs * 1.6);
                    continue;
                }
                throw new ApiError(response.status, response.statusText);
            }
            return await response.json();
        } catch (error) {
            const shouldRetry = (
                (error && error.name === 'AbortError') ||
                (error instanceof ApiError && RETRYABLE_STATUS.has(error.status)) ||
                error instanceof TypeError
            );
            if (attempt < RETRY_LIMIT && shouldRetry) {
                attempt += 1;
                await delay(delayMs);
                delayMs = Math.round(delayMs * 1.6);
                continue;
            }
            throw error;
        }
    }
}

// --- Status & Error Helpers ---
function setStatus(text, isError = false) {
    statusText.textContent = text;
    statusText.classList.toggle('is-error', isError);
}

function logError(details, error) {
    const payload = {
        code: details.code,
        reason: details.reason
    };
    if (error instanceof ApiError) {
        payload.status = error.status;
        payload.statusText = error.statusText;
    }
    if (error && error.message) {
        payload.message = error.message;
    }
    console.error(`[Gameboy] ${details.code}: ${details.reason}`, payload);
}

function getErrorDetails(error) {
    if (error && error.name === 'AbortError') {
        return ERROR_CODES.TIMEOUT;
    }
    if (error instanceof ApiError) {
        if (error.status === 408) {
            return ERROR_CODES.TIMEOUT;
        }
        if (error.status === 404) {
            return ERROR_CODES.NOT_FOUND;
        }
        if (error.status === 429) {
            return ERROR_CODES.RATE_LIMITED;
        }
        if (error.status === 503) {
            return ERROR_CODES.UNAVAILABLE;
        }
        if (error.status >= 500) {
            return ERROR_CODES.UNAVAILABLE;
        }
        return null;
    }
    const message = error && error.message ? String(error.message) : '';
    if (message.toLowerCase().includes('failed to fetch')) {
        return ERROR_CODES.NETWORK;
    }
    return null;
}

function formatErrorMessage(error) {
    const details = getErrorDetails(error);
    if (details) {
        logError(details, error);
        return `Error ${details.code}. Visit docs to troubleshoot.`;
    }
    if (error instanceof ApiError) {
        return `API error (HTTP ${error.status}).`;
    }
    return 'Unexpected error. Try again.';
}

// --- Dev Unlock Sequence ---
function unlockDevMenu() {
    devUnlocked = true;
    if (devNavItem) {
        devNavItem.classList.remove('hidden');
    }
    if (currentScreen === 'nav') {
        clearSelections();
        setSelectedIndex(0);
    }
    setStatus('DEV MODE');
}

function registerDevInput(direction) {
    if (devUnlocked || !direction) {
        return;
    }
    const step = DEV_SEQUENCE[devSequenceStep];
    if (!step) {
        return;
    }
    if (direction === step.direction) {
        devSequenceCount += 1;
        if (devSequenceCount >= step.count) {
            devSequenceStep += 1;
            devSequenceCount = 0;
            if (devSequenceStep >= DEV_SEQUENCE.length) {
                unlockDevMenu();
            }
        }
        return;
    }
    devSequenceStep = 0;
    devSequenceCount = 0;
    if (direction === DEV_SEQUENCE[0].direction) {
        devSequenceCount = 1;
    }
}

// --- Menu & Navigation ---
function setSelectedIndex(index) {
    const items = getActiveMenuItems();
    if (items.length === 0) {
        return;
    }
    selectedIndex = (index + items.length) % items.length;
    items.forEach((item, itemIndex) => {
        item.classList.toggle('is-selected', itemIndex === selectedIndex);
    });
}

function clearSelections() {
    navItems.forEach((item) => item.classList.remove('is-selected'));
    menuItems.forEach((item) => item.classList.remove('is-selected'));
    devMenuItems.forEach((item) => item.classList.remove('is-selected'));
}

function getActiveMenuItems() {
    if (currentScreen === 'nav') {
        return navItems.filter((item) => !item.classList.contains('hidden'));
    }
    if (currentScreen === 'menu') {
        return menuItems;
    }
    if (currentScreen === 'dev') {
        return devMenuItems;
    }
    return [];
}

function showNavMenu() {
    currentScreen = 'nav';
    if (screenTitle) {
        screenTitle.textContent = 'MENU';
    }
    if (screenBadge) {
        screenBadge.textContent = 'DMG';
    }
    navMenu.classList.remove('hidden');
    menu.classList.add('hidden');
    devMenu.classList.add('hidden');
    pokemonCard.classList.add('hidden');
    aboutCard.classList.add('hidden');
    setStatus('SELECT');
    clearSelections();
    setSelectedIndex(0);
}

function showMenu() {
    currentScreen = 'menu';
    if (screenTitle) {
        screenTitle.textContent = 'POKEDEX';
    }
    if (screenBadge) {
        screenBadge.textContent = 'DMG';
    }
    navMenu.classList.add('hidden');
    menu.classList.remove('hidden');
    devMenu.classList.add('hidden');
    pokemonCard.classList.add('hidden');
    aboutCard.classList.add('hidden');
    setStatus('READY');
    clearSelections();
    setSelectedIndex(0);
}

function showDevMenu() {
    currentScreen = 'dev';
    if (screenTitle) {
        screenTitle.textContent = 'DEV MENU';
    }
    if (screenBadge) {
        screenBadge.textContent = 'DEV';
    }
    navMenu.classList.add('hidden');
    menu.classList.add('hidden');
    devMenu.classList.remove('hidden');
    pokemonCard.classList.add('hidden');
    aboutCard.classList.add('hidden');
    setStatus('READY');
    clearSelections();
    setSelectedIndex(0);
}

function showLoading() {
    currentScreen = 'loading';
    navMenu.classList.add('hidden');
    menu.classList.add('hidden');
    devMenu.classList.add('hidden');
    pokemonCard.classList.add('hidden');
    aboutCard.classList.add('hidden');
    setStatus('FETCHING...');
}

function showPokemon() {
    currentScreen = 'details';
    navMenu.classList.add('hidden');
    menu.classList.add('hidden');
    devMenu.classList.add('hidden');
    aboutCard.classList.add('hidden');
    pokemonCard.classList.remove('hidden');
    setStatus('FOUND');
}

function showAbout() {
    currentScreen = 'about';
    navMenu.classList.add('hidden');
    menu.classList.add('hidden');
    devMenu.classList.add('hidden');
    pokemonCard.classList.add('hidden');
    aboutCard.classList.remove('hidden');
    setStatus('INFO');
}

function resetScreenState() {
    showNavMenu();
}

// --- Data Formatting ---
function formatName(name) {
    if (!name) {
        return 'UNKNOWN';
    }
    const cleaned = name.toString().toUpperCase();
    return cleaned.length > 10 ? cleaned.slice(0, 10) : cleaned;
}

function formatTypes(types) {
    if (!Array.isArray(types)) {
        return 'UNKNOWN';
    }
    const names = types
        .map((entry) => (entry && entry.type && entry.type.name ? entry.type.name : entry && entry.name ? entry.name : null))
        .filter(Boolean);
    if (names.length === 0) {
        return 'UNKNOWN';
    }
    return names.join('/').toUpperCase();
}

function formatHeightWeight(height, weight) {
    const heightValue = typeof height === 'number' ? `${(height / 10).toFixed(1)}M` : '--';
    const weightValue = typeof weight === 'number' ? `${(weight / 10).toFixed(1)}KG` : '--';
    return `${heightValue} ${weightValue}`;
}

// --- Rendering ---
function renderPokemon(data) {
    const id = data && (data.id || data.external_id);
    pokemonId.textContent = id ? String(id).padStart(3, '0') : '---';
    pokemonName.textContent = formatName(data && data.name);
    pokemonTypes.textContent = formatTypes(data && data.types);
    pokemonHW.textContent = formatHeightWeight(data && data.height, data && data.weight);
}

// --- Fetch Handlers ---
async function fetchRandomPokemon(options = {}) {
    const range = options.range || 'all';
    showLoading();
    try {
        const url = new URL(`${API_BASE_URL}/pokemon/random`);
        const persistValue = options.persist === false ? 'false' : 'true';
        url.searchParams.set('persist', persistValue);
        if (range === 'original') {
            url.searchParams.set('range', 'original');
        }
        const data = await fetchJsonWithRetry(url.toString(), {
            headers: { 'Accept': 'application/json' }
        });
        if (!isOn()) {
            return;
        }
        renderPokemon(data);
        showPokemon();
    } catch (error) {
        if (!isOn()) {
            return;
        }
        const message = formatErrorMessage(error);
        showMenu();
        setStatus(message, true);
    }
}

async function triggerRateLimit() {
    if (!isOn()) {
        return;
    }
    showLoading();
    const url = new URL(`${API_BASE_URL}/pokemon/random`);
    url.searchParams.set('persist', 'false');
    try {
        for (let i = 0; i < 4; i += 1) {
            const response = await fetchWithTimeout(url.toString(), {
                headers: { 'Accept': 'application/json' }
            });
            if (!response.ok) {
                throw new ApiError(response.status, response.statusText);
            }
            try {
                await response.json();
            } catch (_) {
                // Ignore parsing issues; we only care about status codes here.
            }
        }
        if (!isOn()) {
            return;
        }
        showDevMenu();
        setStatus('NO LIMIT HIT');
    } catch (error) {
        if (!isOn()) {
            return;
        }
        const message = formatErrorMessage(error);
        showDevMenu();
        setStatus(message, true);
    }
}

async function triggerTimeout() {
    if (!isOn()) {
        return;
    }
    showLoading();
    const url = new URL(`${API_BASE_URL}/pokemon/random`);
    url.searchParams.set('persist', 'false');
    try {
        const response = await fetchWithTimeout(url.toString(), {
            headers: { 'Accept': 'application/json' }
        }, 1);
        if (!response.ok) {
            throw new ApiError(response.status, response.statusText);
        }
        try {
            await response.json();
        } catch (_) {
            // Ignore parsing issues; we only care about status codes here.
        }
        if (!isOn()) {
            return;
        }
        showDevMenu();
        setStatus('NO TIMEOUT HIT');
    } catch (error) {
        if (!isOn()) {
            return;
        }
        const message = formatErrorMessage(error);
        showDevMenu();
        setStatus(message, true);
    }
}

async function triggerNotFound() {
    if (!isOn()) {
        return;
    }
    showLoading();
    const url = new URL(`${API_BASE_URL}/pokemon/does-not-exist`);
    url.searchParams.set('persist', 'false');
    try {
        const response = await fetchWithTimeout(url.toString(), {
            headers: { 'Accept': 'application/json' }
        });
        if (!response.ok) {
            throw new ApiError(response.status, response.statusText);
        }
        try {
            await response.json();
        } catch (_) {
            // Ignore parsing issues; we only care about status codes here.
        }
        if (!isOn()) {
            return;
        }
        showDevMenu();
        setStatus('NO 404 HIT');
    } catch (error) {
        if (!isOn()) {
            return;
        }
        const message = formatErrorMessage(error);
        showDevMenu();
        setStatus(message, true);
    }
}

// --- Controls / User Inputs ---
function handleMenuSelect() {
    if (!isOn()) {
        return;
    }
    if (currentScreen === 'nav') {
        const action = navItems[selectedIndex] && navItems[selectedIndex].dataset.action;
        if (action === 'pokedex') {
            showMenu();
        }
        if (action === 'dev') {
            showDevMenu();
        }
        return;
    }
    if (currentScreen !== 'menu') {
        if (currentScreen !== 'dev') {
            return;
        }
    }
    const activeItems = getActiveMenuItems();
    const action = activeItems[selectedIndex] && activeItems[selectedIndex].dataset.action;
    if (currentScreen === 'menu') {
        if (action === 'random') {
            fetchRandomPokemon();
            return;
        }
        if (action === 'random-original') {
            fetchRandomPokemon({ range: 'original' });
            return;
        }
        if (action === 'about') {
            showAbout();
            return;
        }
    }
    if (currentScreen === 'dev') {
        if (action === 'rate-limit') {
            triggerRateLimit();
        } else if (action === 'timeout') {
            triggerTimeout();
        } else if (action === 'not-found') {
            triggerNotFound();
        }
    }
}

function handleBack() {
    if (!isOn()) {
        return;
    }
    if (currentScreen === 'menu') {
        showNavMenu();
        return;
    }
    if (currentScreen === 'dev') {
        showNavMenu();
        return;
    }
    if (currentScreen !== 'nav') {
        showMenu();
    }
}

function handleUp() {
    if (!isOn()) {
        return;
    }
    registerDevInput('up');
    if (currentScreen !== 'menu' && currentScreen !== 'nav' && currentScreen !== 'dev') {
        return;
    }
    setSelectedIndex(selectedIndex - 1);
}

function handleDown() {
    if (!isOn()) {
        return;
    }
    registerDevInput('down');
    if (currentScreen !== 'menu' && currentScreen !== 'nav' && currentScreen !== 'dev') {
        return;
    }
    setSelectedIndex(selectedIndex + 1);
}

function handleLeft() {
    if (!isOn()) {
        return;
    }
    registerDevInput('left');
}

function handleRight() {
    if (!isOn()) {
        return;
    }
    registerDevInput('right');
}

// --- Power toggle handler and boot ---
function toggleOnOff() {
    if (onOffButton.classList.contains('off')) {
        clearTimers();
        turnOn();
        turnOnBatteryLight();
        turnOnDisplay();
        screenContent.classList.add('hidden');
        resetScreenState();
        bootTimeoutId = setTimeout(startGame, 500);
        screenTimeoutId = setTimeout(nextScreen, 4500);
    } else if (onOffButton.classList.contains('on')) {
        clearTimers();
        turnOff();
        turnOffBatteryLight();
        turnOffDisplay();
        removeInitialScreen();
        screenContent.classList.add('hidden');
    }
}

// --- Post-logo screen transition ---
function nextScreen() {
    if (!isOn()) {
        return;
    }
    nintendoLogo.classList.add('hidden');
    nintendoLogoContainer.classList.remove('drop');
    screenContent.classList.remove('hidden');
    showNavMenu();
}

// --- Main UI Bindings ---
if (!uiReady) {
    console.warn('[Gameboy] UI elements missing; skipping control bindings.');
} else {
    onOffButton.addEventListener('click', toggleOnOff);

    dPadUp.addEventListener('click', handleUp);
    dPadDown.addEventListener('click', handleDown);
    dPadLeft.addEventListener('click', handleLeft);
    dPadRight.addEventListener('click', handleRight);
    aButton.addEventListener('click', handleMenuSelect);
    startButton.addEventListener('click', handleMenuSelect);
    bButton.addEventListener('click', handleBack);

    document.addEventListener('keydown', (event) => {
        if (!isOn()) {
            return;
        }
        switch (event.key) {
            case 'ArrowUp':
                handleUp();
                break;
            case 'ArrowDown':
                handleDown();
                break;
            case 'ArrowLeft':
                handleLeft();
                break;
            case 'ArrowRight':
                handleRight();
                break;
            case 'Enter':
            case 'a':
            case 'A':
                handleMenuSelect();
                break;
            case 'b':
            case 'B':
            case 'Escape':
                handleBack();
                break;
            default:
                break;
        }
    });
}