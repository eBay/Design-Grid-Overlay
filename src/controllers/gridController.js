/**
 * Responsible for build the css based on the options
 * in the popup.
 */
var gridController = (function () {

    /**
     * Checks weather view port units are selected.
     * If view ports units are selected VW units are returned.
     * If not percent is return.
     *
     * This is used if the user want to ignore the scrollbar
     * when dealing with the width of the page
     */
    var checkIfViewPortIsSelected = function (viewPortSelected) {
        if (viewPortSelected) {
            return 'vw';
        } else {
            return '%';
        }
    };

    /**
     * Creates the CSS class that sets the width of the
     * container of the grid-lines
     *
     * @param {string} units - The type of units (VW or %) that the container
     * will be set to.
     */
    var createGridLinesCSS = function (units) {
        return ".cb-grid-lines {"
            + "width: 100" + units
            + "}";

    };

    /**
     * Creates the CSS that styles the grid columns
     * on a large screen
     *
     * @param {object} options - The setting from whats stored in local storage.
     * @param {object} advancedOptions - Additional settings from the advanced tab of the popup UI
     */
    var createGridContainer = function (options, advancedOptions) {
        return ".grid-overlay-container {"
            + "max-width:" + options.largeWidth + "px;"
            + "padding:0px " + options.outterGutters + "px;"
            + "left:" + options.offsetX + "px;"
            + "}"
            + ".grid-overlay-col {"
            + "width:" + calcColumnPercents(options.largeColumns) + "%;"
            + "margin: 0 " + (options.gutters / 2) + "px;"
            + "background: " + advancedOptions.color + ";"
            + "}"
            + ".grid-overlay-col:first-child {"
            + "margin-left:0px;"
            + "}"
            + ".grid-overlay-col:last-child {"
            + "margin-right:0px;"
            + "}"
            + ".grid-overlay-horizontal {"
            + "background-image: linear-gradient(to top, " + advancedOptions.horizontalLinesColor + " 1px, transparent 1px);"
            + "background-size: 100% " + options.rowGutters + "px;"
            + "background-repeat-y: repeat;"
            + "background-position-y: " + options.offsetY + "px;"
            + "} ";
    };

    /**
     * Creates the CSS for the small container.
     * When the width is smaller than or equal to
     *    the value specified in the options argument.
     *
     * @param {object} options - The setting from whats stored in local storage.
     * @param {object} advancedOptions - Additional settings from the advanced tab of the popup UI
     */
    var createSmallContainer = function (options, advancedOptions) {

        return "@media (max-width:" + options.smallWidth + "px) {"
            + ".grid-overlay-col {"
            + "width:" + calcColumnPercents(options.smallColumns) + "%;"
            + "margin: 0 " + (options.mobileInnerGutters / 2) + "px;"
            + "background: " + advancedOptions.color + ";"
            + "}"
            + ".grid-overlay-container {"
            + "padding:0px " + options.mobileOutterGutters + "px;"
            + "left:" + options.offsetX + "px;"
            + "}"
            + ".grid-overlay-col:first-child {"
            + "margin-left:0px;"
            + "}"
            + ".grid-overlay-col:nth-child(" + options.smallColumns + ") {"
            + "margin-right:0px;"
            + "}"
            + ".grid-overlay-col:nth-child(n+" + (parseInt(options.smallColumns) + 1) + ") {"
            + "display:none;"
            + "}"
            + "}"
    };

    /**
     * Calculates the percents of each column.
     *
     * @param {int} columns - The number of columns in the grid
     */
    var calcColumnPercents = function (columns) {
        return (100 / columns);
    };

    /**
     * Aggregates the CSS and sends a message to
     * have it inserted onto the page
     *
     * @param {number} currentTabId - Currently active Chrome Tab Id
     * @param {object} options - The setting from whats stored in local storage.
     * @param {object} advancedOptions - Additional settings from the advanced tab of the popup UI
     */
    var executeCSS = function (currentTabId, options, advancedOptions) {


        var unitWidth = checkIfViewPortIsSelected(advancedOptions['viewports']);

        chrome.tabs.sendMessage(currentTabId, {
            method: "addCSS",
            css: createGridLinesCSS(unitWidth) + createGridContainer(options, advancedOptions) + createSmallContainer(options, advancedOptions)
        });

    };

    /**
     * Sends a message to tell whether the grid is on or off
     *
     * @param {int} gridStatus - The status of the grid either 0 or 1 (off or on)
     */
    var respond = function (gridStatus) {
        chrome.runtime.sendMessage({status: gridStatus});
    };
    var respondHorizontalLines = function (horizontalLinesStatus) {
        chrome.runtime.sendMessage({horizontalLinesStatus: horizontalLinesStatus});
    };

    /**
     * Sends a message to have the grid HTML added to the page.
     * First a status saying the grid is on is sent. After a
     * message is sent to the grid content script that tell it
     * to create the grid HTML
     *
     *  @param {number} currentTabId - Currently active Chrome Tab Id
     */
    var createGrid = function (currentTabId) {
        respond(1);
        chrome.tabs.sendMessage(currentTabId, {method: "create", tabId: currentTabId});
    };

    var enableHorizontalLines = function (currentTabId) {
        respondHorizontalLines(1);
        chrome.tabs.sendMessage(currentTabId, {method: "enableHorizontalLines", tabId: currentTabId});
    };
    var disableHorizontalLines = function (currentTabId) {
        respondHorizontalLines(0);
        chrome.tabs.sendMessage(currentTabId, {method: "disableHorizontalLines", tabId: currentTabId});
    };

    /**
     * Used to turn the grid on and off when updating the
     * settings in the popup.
     *
     *  @param {number} currentTabId - Currently active Chrome Tab Id
     *    @param {object} options - The setting from whats stored in local storage.
     *    @param {object} advancedOptions - Additional settings from the advanced tab of the popup UI
     */
    var toggleGrid = function (currentTabId, options, advancedOptions) {
        var gridToggle = document.getElementById('gridToggle');

        if (gridToggle.checked) {
            removeGrid(currentTabId);
            createGrid(currentTabId);
        } else {
            removeGrid(currentTabId);
        }

        var horizontalLinesToggle = document.getElementById('horizontalLinesToggle');
        
        if (horizontalLinesToggle.checked) {
            enableHorizontalLines(currentTabId);
        } else {
            disableHorizontalLines(currentTabId);
        }

        executeCSS(currentTabId, options, advancedOptions);
    };

    /**
     * Used to turn the grid on and off when updating the
     * settings in the popup.
     *
     *  @param {number} currentTabId - Currently active Chrome Tab Id
     *  @param {object} options - The setting from whats stored in local storage.
     *  @param {object} advancedOptions - Additional settings from the advanced tab of the popup UI
     */
    var updateGrid = function (currentTabId, options, advancedOptions) {
        toggleGrid(currentTabId, options, advancedOptions);
    };

    /**
     * Removes the grid from the current tab.
     * Fires two events, destroy and removeCSS.
     * The message destroy removes the grid HTML.
     * The message removeCSS removes the old css for the grid
     *
     *  @param {number} currentTabId - Currently active Chrome Tab Id
     */
    var removeGrid = function (currentTabId) {
        respond(0);

        chrome.tabs.sendMessage(currentTabId, {method: "destroy", tabId: currentTabId});
    };


    /**
     * Returns publicly accessible methods
     */
    return {
        toggleGrid: toggleGrid,
        updateGrid: updateGrid,
        removeGrid: removeGrid,
        disableHorizontalLines: disableHorizontalLines,
        enableHorizontalLines: enableHorizontalLines
    }

})();
