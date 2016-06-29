(function () {
    /**
     * Array of function references to our Chrome Runtime Message Listeners. We use this
     * array for later clean-up of these listeners.
     * @type {Array}
     */
    var chromeMessageListeners = [];

    /**
     * Heartbeat method that tells the popup whether the file has
     * been injected into the page.
     */
    function helloListener(request, sender, sendResponse) {

        if (request.greeting == "hello")
            sendResponse({message: "hi"});
    }
    chrome.runtime.onMessage.addListener(helloListener);
    chromeMessageListeners.push(helloListener);

    /**
     * Method that creates the HTML structure
     * for the grid.
     */
    function createListener(request, sender, sendResponse) {
        if (request.method == "create") {
            chrome.storage.sync.get(request.tabId.toString(), function (item) {
                var numColumns = item[request.tabId.toString()].formData.gridForm.settings.largeColumns || 16;

                var div = document.createElement('div');
                div.setAttribute("class", "cb-grid-lines");

                var output = '<div class="grid-overlay-container"> \
                    <div class="grid-overlay-row">';

                for (var i = 0; i < numColumns; i += 1) {
                    output += '<div class="grid-overlay-col"></div>';
                }

                output += '</div> \
                    </div>';

                div.innerHTML = output;
                document.body.appendChild(div);
                respond(1);
            });
        }

    }
    chrome.runtime.onMessage.addListener(createListener);
    chromeMessageListeners.push(createListener);

    /**
     * Method for removing the grid HTML from the page.
     */

    function destroyListener(request, sender, sendResponse) {
        if (request.method == "destroy" && document.getElementsByClassName('cb-grid-lines').length) {
            document.body.removeChild(document.getElementsByClassName('cb-grid-lines')[0]);
            respond(0);
        }
    }
    chrome.runtime.onMessage.addListener(destroyListener);
    chromeMessageListeners.push(destroyListener);

    /**
     * Adds the dynamically generated CSS for the grid
     * into the head of the document.
     */
    function addCSSListener(request, sender, sendResponse) {
        if (request.method == "addCSS") {
            insertBaseCSS();

            var customGridStyles = document.createElement('style');
            customGridStyles.id = "custom-grid-style";
            customGridStyles.appendChild(document.createTextNode(
                request.css
            ));

            document.head.appendChild(customGridStyles);
        }
    }
    chrome.runtime.onMessage.addListener(addCSSListener);
    chromeMessageListeners.push(addCSSListener);

    /**
     * Removes the dynamically generated CSS from the
     * head of the document.
     */
    function removeCSSListener(request, sender, sendResponse) {
        if (request.method == "removeCSS") {
            var customGridStyles = document.getElementById("custom-grid-style");
            if (customGridStyles) {
                customGridStyles.parentNode.removeChild(customGridStyles);
            }
        }
    }
    chrome.runtime.onMessage.addListener(removeCSSListener);
    chromeMessageListeners.push(removeCSSListener);

    /**
     * Inserts the base CSS styles for the grid into
     * the head of the document. This is done by
     * adding a link tag with an href to the grid.css file.
     */
    function insertBaseCSS() {
        var css = document.createElement('link');
        css.id = "base-grid-styles";
        css.rel = "stylesheet";
        css.type = "text/css";
        css.href = chrome.extension.getURL('src/css/grid.css');

        if (!document.getElementById('base-grid-styles')) {
            document.head.appendChild(css);
        }
    }

    function insertBaseCSSListener(request, sender, sendResponse) {
        if (request.method == "insertBaseCSS") {
            insertBaseCSS();
        }
    }
    chrome.runtime.onMessage.addListener(insertBaseCSSListener);
    chromeMessageListeners.push(insertBaseCSSListener);

    /**
     * Notifies the popup whether the grid is
     * on or off.
     */
    function respond(gridStatus) {
        chrome.runtime.sendMessage({status: gridStatus});
    }

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
})();


