var chrome = chrome || {};
var gridForm = document.getElementById('gridsettings');
var gridToggle = document.getElementById('gridToggle');

var options = ["largeWidth", 
               "largeColumns", 
					"smallColumns", 
					"viewports", 
					"smallWidth", 
					"gutters", 
					"outterGutters", 
					"mobileInnerGutters",
					"mobileOutterGutters", 
					"offsetX",
					"color"];


//When the popup gets opened
window.addEventListener('load', function() {
    
    //Tell me stuff about my tab
    chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
      console.log(tabs[0]); //TODO: Use this to save the state of the grid for the current tab
      setTimeout(setCurrentTabState, 10);
    });
    
    //Trigger a message that will tell me if the grid is on or off
    chrome.tabs.executeScript(null, {file: 'src/gridStatus.js'});
});

chrome.runtime.onMessage.addListener(function(request) {
  if (request.method === 'resize') {
   	var values = request.colSizes.split(',');
   	createReport(values.length, values);
  }
});

function init(){
	var inputs = gridForm.getElementsByTagName('input');
    console.log(inputs);
    var len = inputs.length;
    while (len--) {
        inputs[len].addEventListener("change", function(event) {
            if (event.target.id !== 'gridToggle') updateGrid();
        });
    }

	/*
		Will load in saved content already in local storage
	*/
	chrome.storage.sync.get(options, function(items) {

			options.forEach(function(option){

				if(inputs[option].type == "number" || inputs[option].type == "text")
					inputs[option].value = items[option] || inputs[option].value
				else if(inputs[option].type == "checkbox")
					inputs[option].checked = items[option]

			})
	});

}


//document.getElementById('tabContainer').addEventListener('click', saveTabStates);

function saveTabStates(){
	var tabs = document.querySelector("div[aria-hidden='false']");
	var tabLabel = document.querySelector("div[aria-selected='true']")
	console.log(tabs.id);
	chrome.storage.sync.set({'currentTab' : tabs.id, 'currentTabLabel' : tabLabel.id});
}

function toggleGrid() {
   var settings = saveCurrentSettings();
   executeCSS(settings);
   chrome.tabs.executeScript(null, {file: 'src/grid.js'});
   chrome.tabs.executeScript(null, {file: 'src/calcReport.js'});
}

function updateGrid(){
	 saveTabStates();
    removeGrid();
    toggleGrid();
    
}

function setCurrentTabState(){
	chrome.storage.sync.get(['currentTab', 'currentTabLabel'], function(items){
		console.log(items);

		var activeTab = document.getElementById(items["currentTab"]);
		var activeLabel = document.getElementById(items["currentTabLabel"]);

		var tabs = document.getElementsByClassName('tab');
		var tabLabels = document.getElementsByClassName('tabLabel');

		console.log(tabs);
		console.log(tabLabels);
		
		for(var i = 0; i < tabs.length; i++){
			tabs[i].setAttribute('aria-hidden', true);
			tabLabels[i].setAttribute('aria-selected', false);
		}

		
		activeTab.setAttribute('aria-hidden', false);
		activeLabel.setAttribute('aria-selected', true);

	});
}

/**
 * Unlike grid.js, this won't send a message with a status update
 */
function removeGrid(){
    chrome.tabs.executeScript(null, {
        code: 'document.body.removeChild(document.getElementsByClassName(\'cb-grid-lines\')[0]);'
    });
}


function executeCSS(options){

    chrome.windows.getCurrent(function(currWindow){

		var unitWidth = checkIfViewPortIsSelected(options['viewports']);

		chrome.tabs.insertCSS(null, {
			code: createGridLinesCSS(unitWidth)			
		});

		chrome.tabs.insertCSS(null, {
			code: createGridContainer(options)			
		});

		chrome.tabs.insertCSS(null, {
         code: createSmallContainer(options)
    	});

	});

}


/*
	Tesable functions
*/
function checkIfViewPortIsSelected(viewPortSelected){
	if(viewPortSelected){
		return 'vw';
	}else{
		return '%';
	}
}

function createGridLinesCSS(units){	
	return ".cb-grid-lines {"
				+ "width: 100" + units 
			+ "}";

}

function createGridContainer(options){
	return  ".grid-overlay-container {"
			  	+ "max-width:" + options.largeWidth + "px;"
			  	+ "padding:0px " + (options.outterGutters - (options.gutters / 2)) + "px;"
			  	+ "left:" + options.offsetX + "px;"
			+ "}"

			+ ".grid-overlay-col {"
				+ "width: calc(" + calcColumnPercents(options.largeColumns) + "% - " + options.gutters + "px);"
				+ "margin: 0 " +  (options.gutters / 2) + "px;"
				+ "background: " +  options.color + ";"
			+ "}";
}


function createSmallContainer(options){
	console.log(options);
	return "@media (max-width:" + (options.smallWidth - 1) + "px) {" 
				+ ".grid-overlay-col {"
				 	+ "width: calc(" + calcColumnPercents(options.smallColumns) + "% - " + options.mobileInnerGutters + "px);"
				 	+ "margin: 0 " +  (options.mobileInnerGutters / 2) + "px;"
				 	+ "background: " +  options.color + ";"
				+ "}"
				//+ ".grid-overlay-col:nth-of-type(1n+" + (options.smallColumns + 1) + "){"
					//+ "visibility: hidden;"	
				//+ "}"
				+ ".grid-overlay-container {"
					+ "padding:0px " + ((options.mobileOutterGutters) - (options.mobileInnerGutters / 2)) + "px;"
					+ "left:" + options.offsetX + "px;"
				+ "}"
			+ "}";
}

function calcColumnPercents(columns){
	return (100 / columns);
}

function createReport(columns, valuesArray){
	var output = '';

	if(valuesArray){
		for(var i = 0; i <= columns; i++){
			if(valuesArray[i]){
				output = output + '<tr><td style="width: 50%;">' + (i + 1) + '</td><td>' + valuesArray[i] + ' px</td></tr>';
			}
		}
	}

	document.getElementById('report').innerHTML = output;
}


/*
	Will save the data from form fields 
	into local storage
*/
function saveCurrentSettings(tabId){
 
   var inputs = gridForm.getElementsByTagName('input');

   var settings = {};

   options.forEach(function(option){

   	if(inputs[option].type == "number" || inputs[option].type == "text")
			settings[option] = inputs[option].value;
		else if(inputs[option].type == "checkbox")
			settings[option] = inputs[option].checked || false;
   	
   })

   console.log(settings);
   chrome.storage.sync.set(settings);

   return settings;
}

gridToggle.addEventListener('click', toggleGrid);

gridForm.addEventListener('reset', function() {
    setTimeout(updateGrid); //The update needs to happen after the reset so we need setTimeout
});

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        chrome.tabs.executeScript(null, {file: 'src/calcReport.js'});

        if (request.status === 1 && gridToggle.checked === false) {
            gridToggle.checked = true;
            //Need to send a message here to get new caluclation
        } else if (request.status === 0 && gridToggle.checked === true) {
            gridToggle.checked = false;
        }        
    }
);

init();