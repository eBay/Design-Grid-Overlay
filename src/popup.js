var chrome = chrome || {};
var gridForm = document.getElementById('gridsettings');
var gridToggle = document.getElementById('gridToggle');

//Wana figure out a more dynamic way to do this 
var options = ["largeWidth", "largeColumns", 
					"smallColumns", "viewports", 
					"smallWidth", "gutters", 
					"outterGutters", "mobileInnerGutters",
					"mobileOutterGutters", "offsetX"];


//When the popup gets opened
window.addEventListener('load', function() {
    
    //Tell me stuff about my tab
    chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
      console.log(tabs[0]); //TODO: Use this to save the state of the grid for the current tab
    });
    
    //Trigger a message that will tell me if the grid is on or off
    chrome.tabs.executeScript(null, {file: 'src/gridStatus.js'});
});

function init(){
	var inputs = gridForm.getElementsByTagName('input');
       
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

				if(inputs[option].type == "number")
					inputs[option].value = items[option] || inputs[option].value
				else if(inputs[option].type == "checkbox")
					inputs[option].checked = items[option]

			})
	});
}

function toggleGrid() {
   var settings = saveCurrentSettings();

   executeCSS(settings);
   chrome.tabs.executeScript(null, {file: 'src/grid.js'});
}

function updateGrid(){
    removeGrid();
    toggleGrid();
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
			+ "}";
}


function createSmallContainer(options){
	return "@media (max-width:" + (options.smallWidth - 1) + "px) {" 
				+ ".grid-overlay-col {"
				 	+ "width: calc(" + calcColumnPercents(options.smallColumns) + "% - " + options.mobileInnerGutters + "px);"
				 	+ "margin: 0 " +  (options.mobileInnerGutters / 2) + "px;"
				+ "}"
				+ ".grid-overlay-container {"
					+ "padding:0px " + ((options.mobileOutterGutters) - (options.mobileInnerGutters / 2)) + "px;"
					+ "left:" + options.offsetX + "px;"
				+ "}"
			+ "}";
}

function calcColumnPercents(columns){
	return (100 / columns);
}


/*
	Will save the data from form fields 
	into local storage
*/
function saveCurrentSettings(){
 
   var inputs = gridForm.getElementsByTagName('input');

   var settings = {};

   options.forEach(function(option){

   	if(inputs[option].type == "number")
			settings[option] = inputs[option].value;
		else if(inputs[option].type == "checkbox")
			settings[option] = inputs[option].checked || false;
   	
   })

   chrome.storage.sync.set(settings);

   return settings;
}

gridToggle.addEventListener('click', toggleGrid);

gridForm.addEventListener('reset', function() {
    setTimeout(updateGrid); //The update needs to happen after the reset so we need setTimeout
});

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        //console.log(request);
        if (request.status === 1 && gridToggle.checked === false) {
            gridToggle.checked = true;
        } else if (request.status === 0 && gridToggle.checked === true) {
            gridToggle.checked = false;
        }        
    }
);

init();