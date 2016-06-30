var chrome = chrome || {};

(function () {
    /**
     * Array of function references to our Chrome Runtime Message Listeners. We use this
     * array for later clean-up of these listeners.
     * @type {Array}
     */
    var chromeMessageListeners = [];

    /**
     * Listener that calls the fireCalc method when need
     * to generate the values for the report.
     */
    function fireCalcListener(request, sender, sendResponse) {
        if (request.method == "fireCalc") {
            fireCalc(request.tabId);
        }
    }
    chrome.runtime.onMessage.addListener(fireCalcListener);
    chromeMessageListeners.push(fireCalcListener);


    /**
     * Inserts the CSS styles for the size overlay into
     * the head of the document. This is done by
     * adding a link tag with an href to the report.css file.
     * This code also ensures that the css styling for the
     * size overlay doesn't already exist
     */
    function insertReportCSS() {
        if (!document.getElementById('base-report-styles')) {
            var css = document.createElement('link');
            css.id = "base-report-styles";
            css.rel = "stylesheet";
            css.type = "text/css";
            css.href = chrome.extension.getURL('src/css/report.css');
            document.head.appendChild(css);
        }
    }

    /**
     * Event handler that adds the report size overlay styles to the page in response
     * to the chrome runtime message with method "addReportCSS"
     */
    function addReportCSSListener(request, sender, sendResponse) {
        if (request.method === "addReportCSS") {
            insertReportCSS();
        }
    }
    chrome.runtime.onMessage.addListener(addReportCSSListener);
    chromeMessageListeners.push(addReportCSSListener);

    /**
     * Event handler that enables the report overlay in response
     * to the chrome runtime message with method "createReportOverlay"
     * and a given query selector string
     */
    function createReportOverlayListener(request, sender, sendResponse) {
        if (request.method === "createReportOverlay") {
            var selector = request.reportOverlaySelector || "grid__cell";
            var matchEmptyElements = request.matchEmptyElements || false;
            var hideHiddenElementOverlays = request.hideHiddenElementOverlays || false;
            var overlayLabelColor = request.overlayLabelColor;
            var overlayTextColor = request.overlayTextColor;
            createReportOverlay(selector, matchEmptyElements, hideHiddenElementOverlays, overlayLabelColor, overlayTextColor, false);
        }
    }
    chrome.runtime.onMessage.addListener(createReportOverlayListener);
    chromeMessageListeners.push(createReportOverlayListener);

    /**
     * Event handler that disables the report overlay in response
     * to the chrome runtime message with method "removeReportOverlay"
     */
    function removeReportOverlayListener(request, sender, sendResponse) {
        if (request.method == "removeReportOverlay") {
            removeReportOverlay(false);
        }
    }
    chrome.runtime.onMessage.addListener(removeReportOverlayListener);
    chromeMessageListeners.push(removeReportOverlayListener);

    /**
     * Listener that cleans up all listeners if a cleanup message is received
     * NOTE: This function is currently unused, since injected scripts have no
     * current way of knowing if they are "orphaned" from their extension after
     * an update/reload/etc
     */
    function cleanUpListener(request, sender, sendResponse) {
        if(request.method == "cleanUp") {
            chromeMessageListeners.forEach(function(lst){
                "use strict";
                chrome.runtime.onMessage.removeListener(lst);

            });
        }
    }
    chrome.runtime.onMessage.addListener(cleanUpListener);
    chromeMessageListeners.push(cleanUpListener);

    /**
     * A set of configurations for our Size Overlay used by the various size overlay methods
     *
     */
    var _designGridSizeOverlayConfig = {
        uniqueScriptId: Date.now().toString(), //Used to ensure that only interact with an overlay that belongs to
                                               //this instance of the script
        enabled: false,                //Flag to signify if overlay is enabled
        matchEmptyElements: false,     //User-set Flag to match elements that have no child nodes
        hideHiddenElementOverlays: false, //User-set Flag to hide overlays for elements that are hidden under
                                          // other elements, or otherwise not visible
        overlayLabelColor: undefined,//User-customizable color of overlay background
        overlayTextColor: undefined, //User-customizable color of overlay text
        selector: undefined,         //User-customizer query selector string to locate our target elements to measure
        fullPageContainer: undefined,//Reference to our overlay container
        overlayedElements: [],       //Array of target elements that are being measured
        generatedOverlayArray: [],   //Array of label elements used to display sizes - one for each overlayedElement
        bodyMutationObserver: new MutationObserver(domChangeUpdate), //Observer that will update labels when DOM changes
        bodyMutObsConfig: {      //Configuration for our DOM Observer
            attributes: true,    //Listen to attribute changes, including class changes
            childList: true,     //Listen for direct child node list changes
            characterData: true, // Ignore character data changes
            subtree: true        // Listen recursively on entire subtree
        },
        updateIntervalId: undefined //ID that keeps track of our periodic overlay update setInterval() call
    };


    /**
     * Check if this script is still running even if disconnected from it's extension host
     * This can happen after an extension reload.
     *
     * @param fullPageContainerElem - the overlay element to check
     */
    function thisOverlayScriptIsActive(fullPageContainerElem) {

        if(fullPageContainerElem.getAttribute("unique-overlay-id") === _designGridSizeOverlayConfig.uniqueScriptId) {
            return true;
        }
        else {
            //Clean up our non-chrome extension api listeners - when extensions are reloaded an injected scripts are
            //"orphaned", Chrome prevents any more messages to the orphaned scripts from the other extension code.
            //Therefore we only need to stop listeners that depend on browser events, not chrome runtime messages.

            _designGridSizeOverlayConfig.enabled = false;
            if(_designGridSizeOverlayConfig.updateIntervalId) {
                window.clearInterval(_designGridSizeOverlayConfig.updateIntervalId);
                _designGridSizeOverlayConfig.updateIntervalId = undefined;
            }
            _designGridSizeOverlayConfig.bodyMutationObserver.disconnect();
            window.removeEventListener('resize', requestOverlayUpdate);
            window.removeEventListener('scroll', requestOverlayUpdate);
            console.log("Design Grid Overlay Extension: Shut Down DOM event listeners on Orphaned Script.");
            return false;
        }
    }

    /**
     * Variable that keeps track of whether we are already in the middle of processing a dom event
     * @type {boolean}
     */
    var _overlayValuesUpdating = false;

    /**
     * The wrapper for our window resize handler that throttles the event handler
     * to wait for the next available frame for rendering, by using requestAnimationFrame
     */
    function requestOverlayUpdate() {
        if(!_overlayValuesUpdating) {
            requestAnimationFrame(updateOverlayValues);
        }
        _overlayValuesUpdating = true;
    }

    /**
     * Method that updates the sizes in each overlay that is present on this page
     */
    function updateOverlayValues() {
        if (
            _designGridSizeOverlayConfig.enabled &&
            thisOverlayScriptIsActive(_designGridSizeOverlayConfig.fullPageContainer)
        ) {
            //We will be modifying the DOM overlay, so disconnect our DOM observer
            _designGridSizeOverlayConfig.bodyMutationObserver.disconnect();

            for (var i = 0; i < _designGridSizeOverlayConfig.overlayedElements.length; i++) {

                // Style/insert data into the label for our target element
                var labelToUse = _designGridSizeOverlayConfig.generatedOverlayArray[i];
                //Don't update coloring on this pass - leave out color params
                labelToUse = styleLabelElement(labelToUse, _designGridSizeOverlayConfig.overlayedElements[i],
                    _designGridSizeOverlayConfig.hideHiddenElementOverlays);
            }

            //Restart our dom observer now that we are done changing the DOM
            _designGridSizeOverlayConfig.bodyMutationObserver.observe(document.body, _designGridSizeOverlayConfig.bodyMutObsConfig);
        }
        _overlayValuesUpdating = false;
    }

    /**
     * Method that is fired when any element in the document body is added, deleted, or attributes are modified.
     * We use this event to signal that we need to regenerate our overlay to handle any new potential HTML elements to
     * label with our overlay
     *
     * @param mutations - unused for now, but contains a list of DOM MutationRecords
     * (https://developer.mozilla.org/en-US/docs/Web/API/MutationRecord)
     */
    function domChangeUpdate(mutations) {
        if (
            _designGridSizeOverlayConfig.enabled &&
            thisOverlayScriptIsActive(_designGridSizeOverlayConfig.fullPageContainer)) {
            // NOTE: Any changes to the DOM that occur within this function will not trigger this callback again

            // Save initialization options between destroy and re-creation
            var savedSelector = _designGridSizeOverlayConfig.selector;
            var savedMatchEmptyElements = _designGridSizeOverlayConfig.matchEmptyElements;
            var savedHideHiddenElementOverlays = _designGridSizeOverlayConfig.hideHiddenElementOverlays;
            var savedOverlayLabelColor = _designGridSizeOverlayConfig.overlayLabelColor;
            var savedOverlayTextColor = _designGridSizeOverlayConfig.overlayTextColor;

            // Re-build our overlays
            removeReportOverlay(true);
            createReportOverlay(savedSelector, savedMatchEmptyElements, savedHideHiddenElementOverlays, savedOverlayLabelColor, savedOverlayTextColor, true);
        }
    }

    /**
     *  If all four corners of element are hidden, then the entire element is considered hidden
     *
     * @param element - Target HTML element to check
     * @param elemBoundingRect - BoundingRect for given element (so this function doesn't need to compute it again)
     * @returns {boolean} - Whether element is hidden or not
     */
    function elementHidden(element, elemBoundingRect) {

        return (
            (element != document.elementFromPoint(elemBoundingRect.left, elemBoundingRect.top)) && //Upper left
            (element != document.elementFromPoint(elemBoundingRect.left, elemBoundingRect.bottom - 1)) && //Lower left
            (element != document.elementFromPoint(elemBoundingRect.right - 1, elemBoundingRect.top)) && //Upper right
            (element != document.elementFromPoint(elemBoundingRect.right - 1, elemBoundingRect.bottom - 1)) //Lower right
        );

    }


    /**
     * Calculate the inner content width of an element, which
     * removes padding on the left and right, and borders on the left and right
     *
     * @param element - HTMLElement for which we wish to compute an inner width
     * @param hideHiddenElementOverlays - Boolean to tell whether to check for hidden target elements
     * @returns {object} - Aggregated element sizing, location and visibility object
     */
    function calculateElementLocationAndSize(element, hideHiddenElementOverlays) {

        var boundingRect = element.getBoundingClientRect();

        var elementTotalWidth = boundingRect.width;
        var elementTotalHeight = boundingRect.height;

        // Calculate updated style, then grab padding values
        var computedStyle = getComputedStyle(element);
        var paddingLeft = parseFloat(computedStyle.getPropertyValue('padding-left'));
        var paddingRight = parseFloat(computedStyle.getPropertyValue('padding-right'));
        var paddingTop = parseFloat(computedStyle.getPropertyValue('padding-top'));

        // Grab border values
        var borderLeft = parseFloat(computedStyle.getPropertyValue('border-left-width'));
        var borderRight = parseFloat(computedStyle.getPropertyValue('border-right-width'));
        var borderTop = parseFloat(computedStyle.getPropertyValue('border-top-width'));

        return {
            width: elementTotalWidth,
            height: elementTotalHeight,
            contentWidth: (elementTotalWidth == 0 ? 0 : (elementTotalWidth - paddingLeft - paddingRight - borderLeft - borderRight)),
            left: (boundingRect.left + window.scrollX + borderLeft + paddingLeft),
            top: (boundingRect.top + window.scrollY + paddingTop +  borderTop),
            display: computedStyle.getPropertyValue('display'),
            hiddenByOtherElement: (hideHiddenElementOverlays ? elementHidden(element, boundingRect) : false)
        };
    }

    /**
     * Method That styles the overlay label based on the given paramenters, and the target element that is
     * being analyzed
     *
     * @param labelElement - Existing HTML element that is being styled
     * @param targetElement - Target HTML element that is being analyzed
     * @param hideHiddenElementOverlays - Boolean to tell whether to hide labels for target elements that are hidden
     * under other elements, or offscreen
     * @param labelColor - Optional, Color of the label element
     * @param textColor - Optional, Text color of the label element
     * @returns {*}
     */
    function styleLabelElement(labelElement, targetElement, hideHiddenElementOverlays, labelColor, textColor) {

        var targetElemStats = calculateElementLocationAndSize(targetElement, hideHiddenElementOverlays);

        //labelToUse.style.left = elemStats.left + "px";
        //labelToUse.style.top = elemStats.top + "px";
        labelElement.style.transform = "translate(" + targetElemStats.left + "px, " + targetElemStats.top + "px)";
        labelElement.style.width = targetElemStats.contentWidth + "px";
        if(labelColor) {
            labelElement.style['border-top'] = "solid 2px " + labelColor;
        }

        labelElement.firstChild.innerHTML = numberFormat(targetElemStats.contentWidth, 2) + "px";
        if(textColor) {
            labelElement.firstChild.style.background = labelColor;
            labelElement.firstChild.style.color = textColor;
        }

        // Hide label if element is hidden by display:none, or hidden by another element
        if (targetElemStats.display === "none" || targetElemStats.hiddenByOtherElement) {
            labelElement.style.display = "none";
        }
        else {
            labelElement.style.removeProperty("display");
        }

        return labelElement;
    }

    /**
     * Method that checks whether a given element is part of our size overlay
     * @param element - HTML element
     * @returns {boolean}
     */
    function isOverlayElement(element) {
        "use strict";

        return (
            (element.id === "grid-report-size-fullpage-overlay") ||
            element.classList.contains("grid-report-size-overlay-element") ||
            element.classList.contains("grid-report-size-overlay-span")
            );
    }



    /**
     * Method that creates the size overlays for all
     * elements captured by the given selector input,
     * and creates both the window resize and
     * DOMMutation event listeners that update the
     * overlays when the window resizes or
     * the contents of the DOM change
     *
     * @param selector - Document query selector that specifies
     * the elements which will have a size overlay
     * @param matchEmptyElements - Boolean that says whether to add our overlay to elements that have no child elements (empty)
     * @param hideHiddenElementOverlays - Boolean that says whether to hide our overlays for target elements that are hidden
     * underneath other elements, or off screen.
     * @param overlayLabelColor - text user input for custom overlay label color
     * @param overlayTextColor - text user input for custom overlay text color
     * @param rebuildingOverlay - Boolean flag indicating if we are just rebuilding the overlay, instead of
     * removing it
     */
    function createReportOverlay(selector, matchEmptyElements, hideHiddenElementOverlays, overlayLabelColor, overlayTextColor, rebuildingOverlay) {

        // This function may be activated directly by the chrome extension as well as from in-page code, so we
        // always need to verify the current state of the overlay according this page's stored values
        if (_designGridSizeOverlayConfig.enabled) {
            removeReportOverlay(true);
        }

        try {
            var foundElements = document.querySelectorAll(selector) || [];

            for(var i = 0; i < foundElements.length; i++) {

                //Ignore our own overlay element
                if(!isOverlayElement(foundElements[i])) {

                    // If we are matching empty elements, automatically add the element. If we are NOT matching empty
                    // elements, then first check if the element has at least 1 child element or text content
                    if(
                        matchEmptyElements ||
                        (!matchEmptyElements && ((foundElements[i].children.length > 0) || (foundElements[i].textContent.length > 0)))
                    ) {
                        // Store element
                        _designGridSizeOverlayConfig.overlayedElements.push(foundElements[i]);
                    }
                }
            }

        }
        catch(e) {
            console.error("Design Grid Overlay Extension Error: Invalid Query Selector '" + selector + "'");
            return;
        }

        //Check for overlay container that already exists
        var fullPageOverlay = document.getElementById("grid-report-size-fullpage-overlay");

        if(!fullPageOverlay) {
            //Create big full page overlay since it doesn't already exist
            fullPageOverlay = document.createElement('div');
            fullPageOverlay.id = "grid-report-size-fullpage-overlay";
            document.body.appendChild(fullPageOverlay);
        }
        else if(!rebuildingOverlay) {
            // We are re-using an overlay that was previously hidden by a remove command
            fullPageOverlay.style.removeProperty("display");
        }



        //Flag this overlay as ours, to stop any other orphaned scripts from using it
        fullPageOverlay.setAttribute("unique-overlay-id", _designGridSizeOverlayConfig.uniqueScriptId);

        //Initialize our data fields
        _designGridSizeOverlayConfig.fullPageContainer = fullPageOverlay;
        _designGridSizeOverlayConfig.enabled = true;
        _designGridSizeOverlayConfig.selector = selector;
        _designGridSizeOverlayConfig.matchEmptyElements = matchEmptyElements;
        _designGridSizeOverlayConfig.hideHiddenElementOverlays = hideHiddenElementOverlays;
        _designGridSizeOverlayConfig.overlayLabelColor = overlayLabelColor;
        _designGridSizeOverlayConfig.overlayTextColor = overlayTextColor;


        //Remove extra children already in the DOM
        if(_designGridSizeOverlayConfig.fullPageContainer.children.length > _designGridSizeOverlayConfig.overlayedElements.length) {

            //Remove unneeded DOM nodes, starting with last node

            //Save the original number of nodes, so the length variable doesn't change as we modify the list
            var originalNumberOfDOMNodes = _designGridSizeOverlayConfig.fullPageContainer.children.length;

            for(var j = 0; j < (originalNumberOfDOMNodes - _designGridSizeOverlayConfig.overlayedElements.length); j++){

                //This loop will execute N times, where N is the number needed to be removed

                //Our index for removal from the DOM is the loop variable J subtracted from the index of the last element (originalNumberOfDOMNodes - 1)
                var indexToRemoveFromDOM =  (originalNumberOfDOMNodes - 1) - j;
                _designGridSizeOverlayConfig.fullPageContainer.removeChild(_designGridSizeOverlayConfig.fullPageContainer.children[indexToRemoveFromDOM]);
             }

        }
        else if (_designGridSizeOverlayConfig.fullPageContainer.children.length < _designGridSizeOverlayConfig.overlayedElements.length) {

            //If we don't have enough DOM nodes, create the new children we need:

            //Node to clone:
            var newLabelElement = document.createElement('div');
            newLabelElement.className = "grid-report-size-overlay-element";
            newLabelElement.innerHTML = "<span class='grid-report-size-overlay-span'></span>";

            // Our batch of nodes to add, stored as a DocumentFragment for efficient DOM insertion
            var labelsDocFrag = document.createDocumentFragment();

            // Here we batch up the nodes to add into an array to be pushed into a documentFragment to be efficienctly added all at once
            // NOTE: we don't need to save the original DOM list length, because we will be adding the nodes we need in
            // a single batch (stored in an array, instead of on each iteration of the loop
            for(var k = 0; k < (_designGridSizeOverlayConfig.overlayedElements.length - _designGridSizeOverlayConfig.fullPageContainer.children.length); k++){

                //Clone our prototype node and add it to the doc frag list instead of making a new one from scratch
                // Note that this function call does NOT modify the DOM
                labelsDocFrag.appendChild(newLabelElement.cloneNode(true));

            }

            //Now push our new nodes to the DOM, all at once
            _designGridSizeOverlayConfig.fullPageContainer.appendChild(labelsDocFrag);
        }


        // Number of label dom elements is now the same as matched dom elements we are about to locate and measure

        //Iterate over each overlayed element and style it/inject data in the corresponding HTML label element
        for(var l = 0; l < _designGridSizeOverlayConfig.overlayedElements.length; l++) {

            // Apply our styling and data to label for our target element
            var labelToUse = _designGridSizeOverlayConfig.fullPageContainer.children[l];
            labelToUse = styleLabelElement(labelToUse, _designGridSizeOverlayConfig.overlayedElements[l],
                _designGridSizeOverlayConfig.hideHiddenElementOverlays, _designGridSizeOverlayConfig.overlayLabelColor,
                _designGridSizeOverlayConfig.overlayTextColor);

            // Keep track of this generated label elements
            _designGridSizeOverlayConfig.generatedOverlayArray.push(labelToUse);

        }

        //If the dom is changed, we want to update this overlay
        _designGridSizeOverlayConfig.bodyMutationObserver.observe(document.body, _designGridSizeOverlayConfig.bodyMutObsConfig);

        //If the window is resized, we want to update this overlay
        window.addEventListener('resize', requestOverlayUpdate, false);
        window.addEventListener('scroll', requestOverlayUpdate, true);  //This is a capture event handler instead of bubble
                                                                        //so that we capture all scroll events in page

        if(_designGridSizeOverlayConfig.hideHiddenElementOverlays) {
            //If we are detecting visibility of elements, we need periodic visibility checks and updates to deal with
            // long-running CSS animations or other delayed layout rendering that affects visibility
            _designGridSizeOverlayConfig.updateIntervalId = window.setInterval(
                function(){
                    //Request idle callback to prevent overloading CPU with work
                    window.requestIdleCallback(requestOverlayUpdate);
                }, 750);
        }

    }

    /**
     * Method that removes the size overlays
     * and disconnects both the window resize and
     * DOMMutation event listeners
     *
     * @param rebuildingOverlay - Boolean flag indicating if we are just rebuilding the overlay, instead of
     * removing it
     */
    function removeReportOverlay(rebuildingOverlay) {

        // This function may be activated directly by the chrome extension as well as from in-page code, so we
        // always need to verify the current state of the overlay according this page's stored values
        if (_designGridSizeOverlayConfig.enabled) {

            //Disconnect DOM event handlers

            if(_designGridSizeOverlayConfig.updateIntervalId) {
                window.clearInterval(_designGridSizeOverlayConfig.updateIntervalId);
                _designGridSizeOverlayConfig.updateIntervalId = undefined;
            }
            window.removeEventListener('resize', requestOverlayUpdate);
            window.removeEventListener('scroll', requestOverlayUpdate);
            _designGridSizeOverlayConfig.bodyMutationObserver.disconnect();


            if(!rebuildingOverlay) {
                //If we are actually removing the overlay, then we want to hide it
                _designGridSizeOverlayConfig.fullPageContainer.style.display = "none";
            }

            //Reset our data structures
            _designGridSizeOverlayConfig.selector = undefined;
            _designGridSizeOverlayConfig.overlayedElements = [];
            _designGridSizeOverlayConfig.generatedOverlayArray = [];
            _designGridSizeOverlayConfig.enabled = false;
            _designGridSizeOverlayConfig.matchEmptyElements = false;
            _designGridSizeOverlayConfig.hideHiddenElementOverlays = false;
            _designGridSizeOverlayConfig.overlayLabelColor = undefined;
            _designGridSizeOverlayConfig.overlayTextColor = undefined;
        }
    }


    /**
     * Method that checks whether the width
     * is small or large, and pass the appropriate
     * values to have the correct report generated
     */
    function fireCalc(tabId) {
        var strTabId = tabId.toString();
        chrome.storage.sync.get(strTabId, function (items) {
            if(items[strTabId]) {
                if (getWidth() <= parseInt(items[strTabId].formData.gridForm.settings["smallWidth"])) {
                    calculateReport('small', items[strTabId].formData.gridForm.settings);
                } else {
                    calculateReport('large', items[strTabId].formData.gridForm.settings);
                }
            }
        });
    }

    /**
     * Calculates the width of the each column
     * and creates a report. The values are then
     * sent to the popup via a message in order
     * to be displayed in the report section of the popup
     */
    function calculateReport(breakPoint, items) {
        chrome.runtime.sendMessage({
                method: 'updateGridReport',
                items: items,
                breakPoint: breakPoint,
                width: document.documentElement.clientWidth
            }
        );
    }

    /**
     * Calculates the gutter of a given column
     */
    function calculateGutter() {
        var elements = document.getElementsByClassName('grid-overlay-col');
        var el = elements[1];
        var style = el.currentStyle || window.getComputedStyle(el);
        var margin = parseFloat(style.marginLeft) + parseFloat(style.marginRight);

        return margin;
    }

    /**
     * Calculates the width of the of a given column
     */
    function getWidth() {
        if (self.innerHeight) {
            return self.innerWidth;
        }

        if (document.documentElement && document.documentElement.clientWidth) {
            return document.documentElement.clientWidth;
        }

        if (document.body) {
            return document.body.clientWidth;
        }
    }

    /**
     * Decimal formatter. Used to display the values in the
     * report to a certain number of decimal places.
     */
    function numberFormat(val, decimalPlaces) {
        var multiplier = Math.pow(10, decimalPlaces);
        return (Math.round(val * multiplier) / multiplier).toFixed(2);
    }

})();


