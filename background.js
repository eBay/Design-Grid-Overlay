chrome.browserAction.onClicked.addListener(function(tab) {
  
  chrome.tabs.insertCSS({
    file: 'grid.css'
  });
  chrome.tabs.executeScript({
    file: 'grid.js'
  });

});
