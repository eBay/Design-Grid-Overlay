var chrome = chrome || {};

var gridIsDisplayed = false;

function init(){

	/*
		Will load in saved content already in local storage
	*/
	chrome.storage.sync.get(["largeWidth", "largeColumns", 
									 "smallColumns", "vwUnits", 
									 "smallWidth", "gutters"], 
		function(items){

			var largeWidth = items.largeWidth || 960;
			var smallWidth = items.smallWidth || 768;
			var largeColumns = items.largeColumns || 16;
			var smallColumns = items.smallColumns || 8;
			var gutters = items.gutters || 16;

			if(items.vwUnits){
				document.getElementById('viewports').checked = true;
			}

			document.getElementById("largeWidth").value = largeWidth;
			document.getElementById("smallWidth").value = smallWidth;
			document.getElementById("largeColumns").value = largeColumns;
			document.getElementById("smallColumns").value = smallColumns;
			document.getElementById('gutters').value = gutters;
	});



	chrome.runtime.onMessage.addListener(function requested(request) {
		window.alert('resize from popup');
  			if (request.method === 'resize') {
   			window.alert('resize from popup');
  			}
	});
}


function onResizeOfCurrWindow(){
	window.alert('Called');
	chrome.app.window.onBoundsChanged.addListener(function(){
		window.alert('Resizd');
	})
}


function addGrid(){
    
    var settings = saveCurrentSettings();

    
    executeCSS(settings);

	//Need to fix this 
	chrome.tabs.insertCSS({ 
    	file: 'grid.css'
    }, function() {
        executeJS();
    }); 
}


function upDateGrid(){
	
	var settings = saveCurrentSettings();

   removeGrid();
   executeCSS(settings);

   addGrid();
}


function removeGrid(){
	executeJS();
}


function executeCSS(options){
	var columns = document.getElementById("largeColumns").value;
	var lgWidth = document.getElementById("largeWidth").value;
	var smWidth = document.getElementById("smallWidth").value;
	var gutters = document.getElementById('gutters').value;
	
    chrome.windows.getCurrent(function(currWindow){

    	var vwCalc = ((options.largeWidth / currWindow.width) * 100);
    	var units = checkVWBox(options, vwCalc);

		if(document.getElementById('viewports').checked){

			chrome.tabs.insertCSS(null, {
				code:
					".cb-grid-lines {"
  						+ "width:100vw" 
					+ "}"
			})
		}else{
			chrome.tabs.insertCSS(null, {
				code:
					".cb-grid-lines {"
  						+ "width:100%" 
					+ "}"
			})
		}


		chrome.tabs.insertCSS(null, {
        code:
	        ".grid-overlay-container {"
			  	+ "max-width:" + options.largeWidth + "px;"
			+ "}"

			+ ".grid-overlay-col {"
				+ "width: calc(" + (100 / options.largeColumns) + "% - " + gutters + "px);"
			+ "}"
			

			+ "@media (max-width:" + smWidth + "px) {" //This will be small -1 
				+ ".grid-overlay-col {"
				 	+ "width: calc(" + (100 / options.smallColumns) + "% - " + gutters + "px);"
				+ "}"
			+ "}"

    	});

	})

}

function executeJS(){
	chrome.tabs.executeScript(null, {file: 'grid.js'}); 
}

/*
	Need to fix, vw doesn't always work correctly
*/
function checkVWBox(options, vwCalc){
	/*if(document.getElementById('viewports').checked){
		//console.log(vwCalc / options.columns);
		return "width:"+ (vwCalc / options.columns) + "vw;"
	}else{
		return "width: calc(" + (100 / options.columns) + "% - 16px);"
	}*/


	return "width: calc(" + (100 / options.columns) + "% - 16px);"
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

   var options = {
      largeWidth: largeWidth,
      smallWidth: smallWidth,
      largeColumns: largeColumns,
      smallColumns: smallColumns,
      vwUnits: vwChecked,
      gutters: gutters
   };

   chrome.storage.sync.set(options);

   return options;
}


document.getElementById('addGrid').addEventListener('click', addGrid);
document.getElementById('removegrid').addEventListener('click', removeGrid);
document.getElementById('updategrid').addEventListener('click', upDateGrid);


init();
//onResizeOfCurrWindow();
