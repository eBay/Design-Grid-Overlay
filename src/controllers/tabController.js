/**
 * Responsible for saving and retrieving the current state of
 * tabs in the popup.
 */
var tabController = (function(){

	/**
	 * Saves the current tab a user is on the local storage
	 */
	function saveTabStates(){
		var tabId = '';

		chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {

			tabId = tabs[0].id.toString();

			chrome.storage.sync.get(tabs[0].id.toString(), function(items){
				var tabs = document.querySelector("div[aria-hidden='false']");
				var tabLabel = document.querySelector("div[aria-selected='true']");

				console.log(tabs);
				console.log(tabLabel);

				if(chrome.runtime.lastError || Object.keys(items).length === 0){
			      var data = {};
		   		data[tabId.toString()] = {'currentTab' : tabs.id, 'currentTabLabel' : tabLabel.id};
					chrome.storage.sync.set(data);
			   }else{
			   	items[tabId].currentTab = tabs.id;
			   	items[tabId].currentTabLabel = tabLabel.id;
			   	chrome.storage.sync.set(items);
			   }

			});
		});
	}



	/**
	 * Retrieves the users previous tab state 
	 * and sets that as the current tab
	 */
	function getCurrentTabState(tabId){
		chrome.storage.sync.get(tabId.toString(), function(items){
			items = items[tabId.toString()]; 

			if(!items)return;

			if(items["currentTab"] &&  items["currentTabLabel"]){

				var activeTab = document.getElementById(items["currentTab"]);
				var activeLabel = document.getElementById(items["currentTabLabel"]);

				var tabs = document.getElementsByClassName('tab');
				var tabLabels = document.getElementsByClassName('tabLabel');

				for(var i = 0; i < tabs.length; i++){
					tabs[i].setAttribute('aria-hidden', true);
					tabLabels[i].setAttribute('aria-selected', false);
				}
				
				activeTab.setAttribute('aria-hidden', false);
				activeLabel.setAttribute('aria-selected', true);
			}

		});
	}

	return {
		saveTabStates: saveTabStates,
		getCurrentTabState: getCurrentTabState
	}

})();