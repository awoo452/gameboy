const onOffButton = document.querySelector('#onOffButton');
const batteryLight = document.querySelector('#batteryLight');
const display = document.querySelector('#display');
const nintendoLogoContainer = document.querySelector('#nintendoLogoContainer');
const nintendoLogo = document.querySelector('#nintendoLogo');

let bootTimeoutId = null;
let screenTimeoutId = null;

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

function toggleOnOff() {
    if (onOffButton.classList.contains('off')) {
        clearTimers();
        turnOn();
        turnOnBatteryLight();
        turnOnDisplay();
        bootTimeoutId = setTimeout(startGame, 500);
        screenTimeoutId = setTimeout(nextScreen, 4500);
    } else if (onOffButton.classList.contains('on')) {
        clearTimers();
        turnOff();
        turnOffBatteryLight();
        turnOffDisplay();
        removeInitialScreen();
    }
}

function nextScreen() {
    if (!isOn()) {
        return;
    }
    nintendoLogo.classList.add('hidden');
    nintendoLogoContainer.classList.remove('drop');
}

onOffButton.addEventListener('click', toggleOnOff);


