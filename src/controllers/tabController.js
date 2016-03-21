var tabController = (function(){

	document.getElementById('tabContainer').addEventListener('click', saveTabStates);

	function saveTabStates(){
		setTimeout(function(){
			var tabs = document.querySelector("div[aria-hidden='false']");
			var tabLabel = document.querySelector("div[aria-selected='true']");
			console.log(tabs.id);
			console.log(tabLabel.id);
			chrome.storage.sync.set({'currentTab' : tabs.id, 'currentTabLabel' : tabLabel.id});
		}, 0);
	}


	function setCurrentTabState(){
		chrome.storage.sync.get(['currentTab', 'currentTabLabel'], function(items){
			console.log(items);

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

		});
	}

	return {
		saveTabStates: saveTabStates,
		setCurrentTabState: setCurrentTabState
	}

})();