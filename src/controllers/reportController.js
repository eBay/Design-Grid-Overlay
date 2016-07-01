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
            var gridSettings = settingStorageController.getSettings().formData.gridForm.settings;
            var colWidth = 0;
            var largeWidth = gridSettings.largeWidth;

            if (request.breakPoint == 'small') {
                colWidth = reportColWidthEquation(
                    request.width,
                    gridSettings.mobileOutterGutters,
                    gridSettings.mobileInnerGutters,
                    gridSettings.smallColumns
                );

                createReport(colWidth, gridSettings.smallColumns, gridSettings.mobileInnerGutters);
            } else {
                if (request.width < largeWidth) {
                    largeWidth = request.width;
                }

                colWidth = reportColWidthEquation(
                    largeWidth,
                    gridSettings.outterGutters,
                    gridSettings.gutters,
                    gridSettings.largeColumns
                );


                createReport(colWidth, gridSettings.largeColumns, gridSettings.gutters);
            }
        }
    });

    /**
     * Creates the report
     *
     * @param {int} colWidth - Width of each column
     * @param {int} cols - The numbers of columns of the grid
     * @param {int} gutter - Gutter width
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
     * @param {object} gridSettings - Grid options object, needed for report calculation
     */
    var calculateReport = function (tabId, gridSettings) {
        chrome.tabs.sendMessage(tabId, {method: "fireCalc", tabId: tabId, smallWidth: gridSettings.smallWidth, ignoreScrollbar: gridSettings.viewports});
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
     * @param matchEmptyElements - tell our overlay in-page JS code whether or not to add overlays to empty elements
     * with no child elements inside them
     * @param hideHiddenElementOverlays - Tell our overlay in-page JS code whether to hide overlay elements for target
     * elements that are not visible (underneath another element, or off-screen)
     * @param overlayLabelColor - text user input for custom overlay label color
     * @param overlayTextColor - text user input for custom overlay text color
     */
    var createReportOverlay = function (currentTabId, reportOverlaySelector, matchEmptyElements, hideHiddenElementOverlays, overlayLabelColor, overlayTextColor) {
        chrome.tabs.sendMessage(currentTabId, {
            method: "createReportOverlay",
            tabId: currentTabId,
            reportOverlaySelector: reportOverlaySelector,
            matchEmptyElements: matchEmptyElements,
            hideHiddenElementOverlays: hideHiddenElementOverlays,
            overlayLabelColor: overlayLabelColor,
            overlayTextColor: overlayTextColor
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
     *  @param advancedOptions - additional configuration options from advanced tab
     */
    var updateReportOverlay = function (currentTabId, gridToggleEnabled, options, advancedOptions) {
        if (options.reportOverlayToggle) {
            createReportOverlay(currentTabId, options.reportOverlaySelector, options.reportOverlayMatchEmptyElements,
                advancedOptions.hideHiddenElementOverlays, advancedOptions.overlayLabelColor, advancedOptions.overlayTextColor);
        }
        else {
            removeReportOverlay(currentTabId);
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
