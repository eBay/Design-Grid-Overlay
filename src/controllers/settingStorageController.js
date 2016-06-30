/**
 * Responsible for generating the report in
 * the popup.
 */
var settingStorageController = (function () {

    /**
     * A placeholder value to put into our globalSettings in order for each
     * key to show up in our data structure (rather than 'undefined') when
     * we fill those values in from chrome local storage
     *
     */
    var EMPTY_VALUE = "EMPTY_VALUE";

    /**
     * HTML Element that contains our tab buttons
     */
    var tabContentContainer = null;
    var tabLabelContainer = null;


    /**
     * Data structure that stores, in memory, the captured settings of each form
     * in this extension. This data structure is modified each time settings are loaded
     * or stored into chrome local storage, in the saveSettings() and loadSettings() functions
     * below
     *
     */
    var globalSettings = {
        // UI Tab stored state
        activeTabPanelId: EMPTY_VALUE,
        activeTabLabelId: EMPTY_VALUE,
        // Form data for grid settings
        formData: {
            gridForm: {
                formElement: undefined, //Stored HTML element for this form - set by init() func, but not stored into chrome sync local storage
                settings: {
                    // Each of these settings keys maps to an input HTML element with the same id
                    largeWidth: EMPTY_VALUE,
                    largeColumns: EMPTY_VALUE,
                    smallColumns: EMPTY_VALUE,
                    viewports: EMPTY_VALUE,
                    smallWidth: EMPTY_VALUE,
                    gutters: EMPTY_VALUE,
                    outterGutters: EMPTY_VALUE,
                    mobileInnerGutters: EMPTY_VALUE,
                    mobileOutterGutters: EMPTY_VALUE,
                    offsetX: EMPTY_VALUE
                }
            },
            //Form data for report settings (size overlay)
            reportForm: {
                formElement: undefined, //Stored HTML element for this form - set by init() func, but not stored into chrome sync local storage
                settings: {
                    // Each of these settings keys maps to an input HTML element with the same id
                    reportOverlayToggle: EMPTY_VALUE,
                    reportOverlaySelector: EMPTY_VALUE,
                    reportOverlayMatchEmptyElements: EMPTY_VALUE
                }
            },
            //Form data for advanced settings
            advancedForm: {
                formElement: undefined, //Stored HTML element for this form - set by init() func, but not stored into chrome sync local storage
                settings: {
                    // Each of these settings keys maps to an input HTML element with the same id
                    color: EMPTY_VALUE,
                    overlayLabelColor: EMPTY_VALUE,
                    overlayTextColor: EMPTY_VALUE,
                    hideHiddenElementOverlays: EMPTY_VALUE
                }
            }
        }
    };

    /**
     * Method that captures the UI state of the HTML tab UI, and saves it for storage
     *
     * @param dataToStoreObject - Data storage object to put Tab UI state into
     * @returns the tab state data pulled from the HTML UI and put into the given data storage object
     */
    function saveTabStates(dataToStoreObject) {

        var activeTabPanel = tabContentContainer.querySelector("div[aria-hidden='false']");
        var activeTabLabel = tabLabelContainer.querySelector("div[aria-selected='true']");

        dataToStoreObject.activeTabPanelId = activeTabPanel.id;
        dataToStoreObject.activeTabLabelId = activeTabLabel.id;


        return dataToStoreObject;
    }


    /**
     * Retrieves the Tab UI state from provided data input and sets the tab label with id corresponding
     * to the given tabLabelId to active, and the tab panel corresponding the given tab panel id as visible
     * @param loadedObjectData - data loaded from storage, which we use to set our HTML Tab UI
     */
    function loadTabState(loadedObjectData) {

        if (loadedObjectData.activeTabPanelId && loadedObjectData.activeTabLabelId) {

            var activeTabPanel = document.getElementById(loadedObjectData.activeTabPanelId);
            var activeTabLabel = document.getElementById(loadedObjectData.activeTabLabelId);

            //First hide all tab panels and tab labels

            var allTabPanels = tabContentContainer.getElementsByClassName('tab');
            var allTabLabels = tabLabelContainer.getElementsByClassName('tabLabel');

            for (var i = 0; i < allTabPanels.length; i++) {
                allTabPanels[i].setAttribute('aria-hidden', true);
            }

            for (var j = 0; j < allTabLabels.length; j++) {
                allTabLabels[j].setAttribute('aria-selected', false);
            }

            // Now show active tab panel and select active tab label
            activeTabPanel.setAttribute('aria-hidden', false);
            activeTabLabel.setAttribute('aria-selected', true);
        }
    }

    /**
     * Goes into local storage and pulls out settings that are saved in the current
     * tab. If no settings are saved, the default value is used that is specified in the html
     * for the popup. After loading, the state is saved immediately,
     * which syncs the loaded UI state with our in-memory globalSettings object, and ensures
     * that any default settings are also saved into chrome's local storage
     */
    function loadSettings(currentChromeTabId, callback) {
        chrome.storage.sync.get(currentChromeTabId.toString(), function (storedData) {


            //Override the local var with the actual data we want to load, which is for this specific tab
            //The local data storage is stored by keys that are our TabID's given to us by chrome
            storedData = storedData[currentChromeTabId.toString()] || {formData: {}};


            // Load active UI tab data
            loadTabState(storedData);

            // Look at our global settings formData for list of all forms we are synchronizing,
            // As well as the names of each setting ID for mapping to HTML element id
            for (var formName in globalSettings.formData) {


                // Fill in stored data with blank data if no settings found
                if (!storedData.formData[formName]) {
                    storedData.formData[formName] = {settings: {}};

                }


                var storedFormData = storedData.formData[formName].settings;
                var formData = globalSettings.formData[formName];
                var formElement = formData.formElement;
                var htmlInputs = formElement.getElementsByTagName('input');

                // Pull all HTML UI state into settings fields, and put default values in if those fields
                // don't exist in the stored data
                for (var settingId in formData.settings) {

                    if (htmlInputs[settingId].type == "number" || htmlInputs[settingId].type == "text") {
                        if (storedFormData && storedFormData[settingId]) {
                            if (storedFormData[settingId].length > 0) {
                                htmlInputs[settingId].value = storedFormData[settingId];
                            }
                        }
                    }
                    else if (htmlInputs[settingId].type == "checkbox") {
                        htmlInputs[settingId].checked = storedFormData[settingId] ? storedFormData[settingId] : htmlInputs[settingId].checked
                    }

                }
            }


            // Save our data structure back to storage, to store any default values
            // This save call will also sync our UI state with our in-memory global settings object
            saveSettings(currentChromeTabId);

            if (callback) {
                callback(globalSettings);
            }
        });

    }

    /**
     * Saves all UI settings state into chrome local storage as well
     *
     * @param formDataMapping - Object with with this structure:
     *   {formName: { formElement: <HTMLElement>, settings: {<settingId>: <settingValue>} }, formName2: {..}, ...}
     *   formName keys are the stored name of the form data, the formElement
     *   is the form HTML element that contains our UI form, and setting is an object storing the
     *   id of the setting, which is the same as the HTML element id, and the state of that setting
     * @returns Filled in form data mapping pulled from our form UI
     */
    function saveSettings(currentChromeTabId) {

        var dataToStore = {};

        dataToStore[currentChromeTabId] = {
            formData: {}
        };


        // Pull the current UI tab states from the HTML, and put them in our object for storage
        dataToStore[currentChromeTabId] = saveTabStates(dataToStore[currentChromeTabId]);

        // Sync the UI tab state to our in-memory data while we are saving it
        globalSettings.activeTabLabelId = dataToStore[currentChromeTabId].activeTabLabelId;
        globalSettings.activeTabPanelId = dataToStore[currentChromeTabId].activeTabPanelId;


        //Go through each settings ID in each form and pull the data from the HTML state into an object for storage
        for (var formName in globalSettings.formData) {

            var inMemoryFormData = globalSettings.formData[formName];
            var formElement = inMemoryFormData.formElement;
            var htmlInputs = formElement.getElementsByTagName('input');

            var storedFormData = {
                settings: {}
            };


            // Pull all HTML UI state into settings fields for storage, as well as into in-memory settings object
            for (var settingId in inMemoryFormData.settings) {
                if (htmlInputs[settingId].type == "number" || htmlInputs[settingId].type == "text") {
                    storedFormData.settings[settingId] = htmlInputs[settingId].value;
                }
                else if (htmlInputs[settingId].type == "checkbox") {
                    storedFormData.settings[settingId] = htmlInputs[settingId].checked || false;
                }

                //Sync UI state data that is about to be stored into our settings object to our in-memory storage as well
                inMemoryFormData.settings[settingId] = storedFormData.settings[settingId];
            }

            dataToStore[currentChromeTabId].formData[formName] = storedFormData;
        }

        chrome.storage.sync.set(dataToStore);

        return dataToStore[currentChromeTabId];
    }

    function getSettings() {
        return globalSettings;
    }

    /**
     * This method tells our internal functions which HTML elements are needed
     * to save and load UI data into both in-memory and Chrome local storage
     *
     * @param gridFormElement - UI form HTML element for grid settings
     * @param reportFormElement - UI form HTML element for report settings
     * @param advancedFormElement - UI form HTML element for advanced settings
     * @param tabContentContainerElem - HTML element that wraps all the tab panels
     * @param tabLabelContainerElem - HTML element that contains the extension settings UI tab labels you click on
     */
    function init(gridFormElement, reportFormElement, advancedFormElement, tabContentContainerElem, tabLabelContainerElem) {

        globalSettings.formData.gridForm.formElement = gridFormElement;
        globalSettings.formData.reportForm.formElement = reportFormElement;
        globalSettings.formData.advancedForm.formElement = advancedFormElement;
        tabContentContainer = tabContentContainerElem;
        tabLabelContainer = tabLabelContainerElem;
    }

    /**
     * Publicly accessible methods
     */
    return {
        init: init,
        loadSettings: loadSettings,
        saveSettings: saveSettings,
        getSettings: getSettings
    }
})();
