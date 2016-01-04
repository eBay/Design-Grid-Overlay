var chrome = chrome || {};
var gridForm = document.getElementById('gridsettings');
var gridToggle = document.getElementById('gridToggle');

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
	//TODO: Make this scale better; lot of repetition going on here but no looping?
	chrome.storage.sync.get(["largeWidth", "largeColumns", 
									 "smallColumns", "vwUnits", 
									 "smallWidth", "gutters", 
									 "outterGutters", "mobileInnerGutters",
									 "mobileOutterGutters", "offsetX"], 
		function(items) {

			var largeWidth = items.largeWidth || 960;
			var smallWidth = items.smallWidth || 768;
			var largeColumns = items.largeColumns || 16;
			var smallColumns = items.smallColumns || 8;
			var gutters = items.gutters || 16;
			var outterGutters = items.outterGutters || 16;
			var mobileInnerGutters = items.mobileInnerGutters || 16;
			var mobileOutterGutters = items.mobileOutterGutters || 8;
			var offsetX = items.offsetX || 0;

			if (items.vwUnits) {
				document.getElementById('viewports').checked = true;
			}

			document.getElementById('largeWidth').value = largeWidth;
			document.getElementById('smallWidth').value = smallWidth;
			document.getElementById('largeColumns').value = largeColumns;
			document.getElementById('smallColumns').value = smallColumns;
			document.getElementById('gutters').value = gutters;
			document.getElementById('outterGutters').value = outterGutters;
			document.getElementById('mobileInnerGutters').value = mobileInnerGutters;
			document.getElementById('mobileOutterGutters').value = mobileOutterGutters;
			document.getElementById('offsetX').value = offsetX;
	});
}

function toggleGrid() {
    var settings = saveCurrentSettings();

    executeCSS(settings);

    chrome.tabs.insertCSS({ 
        file: 'src/grid.css' //FIXME: http://stackoverflow.com/questions/18533820/how-do-i-remove-an-injected-css-file
    }, function() {
        chrome.tabs.executeScript(null, {file: 'src/grid.js'});
    });
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

		var unitWidth = checkIfViewPortIsSelected(document.getElementById('viewports').checked);

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
	console.log(((options.mobileOutterGutters * 2) - (options.mobileInnerGutters)));
	return "@media (max-width:" + (options.smallWidth - 1) + "px) {" 
				+ ".grid-overlay-col {"
				 	+ "width: calc(" + calcColumnPercents(options.smallColumns) + "% - " + options.mobileInnerGutters + "px);"
				 	+ "margin: 0 " +  (options.mobileInnerGutters / 2) + "px;"
				+ "}"
				+ ".grid-overlay-container {"
					+ "padding:0px " + ((options.mobileOutterGutters) - (options.mobileInnerGutters / 2)) + "px;"
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
	var largeColumns = document.getElementById("largeColumns").value;
	var smallColumns = document.getElementById("smallColumns").value;
   var largeWidth = document.getElementById("largeWidth").value;
   var vwChecked = document.getElementById('viewports').checked;
   var smallWidth = document.getElementById('smallWidth').value;
   var gutters = document.getElementById('gutters').value;
   var outterGutters = document.getElementById('outterGutters').value;
   var mobileInnerGutters = document.getElementById('mobileInnerGutters').value;
   var mobileOutterGutters = document.getElementById('mobileOutterGutters').value;
   var offsetX = document.getElementById('offsetX').value;

   var options = {
      largeWidth: largeWidth,
      smallWidth: smallWidth,
      largeColumns: largeColumns,
      smallColumns: smallColumns,
      vwUnits: vwChecked,
      gutters: gutters,
      outterGutters: outterGutters,
      mobileInnerGutters: mobileInnerGutters,
      mobileOutterGutters: mobileOutterGutters,
      offsetX: offsetX
   };

   chrome.storage.sync.set(options);

   return options;
}

gridToggle.addEventListener('click', toggleGrid);

//document.getElementById('updategrid').addEventListener('click', updateGrid);
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