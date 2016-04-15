console.log('Calc report updated');

/**
 * Listener that calls the fireCalc method when need 
 * to generate the values for the report.
 */
chrome.runtime.onMessage.addListener(
 function(request, sender, sendResponse) {
 	if(request.method == "fireCalc"){
 		console.log('Fired calc');
 		fireCalc(request.tabId);
 	}
 });


/**
 * Method that checks whether the width 
 * is small or large, and pass the appropriate
 * values to have the correct report generated 
 */
function fireCalc(tabId){
	chrome.storage.sync.get(tabId.toString(), function(items){
		if(getWidth() <= parseInt(items[tabId]["smallWidth"])){
			calculateReport((parseInt(items[tabId]["smallColumns"])));
		}else{
			calculateReport(parseInt(items[tabId]["largeColumns"]));
		}
	});
}

/**
 * Calculates the width of the each column 
 * and creates a report. The values are then 
 * sent to the popup via a message in order 
 * to be displayed in the report section of the popup 
 */
function calculateReport(size){
	if(!document.querySelectorAll(".grid-overlay-col").length) return;

	var rec = document.querySelectorAll(".grid-overlay-col")[1].getBoundingClientRect();
	var gutter = calculateGutter();
	var output = '';

	for(var i = 1; i <= size; i++){
		var columnSetWidth = numberFormat(((gutter * (i - 1)) + (rec.width * i)), 2);

		if(i == size){
			output = output + columnSetWidth;
		}else{
			output = output + columnSetWidth + ',';
		}
	}

	chrome.runtime.sendMessage({
			method: 'resize',
			colSizes: output
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



