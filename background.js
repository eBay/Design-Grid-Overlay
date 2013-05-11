var toggleIcons = ["icon32_on.png", "icon32_off.png"];
var current = true;

var getCurrentIcon = function(toggle) {
  toggle && (current = !current);
  var icon = toggleIcons[+current];
  return icon;
}

chrome.browserAction.onClicked.addListener(function(tab) {



  chrome.browserAction.setIcon({path: getCurrentIcon(true)});  
  chrome.tabs.insertCSS({
    file: 'grid.css'
  });
  chrome.tabs.executeScript({
    file: 'grid.js'
  });

});
