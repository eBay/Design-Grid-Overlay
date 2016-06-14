/**
 * Responsible for generating the report in
 * the popup.
 */
var reportController = (function () {

    /**
     * Listens for the event that adds the report to popup
     */
    chrome.runtime.onMessage.addListener(function (request) {
        if (request.method === 'updateGridReport') {
            var colWidth = 0;

            if (request.breakPoint == 'small') {
                colWidth = reportColWidthEquation(
                    request.width,
                    request.items['mobileOutterGutters'],
                    request.items['mobileInnerGutters'],
                    request.items['smallColumns']
                );

                createReport(colWidth, request.items['smallColumns'], request.items['mobileInnerGutters']);
            } else {
                if (request.width < request.items['largeWidth']) {
                    request.items['largeWidth'] = request.width;
                }

                colWidth = reportColWidthEquation(
                    request.items['largeWidth'],
                    request.items['outterGutters'],
                    request.items['gutters'],
                    request.items['largeColumns']
                );


                createReport(colWidth, request.items['largeColumns'], request.items['gutters']);
            }
        }
    });

    /**
     * Creates the report
     *
     * @param {int} columns - The numbers of columns of the grid
     * @param {Array} valuesArray - the array of values for the table
     */
    var createReport = function (colWidth, cols, gutter) {
        var output = '';

        for (var i = 1; i <= cols; i++) {


            var num = numberFormat(((gutter * (i - 1)) + (colWidth * i)), 2)
            output = output + '<tr><td style="width: 50%;">' + i + '</td><td class="table-right">' + num + 'px</td></tr>';
        }

        document.getElementById('report').innerHTML = output;
    };


    var reportColWidthEquation = function (width, outerGutter, innerGutter, cols) {
        return (((width - (outerGutter * 2)) - (innerGutter * (cols - 1))) / cols)
    };

    /**
     * Sends a message to get the column pixel widths
     *
     * @param {int} tabId - The id of the current tab
     */
    var calculateReport = function (tabId) {
        chrome.tabs.sendMessage(tabId, {method: "fireCalc", tabId: tabId});
    };

    function numberFormat(val, decimalPlaces) {
        var multiplier = Math.pow(10, decimalPlaces);
        return (Math.round(val * multiplier) / multiplier).toFixed(decimalPlaces);
    }


    /**
     * Inject report CSS styling into the active tab
     *
     * @param currentTabId - currently active tab
     */
    var insertReportCSS = function (currentTabId) {
        chrome.tabs.sendMessage(currentTabId, {method: "addReportCSS"});

    };

    /**
     * Tell the in-page injected JS code for the grid report to create the report overlay
     *
     * @param currentTabId - currently active chrome tab
     * @param reportOverlaySelector - The query selector that specifies the elements that will
     * show a size overlay on the page
     */
    var createReportOverlay = function (currentTabId, reportOverlaySelector) {
        chrome.tabs.sendMessage(currentTabId, {
            method: "createReportOverlay",
            tabId: currentTabId,
            reportOverlaySelector: reportOverlaySelector
        });

    };

    /**
     * Tell the in-page injected JS code for the grid report to remove the report overlay
     *
     * @param currentTabId - currently active chrome tab
     */
    var removeReportOverlay = function (currentTabId) {

        chrome.tabs.sendMessage(currentTabId, {method: "removeReportOverlay", tabId: currentTabId});
    };


    /**
     * Report Controller API function used by popup.js to enable or disable the report overlay
     *
     *  @param currentTabId - currently active chrome tab
     *  @param gridToggleEnabled - Whether the master Grid overlay toggle is enabled
     *  @param options - configuration options for report
     */
    var updateReportOverlay = function (currentTabId, gridToggleEnabled, options) {
        if (options.reportOverlayToggle) {
            createReportOverlay(currentTabId, options.reportOverlaySelector);
        }
        else {
            removeReportOverlay(currentTabId, options.reportOverlaySelector);
        }

        insertReportCSS(currentTabId);
    };


    /**
     * Publicly accessible methods
     */
    return {
        createReport: createReport,
        calculateReport: calculateReport,
        updateReportOverlay: updateReportOverlay
    }
})();
