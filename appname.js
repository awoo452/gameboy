const onOffButton = document.querySelector('#onOffButton');
const batteryLight = document.querySelector('#batteryLight');
const display = document.querySelector('#display');
const nintendoLogoContainer = document.querySelector('#nintendoLogoContainer');
const nintendoLogo = document.querySelector('#nintendoLogo');
const screenContent = document.querySelector('#screenContent');
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

let bootTimeoutId = null;
let screenTimeoutId = null;
let selectedIndex = 0;
let currentScreen = 'boot';

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
    if (menuItems.length === 0) {
        return;
    }
    selectedIndex = (index + menuItems.length) % menuItems.length;
    menuItems.forEach((item, itemIndex) => {
        item.classList.toggle('is-selected', itemIndex === selectedIndex);
    });
}

function showMenu() {
    currentScreen = 'menu';
    menu.classList.remove('hidden');
    pokemonCard.classList.add('hidden');
    aboutCard.classList.add('hidden');
    setStatus('READY');
}

function showLoading() {
    currentScreen = 'loading';
    menu.classList.add('hidden');
    pokemonCard.classList.add('hidden');
    aboutCard.classList.add('hidden');
    setStatus('FETCHING...');
}

function showPokemon() {
    currentScreen = 'details';
    menu.classList.add('hidden');
    aboutCard.classList.add('hidden');
    pokemonCard.classList.remove('hidden');
    setStatus('FOUND');
}

function showAbout() {
    currentScreen = 'about';
    menu.classList.add('hidden');
    pokemonCard.classList.add('hidden');
    aboutCard.classList.remove('hidden');
    setStatus('INFO');
}

function resetScreenState() {
    setSelectedIndex(0);
    showMenu();
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

async function fetchRandomPokemon() {
    showLoading();
    try {
        const response = await fetch(`${API_BASE_URL}/pokemon/random?persist=false`, {
            headers: { 'Accept': 'application/json' }
        });
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        const data = await response.json();
        if (!isOn()) {
            return;
        }
        renderPokemon(data);
        showPokemon();
    } catch (error) {
        if (!isOn()) {
            return;
        }
        showMenu();
        setStatus('ERROR', true);
    }
}

function handleMenuSelect() {
    if (!isOn() || currentScreen !== 'menu') {
        return;
    }
    const action = menuItems[selectedIndex] && menuItems[selectedIndex].dataset.action;
    if (action === 'random') {
        fetchRandomPokemon();
        return;
    }
    if (action === 'about') {
        showAbout();
    }
}

function handleBack() {
    if (!isOn()) {
        return;
    }
    if (currentScreen !== 'menu') {
        showMenu();
    }
}

function handleUp() {
    if (!isOn() || currentScreen !== 'menu') {
        return;
    }
    setSelectedIndex(selectedIndex - 1);
}

function handleDown() {
    if (!isOn() || currentScreen !== 'menu') {
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
    showMenu();
}

onOffButton.addEventListener('click', toggleOnOff);

menuItems.forEach((item, index) => {
    item.addEventListener('click', () => {
        if (!isOn()) {
            return;
        }
        setSelectedIndex(index);
        handleMenuSelect();
    });
});

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
