/**
 * Listener that calls the fireCalc method when need 
 * to generate the values for the report.
 */
chrome.runtime.onMessage.addListener(
 function(request, sender, sendResponse) {
 	if(request.method == "fireCalc"){
		//console.log("Updating report values");
 		fireCalc(request.tabId);
 	}
 });


/**
 * Inserts the CSS styles for the size overlay into
 * the head of the document. This is done by
 * adding a link tag with an href to the report.css file.
 * This code also ensures that the css styling for the
 * size overlay doesn't already exist
 */
function insertReportCSS(){
	if(!document.getElementById('base-report-styles')){
		var css = document.createElement('link');
		css.id = "base-report-styles";
		css.rel = "stylesheet";
		css.type = "text/css";
		css.href = chrome.extension.getURL('src/css/report.css');
		document.head.appendChild(css);
	}
}

/**
 * Event handler that adds the report size overlay styles to the page in response
 * to the chrome runtime message with method "addReportCSS"
 */
chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse){
		if(request.method === "addReportCSS"){
			insertReportCSS();
		}
	});

/**
 * Event handler that enables the report overlay in response
 * to the chrome runtime message with method "createReportOverlay"
 * and a given query selector string
 */
chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse) {
		if(request.method === "createReportOverlay"){
			var selector = request.reportOverlaySelector || "grid__cell";
			createReportOverlay(selector);

		}
	});

/**
 * Event handler that disables the report overlay in response
 * to the chrome runtime message with method "removeReportOverlay"
 */
chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse) {
		if(request.method == "removeReportOverlay"){
			removeReportOverlay();
		}
	});

/**
 * A set of configurations for our Size Overlay used by the various size overlay methods
 *
 */
var _designGridSizeOverlayConfig = {
	enabled: false,
	selector: undefined,
	sizeOverlaySelector: undefined,
	overlayedElements: undefined,
    generatedOverlayArray: [], //Array of actual elements used to display sizes - one for each overlayedElement
	bodyMutationObserver: new MutationObserver(domChangeUpdate),
	bodyMutObsConfig : {
		attributes: false, // Ignore attribute changes
		childList: true, // Listen for direct child node list changes
		characterData: false, // Ignore character data changes
		subtree: true // Listen recursively on entire subtree
	}
};

/**
 * Method that updates the sizes in each overlay that is present on this page
 */
function updateOverlayValues() {
	if(_designGridSizeOverlayConfig.enabled) {
        for (var i = 0; i < _designGridSizeOverlayConfig.overlayedElements.length; i++) {
        	var elementWidth = Math.round(_designGridSizeOverlayConfig.overlayedElements[i].getBoundingClientRect().width);
        	_designGridSizeOverlayConfig.generatedOverlayArray[i].firstChild.innerHTML = elementWidth + "px";
        }

	}

}

/**
 * Method that is fired when any element in the body is added, deleted
 *
 * @param mutations - unused for now, but contains a list of DOM MutationRecord
 * (https://developer.mozilla.org/en-US/docs/Web/API/MutationRecord)
 */
function domChangeUpdate(mutations) {

	var savedSelector = _designGridSizeOverlayConfig.selector;
	removeReportOverlay();
	createReportOverlay(savedSelector);

}


/**
 * Method that creates the size overlays for all
 * elements captured by the given selector input,
 * and creates both the window resize and
 * DOMMutation event listeners that update the
 * overlays when the window resizes or
 * the contents of the DOM change
 *
 * @param selector - Document query selector that specifies
 * the elements which will have a size overlay
 */
function createReportOverlay(selector) {

	// This function may be activated directly by the chrome extension as well as from in-page code, so we
	// always need to verify the current state of the overlay according this page's stored values
	if(_designGridSizeOverlayConfig.enabled) {
		removeReportOverlay();
	}

	_designGridSizeOverlayConfig.enabled = true;
	_designGridSizeOverlayConfig.selector = selector;
	_designGridSizeOverlayConfig.overlayedElements = document.querySelectorAll(selector) || [];
    _designGridSizeOverlayConfig.generatedOverlayArray = [];

	for (var i = 0; i < _designGridSizeOverlayConfig.overlayedElements.length; i++) {
        

        var labelElement = document.createElement('div');
        labelElement.className = "grid-report-size-overlay";
        var elementWidth = Math.round(_designGridSizeOverlayConfig.overlayedElements[i].getBoundingClientRect().width);
        labelElement.innerHTML = "<div class='size-content'>" + elementWidth + "px" + "</div>";

        // Prepend it
        _designGridSizeOverlayConfig.overlayedElements[i].insertBefore(labelElement, _designGridSizeOverlayConfig.overlayedElements[i].firstChild);

        _designGridSizeOverlayConfig.generatedOverlayArray.push(labelElement);

	}
	window.addEventListener('resize', updateOverlayValues, false);

	//If the dom is changed, we want to update this overlay
	_designGridSizeOverlayConfig.bodyMutationObserver.observe(document.body, _designGridSizeOverlayConfig.bodyMutObsConfig);



}

/**
 * Method that removes the size overlays
 * and disconnects both the window resize and
 * DOMMutation event listeners
 */
function removeReportOverlay() {

	// This function may be activated directly by the chrome extension as well as from in-page code, so we
	// always need to verify the current state of the overlay according this page's stored values
	if(_designGridSizeOverlayConfig.enabled) {
		//console.log("REMOVING OVERLAY");
		_designGridSizeOverlayConfig.bodyMutationObserver.disconnect();

		for (var i = 0; i < _designGridSizeOverlayConfig.overlayedElements.length; i++) {
			_designGridSizeOverlayConfig.overlayedElements[i].removeChild(_designGridSizeOverlayConfig.generatedOverlayArray[i]);

		}

        window.removeEventListener('resize', updateOverlayValues);

		_designGridSizeOverlayConfig.selector = undefined;
		_designGridSizeOverlayConfig.overlayedElements = undefined;
        _designGridSizeOverlayConfig.generatedOverlayArray = undefined;
		_designGridSizeOverlayConfig.enabled = false;
	}


}


/**
 * Method that checks whether the width 
 * is small or large, and pass the appropriate
 * values to have the correct report generated 
 */
function fireCalc(tabId){
	chrome.storage.sync.get(tabId.toString(), function(items){
		if(getWidth() <= parseInt(items[tabId].formData.gridForm.settings["smallWidth"])){
			calculateReport('small', items[tabId].formData.gridForm.settings);
		}else{
			calculateReport('large', items[tabId].formData.gridForm.settings);
		}
	});
}

/**
 * Calculates the width of the each column 
 * and creates a report. The values are then 
 * sent to the popup via a message in order 
 * to be displayed in the report section of the popup 
 */
function calculateReport(breakPoint, items){
	chrome.runtime.sendMessage({
			method: 'updateGridReport',
			items: items,
			breakPoint: breakPoint,
			width: document.documentElement.clientWidth
		}
	);
}

/**
 * Calculates the gutter of a given column 
 */
function calculateGutter(){
	var  elements = document.getElementsByClassName('grid-overlay-col');
	var el = elements[1];
	var style = el.currentStyle || window.getComputedStyle(el);
	var margin = parseFloat(style.marginLeft) + parseFloat(style.marginRight);	

	return margin;
}

/**
 * Calculates the width of the of a given column 
 */
function getWidth() {
  if (self.innerHeight) {
    return self.innerWidth;
  }

  if (document.documentElement && document.documentElement.clientWidth) {
    return document.documentElement.clientWidth;
  }

  if (document.body) {
    return document.body.clientWidth;
  }
}

/**
 * Decimal formatter. Used to display the values in the 
 * report to a certain number of decimal places.
 */
function numberFormat(val, decimalPlaces) {

    var multiplier = Math.pow(10, decimalPlaces);
    return (Math.round(val * multiplier) / multiplier).toFixed(decimalPlaces);
}



