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
	   	var values = request.colSizes.split(',');
	   	createReport(values.length, values);
	  }
	});

	/**
	 * Creates the report 
	 *
	 * @param {int} columns - The numbers of columns of the grid
	 * @param {Array} valuesArray - the array of values for the table
	 */
	var createReport = function(columns, valuesArray){
		var output = '';

		if(valuesArray){
			for(var i = 0; i <= columns; i++){
				if(valuesArray[i]){
					output = output + '<tr><td style="width: 50%;">' + (i + 1) + '</td><td>' + valuesArray[i] + 'px</td></tr>';
				}
			}
		}

		document.getElementById('report').innerHTML = output;
	}

	/**
	 * Sends a message to get the column pixel widths
	 *
	 * @param {int} tabId - The id of the current tab
	 */
	var calculateReport = function(tabId){
		chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
			chrome.tabs.sendMessage(tabs[0].id, {method: "fireCalc", tabId: tabs[0].id});
		});
	}


	/**
	 * Publicly accessible methods 
	 */
	return {
		createReport:createReport,
		calculateReport:calculateReport
	}
})();