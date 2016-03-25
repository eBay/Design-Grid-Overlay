var reportController = (function(){

	chrome.runtime.onMessage.addListener(function(request) {
	  if (request.method === 'resize') {
	  		console.log(request);
	   	var values = request.colSizes.split(',');
	   	createReport(values.length, values);
	  }
	});

	var createReport = function(columns, valuesArray){
		var output = '';

		if(valuesArray){
			for(var i = 0; i <= columns; i++){
				if(valuesArray[i]){
					output = output + '<tr><td style="width: 50%;">' + (i + 1) + '</td><td>' + valuesArray[i] + 'px</td></tr>';
				}
			}
		}

		console.log(columns);

		document.getElementById('report').innerHTML = output;
	}

	var calculateReport = function(tabId){
		console.log('Fell into calculate');
		chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
			chrome.tabs.sendMessage(tabs[0].id, {method: "fireCalc", tabId: tabs[0].id}, function(response) {
            console.log('report');
        	});
		});

		//chrome.tabs.executeScript(null, {file: 'src/executedScripts/calcReport.js'});
	}


	return {
		createReport:createReport,
		calculateReport:calculateReport
	}
})();