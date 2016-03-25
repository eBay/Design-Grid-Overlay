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

	var createGridContainer = function(options){
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


   var createSmallContainer = function(options){
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

	var calcColumnPercents = function(columns){
		return (100 / columns);
	}

	var executeCSS = function(options){

		chrome.windows.getCurrent(function(currWindow){
			var unitWidth = checkIfViewPortIsSelected(options['viewports']);

			console.log(unitWidth);

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

	var respond =  function(gridStatus) {
    chrome.runtime.sendMessage({status: gridStatus}, function(response) {
      //console.log(response);
    });
	}


	var createGrid = function(){
		respond(1);
		 chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
	      chrome.tabs.sendMessage(tabs[0].id, {method: "create", tabId: tabs[0].id}, function(response) {
            console.log('Fired grid create');
        	});
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

	/**
	 * Unlike grid.js, this won't send a message with a status update
	 */
	var removeGrid = function(){
		respond(0);
		chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
	      chrome.tabs.sendMessage(tabs[0].id, {method: "destroy", tabId: tabs[0].id}, function(response) {
            console.log('Fired grid destroy');
        	});
	   });
	}

	return {
		toggleGrid:toggleGrid,
		updateGrid:updateGrid,
		removeGrid:removeGrid
	}

})();