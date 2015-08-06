var chrome = chrome || {};

var gridIsDisplayed = false;

function init(){

	/*
		Will load in saved content already in local storage
	*/
	chrome.storage.sync.get(["width", "columns"], function(items){
		var width = items.width || 1280;
		var columns = items.columns || 16;
		document.getElementById("width").value = width;
		document.getElementById("columns").value = columns;
	})

	/*document.getElementById("removegrid").disabled = true;
	document.getElementById("updategrid").disabled = true;*/
}

function addGrid(){
	

	//Need to fix this 
	chrome.tabs.insertCSS({ 
    	file: 'grid.css'
    }, function() {
    	var columns = document.getElementById("columns").value;
		var width = document.getElementById("width").value;

	    var options = {
	    	width: width,
	    	columns: columns
	    }

	    chrome.storage.sync.set(options);

        executeJS();
        executeCSS(options);

        
        /*document.getElementById("addGrid").disabled = true;
        document.getElementById("removegrid").disabled = false;
        document.getElementById("updategrid").disabled = false;*/
    }); 
}


function upDateGrid(){
	
	var columns = document.getElementById("columns").value;
	var width = document.getElementById("width").value;
    
	var options = {
	    width: width,
	    columns: columns
	}

	chrome.storage.sync.set(options);

    removeGrid();
    executeCSS(options);

    addGrid();
}


function removeGrid(){
	
	executeJS();
	/*document.getElementById("addGrid").disabled = false;
    document.getElementById("removegrid").disabled = true;
    document.getElementById("updategrid").disabled = true;*/
	
}


function executeCSS(options){
	 chrome.tabs.insertCSS(null, {
        code:
        ".grid-overlay-container {"
		  + "pointer-events: none;"
		  + "box-sizing: border-box;"
		  + "height: 100%;"
		  + "margin: 0 auto;"
		  + "padding: 0 4px;"
		  + "max-width:" + options.width + "px;"
		  + "position: relative;"
		  + "background: rgba(99,99,99,0.2);"
		+ "}"
    });

}

function executeJS(){
	chrome.tabs.executeScript(null, {file: 'grid.js'}); 
}

document.getElementById('addGrid').addEventListener('click', addGrid);
document.getElementById('removegrid').addEventListener('click', removeGrid);
document.getElementById('updategrid').addEventListener('click', upDateGrid);


init();
