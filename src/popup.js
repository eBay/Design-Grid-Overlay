var chrome = chrome || {};
var gridForm = document.getElementById('gridsettings');
var gridToggle = document.getElementById('gridToggle');

var options = ["largeWidth", 
               "largeColumns", 
					"smallColumns", 
					"viewports", 
					"smallWidth", 
					"gutters", 
					"outterGutters", 
					"mobileInnerGutters",
					"mobileOutterGutters", 
					"offsetX",
					"color"];

var popup = (function(){

	var currentChromeTab = '';

	//When the popup gets opene
	window.addEventListener('load', function() {
	    
	    //Tell me stuff about my tab
	    chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
	      console.log(tabs[0]); //TODO: Use this to save the state of the grid for the current tab

	      currentChromeTab = tabs[0];
	      tabController.setCurrentTabState();
	    });
	    
	    //Trigger a message that will tell me if the grid is on or off
	    chrome.tabs.executeScript(null, {file: 'src/executedScripts/gridStatus.js'});
	});

	chrome.runtime.onMessage.addListener(
	    function(request, sender, sendResponse) {
	        reportController.calculateReport();

	        if (request.status === 1 && gridToggle.checked === false) {
	            gridToggle.checked = true;
	            //Need to send a message here to get new caluclation
	        } else if (request.status === 0 && gridToggle.checked === true) {
	            gridToggle.checked = false;
	        }        
	    }
	);

	gridToggle.addEventListener('click', function(){
		gridController.toggleGrid(save());
	});

	gridForm.addEventListener('reset', function() {
		tabController.saveTabStates();
	   setTimeout(gridController.updateGrid(save())); 
	});

	var init = function(){
		var inputs = gridForm.getElementsByTagName('input');
	   console.log(inputs);
	   var len = inputs.length;
	   while (len--) {
        inputs[len].addEventListener("change", function(event) {
            if (event.target.id !== 'gridToggle') gridController.updateGrid(save());
        });
	   }

	   load(inputs);
	}

	var load = function(inputs){
		console.log('Fell');
		chrome.storage.sync.get(options, function(items) {
				console.log(items);

				options.forEach(function(option){

					if(inputs[option].type == "number" || inputs[option].type == "text")
						inputs[option].value = items[option] || inputs[option].value
					else if(inputs[option].type == "checkbox")
						inputs[option].checked = items[option]

				})
		});
	}

	var save = function(){
		var inputs = gridForm.getElementsByTagName('input');

	   var settings = {};

	   options.forEach(function(option){

	   	if(inputs[option].type == "number" || inputs[option].type == "text")
				settings[option] = inputs[option].value;
			else if(inputs[option].type == "checkbox")
				settings[option] = inputs[option].checked || false;
	   	
	   })

	   console.log(settings);
	   chrome.storage.sync.set(settings);

	   return settings;
	}



	return {
		init:init
	}

})();

popup.init();

