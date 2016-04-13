var chrome = chrome || {};
var gridForm = document.getElementById('gridsettings');
var gridToggle = document.getElementById('gridToggle');

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

var git = document.getElementById('github-icon'); 
git.addEventListener('click', function(e){
  if(this.href!==undefined){
    chrome.tabs.create({url:this.href})
  }
})

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

document.getElementById("advancedForm").onsubmit = function () {
    return false;
};

//Heartbeat pattern to determine whether content script is already inject
//If not it will be injected.
chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {greeting: "hello"}, function(response) {
        if (response) {
            console.log("Already there");
        }
        else {
            console.log("Not there, inject contentscript");
            chrome.tabs.executeScript(tabs[0].id, {file: "src/executedScripts/grid.js"});
            chrome.tabs.executeScript(tabs[0].id, {file: "src/executedScripts/calcReport.js"});
        }
    });
});

var popup = (function(){


	var currentChromeTab = '';

	window.addEventListener('load', function() {
	    
	   chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
	  
	      currentChromeTab = tabs[0].id;

	      document.getElementById('tabContainer').addEventListener('click', function(){
	      	tabController.saveTabStates(tabs[0].id)
	      });
	      
	      tabController.getCurrentTabState(tabs[0].id);
	   });
	    
	   //Trigger a message that will tell me if the grid is on or off
	   chrome.tabs.executeScript(null, {file: 'src/executedScripts/gridStatus.js'});
	});

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

	gridToggle.addEventListener('click', function(){
		gridController.updateGrid(save());
		reportController.calculateReport(currentChromeTab);
	});

	gridForm.addEventListener('reset', function() {
		chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
			var settings = save();
			gridController.updateGrid(settings);
			tabController.saveTabStates(tabs[0].id);
			reportController.calculateReport(tabs[0].id);
		});
	});

	
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

	var init = function(){
		var inputs = gridForm.getElementsByTagName('input');
	   var len = inputs.length;
	   while (len--) {
	   	console.log(inputs[len]);
	   	inputs[len].addEventListener("change", throttle(function (event) {
			   if (event.target.id !== 'gridToggle'){
			   	tabController.saveTabStates(currentChromeTab); 
			   	reportController.calculateReport();
            	gridController.updateGrid(save());
            }
			}, 1000));
	   }

	   load(inputs);
	}

	//Something is broken here. Maybe check for empty strings? 
	var load = function(inputs){
		chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
			chrome.storage.sync.get(tabs[0].id.toString(), function(items) {
			   items = items[tabs[0].id.toString()];

				options.forEach(function(option){
					if(inputs[option].type == "number" || inputs[option].type == "text"){
						if(items){
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

	
	return {
		init:init
	}

})();

popup.init();

