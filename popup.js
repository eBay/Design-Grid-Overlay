var chrome = chrome || {};

var gridIsDisplayed = false;

function addGrid(){
	if(!gridIsDisplayed){
		chrome.tabs.insertCSS({ 
        	file: 'grid.css'
	    }, function() {
	    	var columns = document.getElementById("columns").value;
			var width = document.getElementById("width").value;

			localStorage.setItem("width", width);
	    	localStorage.setItem("columns", columns);

		    var options = {
		    	width: width
		    }

	        executeJS();
	        executeCSS(options);

	        gridIsDisplayed = true;
	    }); 
	}
}


function upDateGrid(){

	if(gridIsDisplayed){
		var columns = document.getElementById("columns").value;
		var width = document.getElementById("width").value;
	    
		localStorage.setItem("width", width);
	    localStorage.setItem("columns", columns);

	    var options = {
	    	width: width
	    }

	    removeGrid();
	    executeCSS(options);

	    addGrid();
	}
}


function removeGrid(){
	if(gridIsDisplayed){
		executeJS();
		gridIsDisplayed = false;
	}
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
