var gridController = (function(){

	var checkIfViewPortIsSelected = function(viewPortSelected){
		if(viewPortSelected){
			return 'vw';
		}else{
			return '%';
		}
	}

	var createGridLinesCSS = function(units){	
		return ".cb-grid-lines {"
				+ "width: 100" + units 
			+ "}";

	}

	var calculateOutsideGutter = function(outter, inner){
		var outsideGutter = (outter - (inner / 2));

		return outsideGutter >= 0 ? outsideGutter : 0;
	}

		
	var createGridContainer = function(options){
	
		return  ".grid-overlay-container {"
			  	+ "max-width:" + options.largeWidth + "px;"
			  	+ "padding:0px " + options.outterGutters + "px;"
			  	+ "left:" + options.offsetX + "px;"
			+ "}"
			+ ".grid-overlay-col {"
				+ "width:" + calcColumnPercents(options.largeColumns) + "%;"
				+ "margin: 0 " +  (options.gutters / 2) + "px;"
				+ "background: " +  options.color + ";"
			+ "}"
			+ ".grid-overlay-col:first-child {"
    			+ "margin-left:0px;"
			+ "}"
			+ ".grid-overlay-col:last-child {"
    			+ "margin-right:0px;"
			+ "}"
	}


   var createSmallContainer = function(options){
	
		return "@media (max-width:" + (options.smallWidth - 1) + "px) {" 
				+ ".grid-overlay-col {"
				 	+ "width:" + calcColumnPercents(options.smallColumns) + "%;"
				 	+ "margin: 0 " +  (options.mobileInnerGutters / 2) + "px;"
				 	+ "background: " +  options.color + ";"
				+ "}"
				+ ".grid-overlay-container {"
					+ "padding:0px " + options.mobileOutterGutters + "px;"
					+ "left:" + options.offsetX + "px;"
				+ "}"
				+ ".grid-overlay-col:first-child {"
					+ "margin-left:0px;"
				+ "}"
				+ ".grid-overlay-col:nth-child(" + options.smallColumns + ") {"
					+ "margin-right:0px;"
				+ "}"
				+ ".grid-overlay-col:nth-child(n+" + (parseInt(options.smallColumns) + 1) + ") {"
					+ "display:none;"
				+ "}"
			+ "}" 
	}

	var calcColumnPercents = function(columns){
		return (100 / columns);
	}

	var executeCSS = function(options){

		chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
			var unitWidth = checkIfViewPortIsSelected(options['viewports']);

			chrome.tabs.sendMessage(tabs[0].id, { method: "addCSS",
			 	css: createGridLinesCSS(unitWidth) + createGridContainer(options) + createSmallContainer(options)
			});

		});

	}

	var respond =  function(gridStatus) {
    chrome.runtime.sendMessage({status: gridStatus});
	}


	var createGrid = function(){
		respond(1);
		 chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
	      chrome.tabs.sendMessage(tabs[0].id, {method: "create", tabId: tabs[0].id});
	    });
	}

	var toggleGrid = function(options) {
		var gridToggle = document.getElementById('gridToggle');

		if(gridToggle.checked){
			removeGrid();
			createGrid();
		}else{
			removeGrid();
		}
	
	   executeCSS(options);
	}

	var updateGrid = function(options){
	   toggleGrid(options);
	}

	
	var removeGrid = function(){
		respond(0);
		chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
	      chrome.tabs.sendMessage(tabs[0].id, {method: "destroy", tabId: tabs[0].id});
	      chrome.tabs.sendMessage(tabs[0].id, {method: "removeCSS", tabId: tabs[0].id});
	   });
	}

	return {
		toggleGrid:toggleGrid,
		updateGrid:updateGrid,
		removeGrid:removeGrid
	}

})();