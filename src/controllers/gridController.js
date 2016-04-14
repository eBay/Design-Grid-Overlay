var gridController = (function(){

	/**
	 * Checks weather view port units are selected.
	 * If view ports units are selected VW units are returned.
	 * If not percent is return.
	 *
	 * This is used if the user want to ignore the scrollbar
	 * when dealing with the width of the page 
	 */
	var checkIfViewPortIsSelected = function(viewPortSelected){
		if(viewPortSelected){
			return 'vw';
		}else{
			return '%';
		}
	}

	/**
	 * Creates the CSS class that sets the width of the 
	 * container of the grid-lines
	 *
	 * @param {string} units - The type of units (VW or %) that the container
	 * will be set to. 
	 */
	var createGridLinesCSS = function(units){	
		return ".cb-grid-lines {"
				+ "width: 100" + units 
			+ "}";

	}

	/**
	 * Creates the CSS that styles the grid columns 
	 * on a large screen 
	 *	
	 * @param {object} options - The setting from whats stored in local storage.
	 */
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

	/**
	 * Creates the CSS for the small container.
	 * When the width is smaller than or equal to
	 *	the value specified in the options argument. 
	 *
	 * @param {object} options - The setting from whats stored in local storage.
	 */
   var createSmallContainer = function(options){
	
		return "@media (max-width:" + options.smallWidth + "px) {" 
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

	/**
	 * Calculates the percents of each column.
	 *
	 * @param {int} columns - The number of columns in the grid
	 */
	var calcColumnPercents = function(columns){
		return (100 / columns);
	}

	/**
	 * Aggregates the CSS and sends a message to 
	 * have it inserted onto the page
	 *
	 * @param {object} options - The setting from whats stored in local storage.		
	 */
	var executeCSS = function(options){

		chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
			var unitWidth = checkIfViewPortIsSelected(options['viewports']);

			chrome.tabs.sendMessage(tabs[0].id, { method: "addCSS",
			 	css: createGridLinesCSS(unitWidth) + createGridContainer(options) + createSmallContainer(options)
			});

		});

	}

	/**
	 * Sends a message to tell whether the grid is on or off 
	 *
	 * @param {int} gridStatus - The status of the grid either 0 or 1 (off or on)
	 */
	var respond =  function(gridStatus) {
    chrome.runtime.sendMessage({status: gridStatus});
	}

	/**
	 * Sends a message to have the grid HTML added to the page. 
	 * First a status saying the grid is on is sent. After a  
	 *	message is sent to the grid content script that tell it
	 * to create the grid HTML
	 */
	var createGrid = function(){
		respond(1);
		 chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
	      chrome.tabs.sendMessage(tabs[0].id, {method: "create", tabId: tabs[0].id});
	    });
	}

	/**
	 * Used to turn the grid on and off when updating the 
	 * settings in the popup.
	 *
	 *	@param {object} options - The setting from whats stored in local storage.
	 */
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

	/**
	 * Used to turn the grid on and off when updating the 
	 * settings in the popup.
	 *
	 *	@param {object} options - The setting from whats stored in local storage.
	 */
	var updateGrid = function(options){
	   toggleGrid(options);
	}

	/**
	 * Removes the grid from the current tab.
	 * Fires two events, destroy and removeCSS. 
	 *	The message destroy removes the grid HTML.
	 * The message removeCSS removes the old css for the grid 
	 */
	var removeGrid = function(){
		respond(0);
		chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
	      chrome.tabs.sendMessage(tabs[0].id, {method: "destroy", tabId: tabs[0].id});
	      chrome.tabs.sendMessage(tabs[0].id, {method: "removeCSS", tabId: tabs[0].id});
	   });
	}


	/**
	 * Returns publicly accessible methods
	 */
	return {
		toggleGrid:toggleGrid,
		updateGrid:updateGrid,
		removeGrid:removeGrid
	}

})();