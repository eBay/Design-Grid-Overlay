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

    if (document.getElementsByClassName('grid-overlay-container-horizontal').length) {
        respondHorizontalLines(1);
    } else {
        respondHorizontalLines(0);
    }

    function respond(gridStatus) {
        chrome.runtime.sendMessage({status: gridStatus});
    }

    function respondHorizontalLines(horizontalLinesStatus) {
        chrome.runtime.sendMessage({horizontalLinesStatus: horizontalLinesStatus});
    }

})();
