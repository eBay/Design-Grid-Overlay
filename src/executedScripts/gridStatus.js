var chrome = chrome || {};

(function () {
    /**
     * Used to check the status of the grid.
     * Whether it is on or off
     */
    if (document.getElementsByClassName('cb-grid-lines').length) {
        respond(1);
    } else {
        respond(0);
    }

    function respond(gridStatus) {
        chrome.runtime.sendMessage({status: gridStatus});
    }

})();
