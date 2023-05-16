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
    document.evaluate(calMatch, document, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null).snapshotItem(index).insertAdjacentHTML("beforeBegin",savedCourses.get(calEvents[index]) + " - ");
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

// change colors
addGlobalStyle('body {background-color: var(--backgroundColor) !important;}'); //background
addGlobalStyle('#page.drawers .main-inner{background-color: var(--darkAccent) !important; padding: 4rem 0.3rem 0 0.3rem; margin: 0;}');
//addGlobalStyle('body .dark-theme{background-color: #4e5938 !important;}'); //dark
addGlobalStyle('h2, .h2{color: var(--textColor);}'); //fixes text color

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









//location.href=location.href.replace("/","/my");
