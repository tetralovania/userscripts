// ==UserScript==
// @name Moodle Verbesserungen (TUDO)
// @version 1.0
// @description Macht das Moodle ein kleines bisschen weniger grauenhaft.
// @include https://moodle.tu-dortmund.de/**
// @grant        GM_xmlhttpRequest
// @author Lennart Klein
// ==/UserScript==

/* KNOWN ISSUES
 * doesnt work below 992px width
 * clicking the more menu and then hovering the lower edge causes it to flicker
*/



function addGlobalStyle(css) {
  var head, style;
  head = document.getElementsByTagName('head')[0];
  if (!head) { return; }
  style = document.createElement('style');
  style.type = 'text/css';
  style.innerHTML = css;
  head.appendChild(style);
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


const addCourseNameToCalendar = async () => {
  let calMatch = '//a[contains(@href,"https://moodle.tu-dortmund.de/calendar/view.php?view=day&course=")]';
  const calEvents = [];
  for(let index = 0; index < 10; index++){
    calEvents[index] = document.evaluate(calMatch, document, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null).snapshotItem(index).href.split("&")[1].split("=")[1];
  }
  const savedCourses = await courseNamesToMap()
  for(let index = 0; index < 10; index++){
    var courseText = savedCourses.get(calEvents[index]);
    var courseLink = calEvents[index];
    var finalCourseName = '<a href="course/view.php?id=' + calEvents[index] + '">' + courseText + '</a>';
    document.evaluate(calMatch, document, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null).snapshotItem(index).insertAdjacentHTML("beforeBegin",finalCourseName + " - ");
  }
}

const processedEvents = []; // Array to track processed event IDs

async function courseNamesToMap() {
  const savedCourses = new Map();
  const calEvents = [];
  let calMatch = '//a[contains(@href,"https://moodle.tu-dortmund.de/calendar/view.php?view=day&course=")]';
  const calLength = document.evaluate(calMatch, document, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null).snapshotLength;

  for (let index = 0; index < calLength; index++) {
    calEvents[index] = document.evaluate(calMatch, document, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null).snapshotItem(index).href.split("&")[1].split("=")[1];
  }

  // Check if savedCourses exist in a cookie
  const savedCoursesCookie = getCookie('savedCourses');
  if (savedCoursesCookie) {
    console.log("cookie found");
    // Parse and load savedCourses from cookie
    const parsedSavedCourses = parseMap(savedCoursesCookie);
    if (parsedSavedCourses instanceof Map) {
      parsedSavedCourses.forEach((value, key) => {
        savedCourses.set(key, value);
      });
    }
  }

  const fetchPromises = calEvents.map((eventId) => {
    if (savedCourses.has(eventId)) {
      console.log("Course already saved");
      return Promise.resolve();
    } else {
      processedEvents.push(eventId);

      const courseUrl = 'https://moodle.tu-dortmund.de/course/view.php?id=' + eventId;
      return fetch(courseUrl)
        .then(response => response.text())
        .then(html => {
          const parser = new DOMParser();
          const doc = parser.parseFromString(html, 'text/html');
          const courseNameElement = doc.querySelector('.page-header-headings h1');
          if (courseNameElement) {
            console.log(eventId);
            const courseName = courseNameElement.innerText.split(",")[0];
            savedCourses.set(eventId, courseName);
            console.log("fetched course");
          } else {
            console.log('Course not found');
          }
        })
        .catch(error => {
          console.error('Error:', error);
        });
    }
  });

  await Promise.all(fetchPromises);

  // Save savedCourses in a cookie
  console.log(savedCourses);
  setCookie('savedCourses', stringifyMap(savedCourses));

  return savedCourses;
}



function parseMap(string){
  const out = new Map();
  const keys = [];
  const values = [];
  const raw = string.split(",");
  for(let i = 0; i < raw.length; i++){
    if(i%2 == 0){
      keys.push(raw[i]);
    } else {
      values.push(raw[i]);
    }
  }
  for(let i = 0; i < keys.length; i++){
    out.set(keys[i], values[i]);
  }
  return out;
}

function stringifyMap(map){
  var out = "";
  const keys = Array.from(map.keys());
  const values = Array.from(map.values());
  for(let i = 0; i < keys.length; i++){
    out += (keys[i]+","+values[i]+",");
  }
  return out.substring(0, out.length -1);
}

// Helper function to get a cookie value by name
function getCookie(name) {
  const cookies = document.cookie.split(';');
  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i].trim();
    if (cookie.startsWith(name + '=')) {
      console.log(cookie.substring(name.length+1));
      return cookie.substring(name.length + 1);
    }
  }
  return '';
}

// Helper function to set a cookie
function setCookie(name, value) {
  document.cookie = `${name}=${value}`;
}

function navitemToMoreMenu(childNr){

}



document.getElementsByTagName('body')[0].className = 'dark-theme || light-theme';

// map colors correctly
// COLORS
addGlobalStyle(':root{--backgroundColor:#c8e68e; --darkAccent:#595959; --textColor:#ffffff;}');



// skip login overview page
// replace login button link
for (i = 0; i < document.links.length; i++) {
  var link = document.links[i];
  var match = link.href.match("https://moodle.tu-dortmund.de/login/index.php");

  if (match != null) {
      link.href = "https://sso.itmc.tu-dortmund.de/openam/XUI/?goto=https%3A%2F%2Fmoodle.tu-dortmund.de%2Flogin#login/";
      break;
  }
}


// forward login overview to TU SSO (in case of direct addressing of that page, or a forwarding from somewhere else)
if(window.location.href.match("https://moodle.tu-dortmund.de/login/index.php")){
  window.location.href="https://sso.itmc.tu-dortmund.de/openam/XUI/?goto=https%3A%2F%2Fmoodle.tu-dortmund.de%2Flogin#login/"
}


// replace link to main page
for (i = 0; i < document.links.length; i++) {
  var link = document.links[i];
  var match = link.href.match("https://www.tu-dortmund.de/");

  if (match != null) {
      link.href = "https://moodle.tu-dortmund.de/my/";
      break;
  }
}


// change colors
addGlobalStyle('body {background-color: var(--backgroundColor) !important;}'); //background
addGlobalStyle('#page.drawers .main-inner{background-color: var(--darkAccent) !important; padding: 4rem 0.3rem 0 0.3rem; margin: 0;}');
//addGlobalStyle('body .dark-theme{background-color: #4e5938 !important;}'); //dark
addGlobalStyle('h2, .h2{color: var(--textColor);}'); //fixes text color
addGlobalStyle('#footnote {color: var(--darkAccent);}'); //footnote separators
var footer = document.getElementById('footnote');//footnote text color
footer.childNodes[1].childNodes[1].childNodes[1].childNodes[0].childNodes.forEach(function(node){
  if (node.nodeName === 'A') {
    node.setAttribute('style', 'color: #1d2125');
  }
});

//add userscript github
var footnote = footer.childNodes[1].childNodes[1].childNodes[1].childNodes[0].childNodes[footer.childNodes[1].childNodes[1].childNodes[1].childNodes[0].childNodes.childElementCount-1];
var separator = document.createElement('span');
separator.textContent = '|';
separator.style.display = 'inline';
footnote.appendChild(separator);

//make overview elements not round
addGlobalStyle('#page.drawers{margin-top:50px; height:auto;}');
addGlobalStyle('.card{border-radius:0.3rem !important;}');
addGlobalStyle('.pb-3, .py-3{padding-bottom: 0.3rem !important;}')

// remove the very annoying waving hand to increase overall well-being
addGlobalStyle('#page-header > div > div.d-flex.align-items-center > h2{visibility:hidden;}');
addGlobalStyle('#page-header > div > div.d-flex.align-items-center > h2:after{content:"Willkommen"; visibility:visible; position:absolute; left:60px}');

// get rid of enormous padding
addGlobalStyle('.pagelayout-standard #page.drawers .main-inner, body.limitedwidth #page.drawers .main-inner{max-width: 100%}'); //main overview element
addGlobalStyle('#page.drawers div[role="main"]{padding: 0 25px;}'); //content of overview element
addGlobalStyle('#region-main{border-radius: 0.3rem; padding: 5px 0;}'); //fixes padding on top and bottom of page, also rounds inner corners
addGlobalStyle('#page-wrapper #page{height: 100vh !important;}');

// get rid of borders
addGlobalStyle('.border-bottom{border-bottom: none !important;}'); //remove border below upcoming deadlines etc.
addGlobalStyle('.card{border:none !important;}'); //remove border around elements (calendar, course overview, etc.)

// re-add border on modules
addGlobalStyle('.card-deck > .card{border: 0.3rem solid rgba(0,0,0,.125) !important;}');

// remove unimportant elements
document.getElementById('inst969724').remove(); //anmeldung von modulen
document.getElementById('inst969725').remove(); //account beantragung fuer externe

// change course display to show 4-5 elements per row instead of 3
addGlobalStyle('.dashboard-card-deck:not(.fixed-width-cards) .dashboard-card{min-width: calc(20% - 0.5rem); max-width: calc(25% - 0.5rem);}');

// replace "Meine Startseite" with "Startseite"
document.body.innerHTML = document.body.innerHTML.replaceAll('Meine Startseite','Startseite');

// add module name in calendar preview WIP
//addGlobalStyle('#card-text content calendarwrapper{background-color:green !important;}');

// add LSF to top bar FOR NOW BY REPLACING FAQ
addGlobalStyle('#moremenu-6462516b87efe-navbar-nav > li:nth-child(5){innerHTML="LSF"}');
// document.evaluate(calMatch, document, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null).snapshotItem(index).insertAdjacentHTML("beforeBegin",

// add Course to Calendar Elements on main page
addCourseNameToCalendar();

//add Elements to header bar
// add LSF
  // Create a new list item
  var newItem = document.createElement("li");
  newItem.setAttribute("data-key", "");
  newItem.setAttribute("class", "nav-item");
  newItem.setAttribute("role", "none");
  newItem.setAttribute("data-forceintomoremenu", "false");

  // Create a new link within the list item
  var newLink = document.createElement("a");
  newLink.setAttribute("role", "menuitem");
  newLink.setAttribute("class", "nav-link");
  newLink.setAttribute("href", "https://www.lsf.tu-dortmund.de/qisserver/rds;jsessionid=7A73A100D7E7C444C9B09434CC2A1D3A.lsf4?state=user&type=0&category=menu.browse&breadCrumbSource=&startpage=portal.vm");
  newLink.setAttribute("tabindex", "-1");
  newLink.textContent = "LSF";

  // Append the link to the list item
  newItem.appendChild(newLink);

  // Find the existing navigation list
  var navList = document.querySelector(".primary-navigation .nav");

  // Append the new list item to the navigation list
  navList.appendChild(newItem);

//add BOSS
// Create a new list item
  var newItem = document.createElement("li");
  newItem.setAttribute("data-key", "");
  newItem.setAttribute("class", "nav-item");
  newItem.setAttribute("role", "none");
  newItem.setAttribute("data-forceintomoremenu", "false");

  // Create a new link within the list item
  var newLink = document.createElement("a");
  newLink.setAttribute("role", "menuitem");
  newLink.setAttribute("class", "nav-link");
  newLink.setAttribute("href", "https://www.boss.tu-dortmund.de/qisserver/rds?state=user&type=0&category=menu.browse&breadCrumbSource=&startpage=portal.vm&chco=y");
  newLink.setAttribute("tabindex", "-1");
  newLink.textContent = "BOSS";

  // Append the link to the list item
  newItem.appendChild(newLink);

  // Find the existing navigation list
  var navList = document.querySelector(".primary-navigation .nav");

  // Append the new list item to the navigation list
  navList.appendChild(newItem);


//add Raumbuchung
// Create a new list item
  var newItem = document.createElement("li");
  newItem.setAttribute("data-key", "");
  newItem.setAttribute("class", "nav-item");
  newItem.setAttribute("role", "none");
  newItem.setAttribute("data-forceintomoremenu", "false");

  // Create a new link within the list item
  var newLink = document.createElement("a");
  newLink.setAttribute("role", "menuitem");
  newLink.setAttribute("class", "nav-link");
  newLink.setAttribute("href", "https://raumadm.cs.tu-dortmund.de/cont/de/lernraum/ssl/kalender.sh?id=364d68b407d4a8ad62812a0071b386fd175d01a0490017f3");
  newLink.setAttribute("tabindex", "-1");
  newLink.textContent = "Räume";

  // Append the link to the list item
  newItem.appendChild(newLink);

  // Find the existing navigation list
  var navList = document.querySelector(".primary-navigation .nav");

  // Append the new list item to the navigation list
  navList.appendChild(newItem);

//force useless stuff into more menu
 document.querySelector('.primary-navigation').onload = forceintomoremenu();


function forceintomoremenu() {
  // Find the primary-navigation element
  var primaryNav = document.querySelector('.primary-navigation');

  // Create a new list element for the More menu
  var moreMenu = document.createElement('li');
  moreMenu.setAttribute('role', 'none');
  moreMenu.setAttribute('class', 'nav-item dropdown dropdownmoremenu');
  moreMenu.setAttribute('data-region', 'morebutton');

  // Create a new link for the More menu
  var moreLink = document.createElement('a');
  moreLink.setAttribute('class', 'dropdown-toggle nav-link');
  moreLink.setAttribute('href', '#');
  moreLink.setAttribute('id', 'moremenu-dropdown-64801d6f87355');
  moreLink.setAttribute('role', 'menuitem');
  moreLink.setAttribute('data-toggle', 'dropdown');
  moreLink.setAttribute('aria-haspopup', 'true');
  moreLink.setAttribute('aria-expanded', 'false');
  moreLink.setAttribute('tabindex', '-1');
  moreLink.textContent = 'Mehr';

  // Create a new list for the dropdown menu
  var dropdownMenu = document.createElement('ul');
  dropdownMenu.setAttribute('class', 'dropdown-menu dropdown-menu-left');
  dropdownMenu.setAttribute('style', 'padding-bottom: 0; padding-top: 14px');
  dropdownMenu.setAttribute('data-region', 'moredropdown');
  dropdownMenu.setAttribute('aria-labelledby', 'moremenu-dropdown-64801d6f87355');
  dropdownMenu.setAttribute('role', 'menu');

  // Find the "Support", "FAQ" and "Kurssuche" list items
  var supportItem = primaryNav.childNodes[1].childNodes[1].childNodes[7];
  var faqItem = primaryNav.childNodes[1].childNodes[1].childNodes[9];
  var courseSearchItem = primaryNav.childNodes[1].childNodes[1].childNodes[5];

  // Add dropdown-item class to the items
  supportItem.setAttribute('class', 'dropdown-item special-fucking-snowflake');
  faqItem.setAttribute('class', 'dropdown-item');
  courseSearchItem.setAttribute('class', 'dropdown-item');
  supportItem.setAttribute('style', 'background-color: white');
  faqItem.setAttribute('style', 'background-color: white');
  courseSearchItem.setAttribute('style', 'background-color: white');
  supportItem.childNodes[1].setAttribute('style', 'border-top: 0');
  faqItem.childNodes[1].setAttribute('style', 'border-top: 0');
  courseSearchItem.childNodes[1].setAttribute('style', 'border-top: 0');

  // Append the "Support" and "FAQ" list items to the dropdown menu
  dropdownMenu.appendChild(supportItem);
  dropdownMenu.appendChild(faqItem);
  dropdownMenu.appendChild(courseSearchItem);

  // Append the dropdown menu and link to the More menu
  moreMenu.appendChild(moreLink);
  moreMenu.appendChild(dropdownMenu);

  // Append the More menu to the primary-navigation element
  primaryNav.querySelector('ul.nav').appendChild(moreMenu);
}





//location.href=location.href.replace("/","/my");
