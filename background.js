var extensionIcons = ["icon32_on.png", "icon32_off.png"];
var currentIconIndex = 1;
/**
 *This method is called to activate chrome plugin 
 */
var getCurrentIcon = function(toggle) {
    currentIconIndex = toggle && (currentIconIndex = !currentIconIndex) ? 1 : 0;
    return extensionIcons[currentIconIndex];    
};

chrome.browserAction.setIcon({path: extensionIcons[1]});

chrome.browserAction.onClicked.addListener(function(tab) {
    chrome.browserAction.setIcon({path: getCurrentIcon(true)});
});

chrome.browserAction.setPopup({popup : "popup.html"});

