// ==UserScript==
// @name         HPW Digital-Check Redirect Script Google Forms
// @namespace    https://hp-w.de/
// @version      1.6.7
// @description  Weiterleitung zurück zum Anfang des "Digital-Check"-Forms, sobald die Umfrage vom Nutzer abgeschlossen wurde.
// @author       Vivian Klein
// @match        *://**/**
// @grant        none
// ==/UserScript==

// Function to add global CSS rule
function addGlobalStyle(css) {
    var head, style;
    head = document.getElementsByTagName('head')[0];
    if (!head) { return; }
    style = document.createElement('style');
    style.type = 'text/css';
    style.textContent = css;
    head.appendChild(style);
}

// Define colors
addGlobalStyle(':root { --backgroundColor: #B3CDC5; --accentColor: #93A8A2; }');
const backgroundColor = "#B3CDC5";
const accentColor = "#93A8A2";

// Function to add a logo, qr code and accent stripe
function addLogo() {
    const logoUrl = 'https://hp-w.de/wp-content/uploads/2021/11/hpw-logo.svg';
    const logo = document.createElement('img');
    logo.src = logoUrl;
    logo.alt = 'Logo';
    logo.style.position = 'fixed';
    logo.style.top = '50px';
    logo.style.left = '10px';
    logo.style.zIndex = '1000';
    logo.style.width = '100px';
    document.body.appendChild(logo);

    const qrCodeUrl = 'https://i.imgur.com/nDsVEBo.png';
    const qrCode = document.createElement('img');
    qrCode.src = qrCodeUrl;
    qrCode.alt = 'QR Code';
    qrCode.style.position = 'fixed';
    qrCode.style.bottom = '50px';
    qrCode.style.right = '50px';
    qrCode.style.zIndex = '1000';
    qrCode.style.width = '130px';
    document.body.appendChild(qrCode);

    const container = document.createElement('div');
    container.style.height = '30px';
    container.style.width = '100%';
    container.style.backgroundColor = 'transparent';
    container.style.display = 'flex';
    container.style.alignItems = 'center';
    document.body.insertBefore(container, document.body.firstChild);

    const coloredRect = document.createElement('div');
    coloredRect.style.height = '30px';
    coloredRect.style.width = '250px';
    coloredRect.style.backgroundColor = accentColor;
    container.appendChild(coloredRect);
}

// Function to request fullscreen for a given element
function requestFullscreen(element) {
    if (element.requestFullscreen) {
        element.requestFullscreen();
    } else if (element.mozRequestFullScreen) { // Firefox
        element.mozRequestFullScreen();
    } else if (element.webkitRequestFullscreen) { // Chrome, Safari and Opera
        element.webkitRequestFullscreen();
    } else if (element.msRequestFullscreen) { // IE/Edge
        element.msRequestFullscreen();
    }
}

// Function to check if fullscreen mode is active
function isFullscreen() {
    return document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement || document.msFullscreenElement;
}

/*// Function to create and add a fullscreen button
function addFullscreenButton() {
    const button = document.createElement('button');
    button.textContent = 'Enter Fullscreen';
    button.style.position = 'fixed';
    button.style.top = '10px';
    button.style.right = '10px';
    button.style.zIndex = '1000';
    button.style.padding = '10px';
    button.style.backgroundColor = accentColor;
    button.style.border = 'none';
    button.style.color = 'white';
    button.style.cursor = 'pointer';

    button.addEventListener('click', function() {
        requestFullscreen(document.documentElement);
    });

    document.body.appendChild(button);

    // Event listener for fullscreen changes
    document.addEventListener('fullscreenchange', function() {
        if (isFullscreen()) {
            button.style.display = 'none';
        } else {
            button.style.display = 'block';
        }
    });

    // Simulate a click event on the button
    button.click();
}

// Call the function to add the fullscreen button
addFullscreenButton();
*/
(function() {
    'use strict';

    // Define the URLs
    const targetUrl = 'https://docs.google.com/forms/d/e/1FAIpQLScXMVoNMkt-XIT9hOJeHfOG93TWxpXJ5uCKBQ5foDHhBJgHuQ/viewform?usp=sf_link';
    const triggerUrl = 'https://docs.google.com/forms/u/0/d/e/1FAIpQLScXMVoNMkt-XIT9hOJeHfOG93TWxpXJ5uCKBQ5foDHhBJgHuQ/formResponse';

    // Check if the current URL matches the trigger URL
    if (!window.location.href.includes(targetUrl)) {
        console.log("redirecting");
        // Redirect to the target URL
        window.location.href = targetUrl;
    } else {
        console.log("not redirecting");
    }

  const footer = document.querySelectorAll('[href="//www.google.com/forms/about/?utm_source=product&utm_medium=forms_logo&utm_campaign=forms"]');
    if (footer[0]) {
        footer[0].style.display = "none";
    }

    // Load font from Google Fonts
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Gothic+A1&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    // Wait for the font to load and then apply the styles
    link.onload = function() {
        addGlobalStyle('* { font-family: "Gothic A1", sans-serif !important; }');
        const headings = document.querySelectorAll('[role="heading"]');
        headings.forEach(elem => {
            elem.style.fontWeight = "bolder";
        });
    };

    // Change accent color
    const accentedButtons = Array.from(document.querySelectorAll('*')).filter(elem => {
        const computedStyle = window.getComputedStyle(elem);
        return computedStyle.backgroundColor === 'rgb(134, 117, 80)' || computedStyle.backgroundColor === 'rgb(147, 132, 102)';
    });
    const accentedTexts = Array.from(document.querySelectorAll('*')).filter(elem => {
        const computedStyle = window.getComputedStyle(elem);
        return computedStyle.color === 'rgb(134, 117, 80)' || computedStyle.backgroundColor === 'rgb(147, 132, 102)';
    });
    accentedButtons.forEach(elem => {
        elem.style.backgroundColor = accentColor;
    });
    accentedTexts.forEach(elem => {
        elem.style.color = accentColor;
    });

    // Change background color
    document.body.style.backgroundColor = backgroundColor;

    // Add the logo once the page has fully loaded
    window.addEventListener('load', function() {
        addLogo();
    });

    // Remove unimportant elements
    // Fetch "Konto wechseln" button to get to the account section by iterating up the DOM
    const accChoosers = Array.from(document.querySelectorAll('[href]')).filter(element => {
        return element.href.includes("https://accounts.google.com/AccountChooser");
    });
    const kontoWechseln = accChoosers[0];
    if (kontoWechseln) {
        kontoWechseln.parentElement.parentElement.parentElement.parentElement.parentElement.style.display = "none";
    }

  //move legal text
  const legalTexts = Array.from(document.querySelectorAll('a')).filter(elem => elem.href = 'https://policies.google.com/terms');
  legalTexts[1].parentElement.style.position = 'absolute';
  legalTexts[1].parentElement.style.width = '10vw';
  legalTexts[1].parentElement.style.left = '0';
  legalTexts[1].parentElement.style.bottom = '20px';



})();
