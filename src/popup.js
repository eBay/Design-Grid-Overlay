var chrome = chrome || {};

var popup = (function () {

    var gridForm = document.getElementById('gridForm');
    var gridToggle = document.getElementById('gridToggle');
    var reportForm = document.getElementById('reportForm');
    var advancedForm = document.getElementById('advancedForm');
    var tabContentContainer = document.getElementById('gridsettings');
    var tabLabelContainer = document.getElementById('tabContainer');
    var currentChromeTabId = undefined;


    /**
     * Set the click event for the tabs
     */
    var setTabAction = function (tabOuter, tabInner, contentId) {
        $('#' + tabInner).bind("click", function (event) {
            $('.' + tabOuter + ' div[aria-selected=true]').attr("aria-selected", "false");
            this.setAttribute("aria-selected", "true");
            $('.' + tabOuter).find("[aria-hidden=false]").attr("aria-hidden", "true");
            $('#' + contentId).eq($(this).attr('tabindex')).attr("aria-hidden", "false");
        });
    };

    /**
     * Setup tab actions for each tab label and its corresponding tab panel
     */
    setTabAction('tabs', 'tab1', 'panel1');
    setTabAction('tabs', 'tab2', 'panel2');
    setTabAction('tabs', 'tab3', 'panel3');

    /**
     * Allows a user to click the github icon and
     * be taken directly to the eBaay grid issue page
     */
    var git = document.getElementById('github-icon');
    git.addEventListener('click', function (e) {
        if (this.href !== undefined) {
            chrome.tabs.create({url: this.href})
        }
    });


    /**
     * Will stop the advanced form from submitting
     */
    advancedForm.onsubmit = function () {
        return false;
    };

    /**
     * Will stop the report settings form from submitting
     */
    reportForm.onsubmit = function () {
        return false;
    };


    /**
     * Called when the popup is load. A call
     * to save the tab state and check the grid status is
     * made.
     */
    window.addEventListener('load', function () {

        chrome.tabs.query({currentWindow: true, active: true}, function (tabs) {

            currentChromeTabId = tabs[0].id;

            document.getElementById('tabContainer').addEventListener('click', function () {
                //Save UI state, which includes tab state
                settingStorageController.saveSettings(currentChromeTabId);
            });

            //Initialize state
            popup.init();

            //tabController.getCurrentTabState(tabs[0].id);
        });

        chrome.tabs.executeScript(null, {file: 'src/executedScripts/gridStatus.js'});


    });

    /**
     * Event that changes the toggle based on if
     * the grid is active or not
     */
    chrome.runtime.onMessage.addListener(
        function (request, sender, sendResponse) {
            if (request.status) {
                console.log('Grid already enabled on page');

                if (request.status === 1 && gridToggle.checked === false) {
                    gridToggle.checked = true;
                } else if (request.status === 0 && gridToggle.checked === true) {
                    gridToggle.checked = false;
                }
            }
        }
    );


    /**
     * A click event listen that will change the values
     * off the grid based on the popup values.
     */
    gridToggle.addEventListener('click', function () {
        var settings = settingStorageController.saveSettings(currentChromeTabId);
        gridController.updateGrid(currentChromeTabId, settings.formData.gridForm.settings, settings.formData.advancedForm.settings);
        reportController.calculateReport(currentChromeTabId);
    });


    /**
     * Adds an event to the reset button
     * in order to reset all the values on
     * the grid to the default values in the
     * popup window.
     */
    gridForm.addEventListener('reset', function () {

        // SetTimeout is used to delay the execution of this code and storage of the DOM state until AFTER the reset
        // event has finished resetting the form values - this reset event is fired BEFORE the DOM state has changed
        setTimeout(function () {
            var settings = settingStorageController.saveSettings(currentChromeTabId);
            gridController.updateGrid(currentChromeTabId, settings.formData.gridForm.settings, settings.formData.advancedForm.settings);
            reportController.calculateReport(currentChromeTabId);
            reportController.updateReportOverlay(currentChromeTabId, gridToggle.checked,
                settings.formData.reportForm.settings, settings.formData.advancedForm.settings);
        }, 0);
    });

    /**
     * Adds an event to the reset button
     * in order to reset all the values on
     * the grid to the default values in the
     * popup window.
     */
    reportForm.addEventListener('reset', function () {

        // SetTimeout is used to delay the execution of this code and storage of the DOM state until AFTER the reset
        // event has finished resetting the form values - this reset event is fired BEFORE the DOM state has changed
        setTimeout(function () {
            var settings = settingStorageController.saveSettings(currentChromeTabId);
            gridController.updateGrid(currentChromeTabId, settings.formData.gridForm.settings, settings.formData.advancedForm.settings);
            reportController.calculateReport(currentChromeTabId);
            reportController.updateReportOverlay(currentChromeTabId, gridToggle.checked,
                settings.formData.reportForm.settings, settings.formData.advancedForm.settings);

        }, 0);
    });


    /**
     * Adds an event to the reset button
     * in order to reset all the values on
     * the grid to the default values in the
     * popup window.
     */
    advancedForm.addEventListener('reset', function () {

        // SetTimeout is used to delay the execution of this code and storage of the DOM state until AFTER the reset
        // event has finished resetting the form values - this reset event is fired BEFORE the DOM state has changed
        setTimeout(function () {
            var settings = settingStorageController.saveSettings(currentChromeTabId);
            gridController.updateGrid(currentChromeTabId, settings.formData.gridForm.settings, settings.formData.advancedForm.settings);
            reportController.calculateReport(currentChromeTabId);
            reportController.updateReportOverlay(currentChromeTabId, gridToggle.checked,
                settings.formData.reportForm.settings, settings.formData.advancedForm.settings);

        }, 0);
    });


    /**
     * Used to stop a user from incrementing the
     * number field to fast. This stops the event from
     * firing to fast and stops multiple grids
     * from appearing stacked on the page
     */
    var throttle = function (fn, threshhold, scope) {
        threshhold || (threshhold = 250);
        var last,
            deferTimer;
        return function () {
            var context = scope || this;
            var now = +new Date,
                args = arguments;
            if (last && now < last + threshhold) {
                // hold on to it
                clearTimeout(deferTimer);
                deferTimer = setTimeout(function () {
                    last = now;
                    fn.apply(context, args);
                }, threshhold);
            }
            else {
                last = now;
                fn.apply(context, args);
            }
        };
    };

    /**
     * Used to initialize the state of the popup window and inject in-page scripts.
     * Saves the current tab state, generates the grid, and calculates the report.
     */
    var init = function () {

        settingStorageController.init(gridForm, reportForm, advancedForm, tabContentContainer, tabLabelContainer);

        /**
         * Heartbeat pattern to determine whether content script is already inject
         * If not it will be injected.
         */
        chrome.tabs.sendMessage(currentChromeTabId, {greeting: "hello"}, function (response) {

            if (response) {
                console.log("Design Grid Overlay JS already injected.");
                reportController.calculateReport(currentChromeTabId);

                // Load all stored settings from chrome local storage, and then update the report overlay
                settingStorageController.loadSettings(currentChromeTabId, function (settings) {
                    reportController.updateReportOverlay(currentChromeTabId, gridToggle.checked,
                        settings.formData.reportForm.settings, settings.formData.advancedForm.settings);
                });
            }
            else {
                console.log("Design Grid Overlay JS not already injected, injecting now.");
                chrome.tabs.executeScript(currentChromeTabId, {file: "src/executedScripts/grid.js"});
                chrome.tabs.executeScript(currentChromeTabId, {file: "src/executedScripts/calcReport.js"}, function () {
                    reportController.calculateReport(currentChromeTabId);

                    // Load all stored settings from chrome local storage, and then update the report overlay
                    settingStorageController.loadSettings(currentChromeTabId, function (settings) {
                        reportController.updateReportOverlay(currentChromeTabId, gridToggle.checked,
                            settings.formData.reportForm.settings, settings.formData.advancedForm.settings);
                    });
                });
            }
        });


        //Grid form event binding
        var gridFormInputs = gridForm.getElementsByTagName('input');
        for (var i = 0; i < gridFormInputs.length; i++) {
            gridFormInputs[i].addEventListener("change", throttle(function (event) {
                if (event.target.id !== 'gridToggle') {
                    //Updated just grid and report calculations
                    var settings = settingStorageController.saveSettings(currentChromeTabId);
                    gridController.updateGrid(currentChromeTabId, settings.formData.gridForm.settings, settings.formData.advancedForm.settings);
                    reportController.calculateReport(currentChromeTabId);
                }
            }, 1000));
        }

        //Report form input event binding
        var reportFormInputs = reportForm.getElementsByTagName('input');
        for (var i = 0; i < reportFormInputs.length; i++) {
            reportFormInputs[i].addEventListener("change", throttle(function (event) {
                if (event.target.id !== 'gridToggle') {
                    //Update just report overlay
                    var settings = settingStorageController.saveSettings(currentChromeTabId);
                    reportController.updateReportOverlay(currentChromeTabId, gridToggle.checked,
                        settings.formData.reportForm.settings, settings.formData.advancedForm.settings);
                }
            }, 1000));
        }

        //Advanced form input event binding
        var advancedFormInputs = advancedForm.getElementsByTagName('input');
        for (var i = 0; i < advancedFormInputs.length; i++) {
            advancedFormInputs[i].addEventListener("change", throttle(function (event) {
                if (event.target.id !== 'gridToggle') {
                    //Update grid, report, report overlay
                    var settings = settingStorageController.saveSettings(currentChromeTabId);
                    reportController.calculateReport(currentChromeTabId);
                    gridController.updateGrid(currentChromeTabId, settings.formData.gridForm.settings, settings.formData.advancedForm.settings);
                    reportController.updateReportOverlay(currentChromeTabId, gridToggle.checked,
                        settings.formData.reportForm.settings, settings.formData.advancedForm.settings);
                }
            }, 1000));
        }

    };

    /**
     * Return the publicly accessible methods
     */
    return {
        init: init
    }

})();
