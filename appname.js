let offOnButton = document.querySelector('.offOnButton');
function turnOn() {
    offOnButton.classList.add('on');
    offOnButton.classList.remove('off');
}

let batteryLight = document.querySelector('#batteryLight');
function turnOnBatteryLight() {
    batteryLight.classList.remove('batteryLightOff');
    batteryLight.classList.add('batteryLightOn');
}

let display = document.querySelector('#display');
function turnOnDisplay() {
    display.classList.remove('displayOff');
    display.classList.add('displayOn');
}

let nintendoLogoContainer = document.querySelector('#nintendoLogoContainer');
function addDrop() {
    nintendoLogoContainer.classList.add('drop');
}

let nintendoLogo = document.querySelector('#nintendoLogo');
function startGame() {
    nintendoLogo.classList.remove('hidden');
    nintendoLogoContainer.classList.remove('nintendoLogoContainerPadding');
    setTimeout(addDrop, 500);
}

function turnOff() {
    offOnButton.classList.add('off');
    offOnButton.classList.remove('on');
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
    if (offOnButton.classList.contains('off')) {
        turnOn();
        turnOnBatteryLight();
        turnOnDisplay();
        setTimeout(startGame, 500);
        setTimeout(nextScreen, 4500);
    } else if (offOnButton.classList.contains('on')) {
        turnOff();
        turnOffBatteryLight();
        turnOffDisplay();
        removeInitialScreen();
    }
}

function nextScreen() {
    nintendoLogo.classList.add('hidden');
    nintendoLogoContainer.classList.remove('drop');
}



