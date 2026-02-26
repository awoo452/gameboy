const onOffButton = document.querySelector('#onOffButton');
const batteryLight = document.querySelector('#batteryLight');
const display = document.querySelector('#display');
const nintendoLogoContainer = document.querySelector('#nintendoLogoContainer');
const nintendoLogo = document.querySelector('#nintendoLogo');
const screenContent = document.querySelector('#screenContent');
const screenTitle = document.querySelector('#screenTitle');
const screenBadge = document.querySelector('#screenBadge');
const navMenu = document.querySelector('#navMenu');
const navItems = Array.from(document.querySelectorAll('.navItem'));
const menu = document.querySelector('#menu');
const menuItems = Array.from(document.querySelectorAll('.menuItem'));
const statusText = document.querySelector('#statusText');
const pokemonCard = document.querySelector('#pokemonCard');
const aboutCard = document.querySelector('#aboutCard');
const pokemonId = document.querySelector('#pokemonId');
const pokemonName = document.querySelector('#pokemonName');
const pokemonTypes = document.querySelector('#pokemonTypes');
const pokemonHW = document.querySelector('#pokemonHW');
const dPadUp = document.querySelector('.dPadUp');
const dPadDown = document.querySelector('.dPadDown');
const startButton = document.querySelector('.startButton');
const aButton = document.querySelector('.aButton');
const bButton = document.querySelector('.bButton');

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

let bootTimeoutId = null;
let screenTimeoutId = null;
let selectedIndex = 0;
let currentScreen = 'boot';

class ApiError extends Error {
    constructor(status, statusText) {
        super(`HTTP ${status}`);
        this.name = 'ApiError';
        this.status = status;
        this.statusText = statusText;
    }
}

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

function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithTimeout(url, options = {}) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
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
            if (attempt < RETRY_LIMIT) {
                attempt += 1;
                await delay(delayMs);
                delayMs = Math.round(delayMs * 1.6);
                continue;
            }
            throw error;
        }
    }
}

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

function removeInitialScreen() {
    nintendoLogo.classList.add('hidden');
    nintendoLogoContainer.classList.remove('drop');
}

function setStatus(text, isError = false) {
    statusText.textContent = text;
    statusText.classList.toggle('is-error', isError);
}

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
}

function getActiveMenuItems() {
    if (currentScreen === 'nav') {
        return navItems;
    }
    if (currentScreen === 'menu') {
        return menuItems;
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
    pokemonCard.classList.add('hidden');
    aboutCard.classList.add('hidden');
    setStatus('FETCHING...');
}

function showPokemon() {
    currentScreen = 'details';
    navMenu.classList.add('hidden');
    menu.classList.add('hidden');
    aboutCard.classList.add('hidden');
    pokemonCard.classList.remove('hidden');
    setStatus('FOUND');
}

function showAbout() {
    currentScreen = 'about';
    navMenu.classList.add('hidden');
    menu.classList.add('hidden');
    pokemonCard.classList.add('hidden');
    aboutCard.classList.remove('hidden');
    setStatus('INFO');
}

function resetScreenState() {
    showNavMenu();
}

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

function renderPokemon(data) {
    const id = data && (data.id || data.external_id);
    pokemonId.textContent = id ? String(id).padStart(3, '0') : '---';
    pokemonName.textContent = formatName(data && data.name);
    pokemonTypes.textContent = formatTypes(data && data.types);
    pokemonHW.textContent = formatHeightWeight(data && data.height, data && data.weight);
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

async function fetchRandomPokemon(options = {}) {
    const range = options.range || 'all';
    showLoading();
    try {
        const url = new URL(`${API_BASE_URL}/pokemon/random`);
        if (options.persist === false) {
            url.searchParams.set('persist', 'false');
        }
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


function handleMenuSelect() {
    if (!isOn()) {
        return;
    }
    if (currentScreen === 'nav') {
        const action = navItems[selectedIndex] && navItems[selectedIndex].dataset.action;
        if (action === 'pokedex') {
            showMenu();
        }
        return;
    }
    if (currentScreen !== 'menu') {
        return;
    }
    const action = menuItems[selectedIndex] && menuItems[selectedIndex].dataset.action;
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

function handleBack() {
    if (!isOn()) {
        return;
    }
    if (currentScreen === 'menu') {
        showNavMenu();
        return;
    }
    if (currentScreen !== 'nav') {
        showMenu();
    }
}

function handleUp() {
    if (!isOn() || (currentScreen !== 'menu' && currentScreen !== 'nav')) {
        return;
    }
    setSelectedIndex(selectedIndex - 1);
}

function handleDown() {
    if (!isOn() || (currentScreen !== 'menu' && currentScreen !== 'nav')) {
        return;
    }
    setSelectedIndex(selectedIndex + 1);
}

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

function nextScreen() {
    if (!isOn()) {
        return;
    }
    nintendoLogo.classList.add('hidden');
    nintendoLogoContainer.classList.remove('drop');
    screenContent.classList.remove('hidden');
    showNavMenu();
}

onOffButton.addEventListener('click', toggleOnOff);

dPadUp.addEventListener('click', handleUp);
dPadDown.addEventListener('click', handleDown);
aButton.addEventListener('click', handleMenuSelect);
startButton.addEventListener('click', handleMenuSelect);
bButton.addEventListener('click', handleBack);

document.addEventListener('keydown', (event) => {
    if (!isOn()) {
        return;
    }
    if (event.key === 'ArrowUp') {
        handleUp();
        return;
    }
    if (event.key === 'ArrowDown') {
        handleDown();
        return;
    }
    if (event.key === 'Enter' || event.key.toLowerCase() === 'a') {
        handleMenuSelect();
        return;
    }
    if (event.key.toLowerCase() === 'b' || event.key === 'Escape') {
        handleBack();
    }
});
