if (document.getElementsByClassName('cb-grid-lines').length) {
    respond(1);
} else {
    respond(0);
}

function respond(gridStatus) {
    chrome.runtime.sendMessage({status: gridStatus}, function(response) {
      //console.log(response);
    });
}
