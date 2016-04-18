/**
 * Responsible for generating the report in
 * the popup. 
 */
var reportController = (function(){

	/**
	 * Listens for the event that adds the report to popup
	 */
	chrome.runtime.onMessage.addListener(function(request) {
	  if (request.method === 'resize') {
	   	var colWidth = 0;

	   	if(request.breakPoint == 'small'){
	   		colWidth = reportColWidthEquation(
	   			request.width, 
	   			request.items['mobileOutterGutters'], 
	   			request.items['mobileInnerGutters'], 
	   			request.items['smallColumns']
	   		);

	   		createReport(colWidth, request.items['smallColumns'], request.items['mobileInnerGutters']);
	   	}else{
	   		if(request.width < request.items['largeWidth']){
	   			request.items['largeWidth'] = request.width;
	   		}

	   		colWidth = reportColWidthEquation(
	   			request.items['largeWidth'], 
	   			request.items['outterGutters'], 
	   			request.items['gutters'], 
	   			request.items['largeColumns']
	   		);


	   		createReport(colWidth, request.items['largeColumns'], request.items['gutters']);
	   	}
	  }
	});

	/**
	 * Creates the report 
	 *
	 * @param {int} columns - The numbers of columns of the grid
	 * @param {Array} valuesArray - the array of values for the table
	 */
	var createReport = function(colWidth, cols, gutter){
		var output = '';

		for(var i = 1; i <= cols; i++){


			var num = numberFormat(((gutter * (i - 1)) + (colWidth * i)), 2)
			output = output + '<tr><td style="width: 50%;">' + i + '</td><td>' + num + 'px</td></tr>';
		}

		document.getElementById('report').innerHTML = output;
	}


	var reportColWidthEquation = function(width, outerGutter, innerGutter, cols){
		return (((width - (outerGutter * 2)) - (innerGutter * (cols - 1))) / cols)
	}

	/**
	 * Sends a message to get the column pixel widths
	 *
	 * @param {int} tabId - The id of the current tab
	 */
	var calculateReport = function(tabId){
		console.log('Fell into calculate');
		chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
			chrome.tabs.sendMessage(tabs[0].id, {method: "fireCalc", tabId: tabs[0].id});
		});
	}

	function numberFormat(val, decimalPlaces) {
		var multiplier = Math.pow(10, decimalPlaces);
   	return (Math.round(val * multiplier) / multiplier).toFixed(decimalPlaces);
	}


	/**
	 * Publicly accessible methods 
	 */
	return {
		createReport:createReport,
		calculateReport:calculateReport
	}
})();