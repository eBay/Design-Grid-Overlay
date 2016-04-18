var chrome = chrome || {};
var gridForm = document.getElementById('gridsettings');
var gridToggle = document.getElementById('gridToggle');


/**
 * Set the click event for the tabs 
 */
var setTabAction = function(tabOuter, tabInner, contentId) {
	$('#' + tabInner).bind("click", function (event) {
	   $('.' + tabOuter + ' div[aria-selected=true]').attr("aria-selected","false");
	   this.setAttribute("aria-selected", "true");
	   $('.' + tabOuter).find("[aria-hidden=false]").attr("aria-hidden","true");
	   $('#' + contentId).eq($(this).attr('tabindex')).attr("aria-hidden", "false");
	});
};


setTabAction('tabs', 'tab1', 'panel1');
setTabAction('tabs', 'tab2', 'panel2');
setTabAction('tabs', 'tab3', 'panel3');


/**
 * Allows a user to click the github icon and 
 * be taken directly to the eBaay grid issue page
 */
var git = document.getElementById('github-icon');
git.addEventListener('click', function(e){
  if(this.href!==undefined){
    chrome.tabs.create({url:this.href})
  }
})


/**
 * The list of options by there id 
 * that exist in the popup menu.
 */
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

/**
 * Will stop the advanced form from submitting 
 */
document.getElementById("advancedForm").onsubmit = function () {
    return false;
};



/**
 * Heartbeat pattern to determine whether content script is already inject
 * If not it will be injected.
 */
chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {greeting: "hello"}, function(response) {

        if (response) {
            console.log("Already there");
            reportController.calculateReport();
        }
        else {
            console.log("Not there, inject contentscript");
            chrome.tabs.executeScript(tabs[0].id, {file: "src/executedScripts/grid.js"});
            chrome.tabs.executeScript(tabs[0].id, {file: "src/executedScripts/calcReport.js"}, function(){
            	reportController.calculateReport();
            });
        }

        popup.init();
    });
});

var popup = (function(){


	var currentChromeTab = '';


	/**
	 * Called when the popup is load. A call
	 * to save the tab state and check the grid status is
	 * made. 
	 */
	window.addEventListener('load', function() {


	   chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {

	      currentChromeTab = tabs[0].id;

	      document.getElementById('tabContainer').addEventListener('click', function(){
	      	tabController.saveTabStates(tabs[0].id)
	      });

	      tabController.getCurrentTabState(tabs[0].id);
	   });

	   chrome.tabs.executeScript(null, {file: 'src/executedScripts/gridStatus.js'});
	});

	/**
	 * Event that changes the toggle based on if 
	 * the grid is active or not 
	 */	
	chrome.runtime.onMessage.addListener(
	    function(request, sender, sendResponse) {
    		if(request.status){
    			console.log('Fell into status');
    			reportController.calculateReport(currentChromeTab);

    			if (request.status === 1 && gridToggle.checked === false) {
	            gridToggle.checked = true;
		      } else if (request.status === 0 && gridToggle.checked === true) {
		         gridToggle.checked = false;
		      }
    		}
	    }
	);

	/**
	 * A click event listen that will change the values 
	 * off the grid based on the popup values.
	 */
	gridToggle.addEventListener('click', function(){
		gridController.updateGrid(save());
		reportController.calculateReport(currentChromeTab);
	});

	/**
	 * Adds an event to the reset button
	 * in order to reset all the values on 
	 * the grid to the default values in the 
	 * popup window. 
	 */
	gridForm.addEventListener('reset', function() {
		chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
			var settings = save();
			gridController.updateGrid(settings);
			tabController.saveTabStates(tabs[0].id);
			reportController.calculateReport(tabs[0].id);
		});
	});

	/**
	 * Used to stop a user from incrementing the  
	 * number field to fast. This stops the event from
	 * firing to fast and stops multiple grids 
	 * from appearing stacked on the page
	 */
	var throttle = function(fn, threshhold, scope) {
		threshhold || (threshhold = 250);
		var last,
		   deferTimer;
		return function () {
		 var context = scope || this;

		 var now = +new Date,
		     args = arguments;
		 if (last && now < last + threshhold) {
		   // hold on to it
		   clearTimeout(deferTimer);
		   deferTimer = setTimeout(function () {
		     last = now;
		     fn.apply(context, args);
		   }, threshhold);
		 } else {
		   last = now;
		   fn.apply(context, args);
		 }
		};
	}

	/**
	 * Used to initialize the state of the popup window.
	 * Saves the current tab state, generates the grid,
	 * and calculates the report.  
	 */
	var init = function(){
		var inputs = gridForm.getElementsByTagName('input');
	   var len = inputs.length;
	   while (len--) {
	   	inputs[len].addEventListener("change", throttle(function (event) {
			   if (event.target.id !== 'gridToggle'){
			   	tabController.saveTabStates(currentChromeTab);
			   	reportController.calculateReport();
            	gridController.updateGrid(save());
            }
			}, 1000));
	   }
	   save();
	   load(inputs);
	}

	/**
	 * Goes into local storage and pulls out
	 * settings that are saved in the current 
	 * tab. If no settings are saved, the default 
	 * value is used that is specified in the html
	 * for the popup. 
	 */
	var load = function(inputs){
		chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
			chrome.storage.sync.get(tabs[0].id.toString(), function(items) {
			   items = items[tabs[0].id.toString()];

				options.forEach(function(option){
					if(inputs[option].type == "number" || inputs[option].type == "text"){
						if(items && items[option]){
							if(items[option].length > 0){
								inputs[option].value = items[option];
							}
						}
					}
					else if(inputs[option].type == "checkbox"){
						inputs[option].checked = items ? items[option] : inputs[option].checked
					}
				})
			});

		});
	}

	/**
	 * Grabs the value from each input field and
	 * saves it into local storage with the key
	 * being the current tab id.  
	 */
	var save = function(){
		var inputs = gridForm.getElementsByTagName('input');

	   var settings = {};

	   options.forEach(function(option){
	   	if(inputs[option].type == "number" || inputs[option].type == "text")
				settings[option] = inputs[option].value;
			else if(inputs[option].type == "checkbox")
				settings[option] = inputs[option].checked || false;
	   })

	   var data = {};
	   data[currentChromeTab] = settings;
	   chrome.storage.sync.set(data);

	   return settings;
	}

	/**
	 * Return the publicly accessible methods  
	 */
	return {
		init:init
	}

})();
