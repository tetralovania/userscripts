// ==UserScript==
// @name         HPW Digital-Check Redirect Script Google Forms
// @namespace    https://hp-w.de/
// @version      1.3
// @description  Weiterleitung zurück zum Anfang des "Digital-Check"-Forms, sobald die Umfrage vom Nutzer abgeschlossen wurde.
// @author       Vivian Klein
// @match        https://docs.google.com/**
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

// Function to add a logo
function addLogo() {
    const logoUrl = 'https://hp-w.de/wp-content/uploads/2021/11/hpw-logo.svg';
    const logo = document.createElement('img');
    logo.src = logoUrl;
    logo.alt = 'Logo';
    logo.style.position = 'fixed';
    logo.style.top = '10px';
    logo.style.left = '10px';
    logo.style.zIndex = '1000';
    logo.style.width = '100px'; // Adjust size as needed
    document.body.appendChild(logo);
}

(function() {
    'use strict';

    // Define the URLs
    const targetUrl = 'https://docs.google.com/forms/d/e/1FAIpQLScXMVoNMkt-XIT9hOJeHfOG93TWxpXJ5uCKBQ5foDHhBJgHuQ/viewform?usp=sf_link';
    const triggerUrl = 'https://docs.google.com/forms/u/0/d/e/1FAIpQLScXMVoNMkt-XIT9hOJeHfOG93TWxpXJ5uCKBQ5foDHhBJgHuQ/formResponse';

    // Define colors
    addGlobalStyle(':root { --backgroundColor: #B3CDC5; --accentColor: #93A8A2; }');
    const backgroundColor = "#B3CDC5";
    const accentColor = "#93A8A2";

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
      })
    };

  // change accent color
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
    addGlobalStyle('.D8bnZd { background-color: var(--backgroundColor); }');

    // Add the logo once the page has fully loaded
    window.addEventListener('load', addLogo);

  //remove unimportant elements
  //fetch "Konto wechseln" button to get to the account section by iterating up the DOM
  const accChoosers = Array.from(document.querySelectorAll('[href]')).filter(element => {
    return element.href.includes("https://accounts.google.com/AccountChooser");
  });
  const kontoWechseln = accChoosers[0];
  kontoWechseln.parentElement.parentElement.parentElement.parentElement.parentElement.style.display = "none";

  const footer = document.querySelectorAll('[href="//www.google.com/forms/about/?utm_source=product&utm_medium=forms_logo&utm_campaign=forms"]');
  footer[0].style.display = "none";


    // Check if the current URL matches the trigger URL
    if (window.location.href.includes(triggerUrl)) {
        // Redirect to the target URL
        window.location.href = targetUrl;
    }
})();
