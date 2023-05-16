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



document.getElementsByTagName('body')[0].className = 'dark-theme || light-theme';

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


var calMatch = '//a[contains(@href,"https://moodle.tu-dortmund.de/calendar/view.php?view=day&course=")]'
for (let index = 0; index < document.evaluate(calMatch, document, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null).snapshotLength; index++) {
    var id = document.evaluate(calMatch, document, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null).snapshotItem(index).href;
    id = id.split("&")[1];
    id = id.split("=")[1];
    var courseName = "undefined";

    var courseUrl = 'https://moodle.tu-dortmund.de/course/view.php?id=' + id;  // Replace with the URL of your Moodle site

        fetch(courseUrl)
            .then(response => response.text())
            .then(html => {
                var parser = new DOMParser();
                var doc = parser.parseFromString(html, 'text/html');
                var courseNameElement = doc.querySelector('.page-header-headings h1');
                if (courseNameElement) {
                    courseName = courseNameElement.innerText;
                  courseName = courseName.split(",")[0];
    document.evaluate(calMatch, document, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null).snapshotItem(index).insertAdjacentHTML("beforeBegin",courseName + " -‎");
                } else {
                    console.log('Course not found');
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });

}


// forward login overview to TU SSO (in case of direct addressing of that page, or a forwarding from somewhere else)
if(window.location.href.match("https://moodle.tu-dortmund.de/login/index.php")){
  window.location.href="https://sso.itmc.tu-dortmund.de/openam/XUI/?goto=https%3A%2F%2Fmoodle.tu-dortmund.de%2Flogin#login/"
}

// change colors
addGlobalStyle('body {background-color: #c8e68e !important;}'); //background
addGlobalStyle('#page.drawers .main-inner{background-color: #595959 !important; padding: 4rem 0.3rem 0 0.3rem; margin: 0;}');
//addGlobalStyle('body .dark-theme{background-color: #4e5938 !important;}'); //dark
addGlobalStyle('h2, .h2{color: #FFFFFF;}'); //fixes text color

//make overview elements not round
addGlobalStyle('#page.drawers{margin-top:50px; height:auto;}');
addGlobalStyle('.card{border-radius:0.3rem !important;}');
addGlobalStyle('.pb-3, .py-3{padding-bottom: 0.3rem !important;}')

// remove header
//addGlobalStyle('#page-header{display: none !important;}');

// remove the waving hand
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

// remove unimportant elements
document.getElementById('inst969724').remove(); //anmeldung von modulen
document.getElementById('inst969725').remove(); //account beantragung fuer externe

// change course display to show 4-5 elements per row instead of 3
addGlobalStyle('.dashboard-card-deck:not(.fixed-width-cards) .dashboard-card{min-width: calc(20% - 0.5rem); max-width: calc(25% - 0.5rem);}');

// replace "Meine Startseite" with "Startseite"
document.body.innerHTML = document.body.innerHTML.replaceAll('Meine Startseite','Startseite');

// add module name in calendar preview WIP
addGlobalStyle('#card-text content calendarwrapper{background-color:green !important;}');

// re-add border on modules
addGlobalStyle('.card-deck > .card{border: 0.3rem solid rgba(0,0,0,.125) !important;}');

// add LSF to top bar FOR NOW BY REPLACING FAQ
addGlobalStyle('#moremenu-6462516b87efe-navbar-nav > li:nth-child(5){innerHTML="LSF"}');
// document.evaluate(calMatch, document, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null).snapshotItem(index).insertAdjacentHTML("beforeBegin",











//location.href=location.href.replace("/","/my");
