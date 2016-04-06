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

	//Need to do some first and last child stuff for the cases when the outer is less
	//then half of the inner	
	var createGridContainer = function(options){
		console.log(options);
		console.log((options.outterGutters + (options.gutters/2)));

		var temp = '';

		//Need to make this a bit cleaner and do it for the mobile grid as well
		if(options.outterGutters < (options.gutters / 2)){
			var newWidth = (parseInt(options.outterGutters) + parseInt(options.gutters/2));
			console.log(newWidth);

			temp = ".grid-overlay-col:first-child {"
    		+ "margin-left:" + options.outterGutters + "px;"
    		+ "width: calc(" + calcColumnPercents(options.largeColumns) + "% - " + newWidth + "px);"
			+ "}"
			+ ".grid-overlay-col:last-child {"
    		+ "margin-right:"+ options.outterGutters  + "px;"
    		+ "width: calc(" + calcColumnPercents(options.largeColumns) + "% - " + newWidth + "px);"
			+ "}";
		}else{
			temp = ".grid-overlay-col:first-child {"
    		+ "width: calc(" + calcColumnPercents(options.largeColumns) + "% - " + options.gutters + "px);"
				+ "margin: 0 " +  (options.gutters / 2) + "px;"
			+ "}"
			+ ".grid-overlay-col:last-child {"
    		+ "width: calc(" + calcColumnPercents(options.largeColumns) + "% - " + options.gutters + "px);"
				+ "margin: 0 " +  (options.gutters / 2) + "px;"
			+ "}";
		}



		return  ".grid-overlay-container {"
			  	+ "max-width:" + options.largeWidth + "px;"
			  	+ "padding:0px " + calculateOutsideGutter(options.outterGutters, options.gutters) + "px;"
			  	+ "left:" + options.offsetX + "px;"
			+ "}"
			+ ".grid-overlay-col {"
				+ "width: calc(" + calcColumnPercents(options.largeColumns) + "% - " + options.gutters + "px);"
				+ "margin: 0 " +  (options.gutters / 2) + "px;"
				+ "background: " +  options.color + ";"
			+ "}"+ temp;
	}


   var createSmallContainer = function(options){
		console.log(((options.mobileOutterGutters) - (options.mobileInnerGutters / 2)));

		console.log(options);

		var temp = '';

		//Need to clean this up a bit
		if(options.mobileOutterGutters < (options.mobileInnerGutters / 2)){


			var newWidth = (parseInt(options.mobileOutterGutters) + parseInt(options.mobileInnerGutters/2));
			console.log(newWidth);

			temp = ".grid-overlay-col:first-child {"
						+ "margin-left:" + options.mobileOutterGutters + "px;"
						+ "width: calc(" + calcColumnPercents(options.smallColumns) + "% - " + newWidth + "px);"
					+ "}"
					+ ".grid-overlay-col:nth-child(" + options.smallColumns + ") {"
						+ "margin-right:" + options.mobileOutterGutters + "px;"
						+ "width: calc(" + calcColumnPercents(options.smallColumns) + "% - " + newWidth + "px);"
					+ "}"
		}else{

			temp = ".grid-overlay-col:first-child {"
						+ "margin: 0 " +  (options.mobileInnerGutters / 2) + "px;"
						+ "width: calc(" + calcColumnPercents(options.smallColumns) + "% - " + options.mobileInnerGutters + "px);"
					+ "}"
					+ ".grid-overlay-col:nth-child(" + options.mobileOutterGutters + ") {"
						+ "margin: 0 " +  (options.mobileInnerGutters / 2) + "px;"
						+ "width: calc(" + calcColumnPercents(options.smallColumns) + "% - " + options.mobileInnerGutters + "px);"
					+ "}"
		}

	
		return "@media (max-width:" + (options.smallWidth - 1) + "px) {" 
				+ ".grid-overlay-col {"
				 	+ "width: calc(" + calcColumnPercents(options.smallColumns) + "% - " + options.mobileInnerGutters + "px);"
				 	+ "margin: 0 " +  (options.mobileInnerGutters / 2) + "px;"
				 	+ "background: " +  options.color + ";"
				+ "}"
				+ ".grid-overlay-container {"
					+ "padding:0px " + calculateOutsideGutter(options.mobileOutterGutters, options.mobileInnerGutters) + "px;"
					+ "left:" + options.offsetX + "px;"
				+ "}"
				+ temp
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

			/*chrome.tabs.insertCSS(null, {
				code: createGridLinesCSS(unitWidth)			
			});

			chrome.tabs.insertCSS(null, {
				code: createGridContainer(options)			
			});

			chrome.tabs.insertCSS(null, {
		      code: createSmallContainer(options)
		 	});*/

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
	   });
	}

	return {
		toggleGrid:toggleGrid,
		updateGrid:updateGrid,
		removeGrid:removeGrid
	}

})();