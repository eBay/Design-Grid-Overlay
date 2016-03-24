var tabController = (function(){

	document.getElementById('tabContainer').addEventListener('click', saveTabStates);

	function saveTabStates(tabId){
		setTimeout(function(){
				console.log(tabId);
				var tabs = document.querySelector("div[aria-hidden='false']");
				var tabLabel = document.querySelector("div[aria-selected='true']");
				var data = {};
	   		data[tabId.toString()] = {'currentTab' : tabs.id, 'currentTabLabel' : tabLabel.id};
	   		console.log(data);
				chrome.storage.sync.set(data);
		}, 0);
	}


	function setCurrentTabState(tabId){
		chrome.storage.sync.get(tabId.toString(), function(items){
			console.log(tabId);
			items = items[tabId.toString()];

			console.log(items);

			if(items["currentTab"] &&  items["currentTabLabel"]){

				var activeTab = document.getElementById(items["currentTab"]);
				var activeLabel = document.getElementById(items["currentTabLabel"]);

				var tabs = document.getElementsByClassName('tab');
				var tabLabels = document.getElementsByClassName('tabLabel');

				console.log(tabs);
				console.log(tabLabels);
				
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
		setCurrentTabState: setCurrentTabState
	}

})();