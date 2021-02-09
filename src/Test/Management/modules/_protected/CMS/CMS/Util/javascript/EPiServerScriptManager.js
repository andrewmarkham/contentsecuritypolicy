/*
 * episerverscriptmanager.js - JavaScript support routines for EPiServer
 * Copyright (c) 2007 EPiServer AB
*/
var EPi;
if (!EPi) {
    EPi = {};
}
EPi._loadEvents = new Array();
// ------------------------
// Traversing DOM
// ------------------------


// Returns the ASP.NET form
EPi.GetForm = function () {
    if (window.theForm) {
        // theForm is a global reference to the main form specified by asp.net.
        return theForm;
    } else {
        return document.forms[0];
    }
}

// GetDocument returns the document for the supplied window object.
// Useful to get the document object for an iframe.
EPi.GetDocument = function (windowObject) {
    var doc = null;
    if (windowObject) {
        try {
            if (windowObject.contentDocument) {
                // For Gecko
                doc = windowObject.contentDocument;
                try {
                    // Gecko fails with permission denied when you try to access document
                    // properties and methods, but the error object is just a string.
                    var tmp = doc.location;
                }
                catch (e) {
                    return null;
                }
            } else if (windowObject.contentWindow) {
                // For >= IE5.5
                doc = windowObject.contentWindow.document;
            } else if (windowObject.document) {
                // For IE5
                doc = windowObject.document;
            }
        }
        catch (exception) {
            if ((exception.number & 0xFFFF) == 5) // Access denied
            {
                // If we get access denied for some frame we ignore it, since we're not allowed to script against that window.
                doc = null;
            } else {
                throw exception;
            }
        }
    }
    return doc;
}
// GetDocumentWindow returns the window object for the supplied DOM node object.
EPi.GetDocumentWindow = function (node) {
    if (node && node.nodeType != 9) // nodeType: 9 = document
    {
        node = node.ownerDocument;
    }
    if (node.defaultView) {
        // Gecko
        return node.defaultView;
    } else if (node.parentWindow) {
        // IE
        return node.parentWindow;
    }
}

// GetWindowSize returns the innerWidth and innerHeight as an array (innerWidth, innerHeight)
// of the supplied window (or top window if no window as argument).
EPi.GetWindowSize = function (win) {
    if (!win) {
        var win = window.top;
    }
    var innerWidth;
    var innerHeight;

    if (win.innerWidth) {
        innerWidth = win.innerWidth;
        innerHeight = win.innerHeight;
    } else if (win.document) {
        if (win.document.documentElement.clientWidth) {
            innerWidth = win.document.documentElement.clientWidth;
            innerHeight = win.document.documentElement.clientHeight;
        } else {
            innerWidth = win.document.body.clientWidth;
            innerHeight = win.document.body.clientHeight;
        }
    }

    return [innerWidth, innerHeight];
}



// Returns an array of elements containing the specified className
EPi.GetElementsByClassName = function (tagName, className, parentNode) {
    return EPi.GetElementsByAttribute(tagName, "className", className, parentNode, true);
}

// Returns an array of elements with the certain attributeName (and if attributeValue is specified with the certain attributeValue).
// Optional tagName. If not specified searches all tagNames.
// Optional parentNode. Start search from here. If not specified searches complete page.
// Optional doSearchInAttribute.
// Example:
// var nodeArray = EPi.GetElementsByAttribute("input", "type", "text") returns all <input type="text" ... /> in page.
// var nodeArray = EPi.GetElementsByClassName(null, "hidden", document.getElementById("elementContainer"));
// returns an array of elements of any type with one of its classNames set to "hidden".
EPi.GetElementsByAttribute = function (tagName, attributeName, attributeValue, parentNode, doSearchInAttribute) {
    if (!tagName) {
        tagName = "*";
    }
    if (!parentNode) {
        parentNode = document;
    }

    var childNodes = parentNode.getElementsByTagName(tagName);
    var i;
    var matchingNodesArray = new Array();

    if (doSearchInAttribute) {
        var pattern = new RegExp(attributeValue);
    }

    for (i = 0; i < childNodes.length; i++) {
        if (doSearchInAttribute && pattern.test(childNodes[i][attributeName])) {
            matchingNodesArray.push(childNodes[i]);
        } else if (attributeValue == null || childNodes[i][attributeName] == attributeValue) {
            matchingNodesArray.push(childNodes[i]);
        }
    }
    return matchingNodesArray;
}

EPi.GetCurrentStyle = function (element, styleProperty) {
    if (element.currentStyle) {
        return element.currentStyle[styleProperty];
    } else if (document.defaultView && document.defaultView.getComputedStyle) {
        // Due to bug in mozilla we cant get Computed Style if the window containing
        // document is display: none.
        try {
            var computedStyles = document.defaultView.getComputedStyle(element, null);

            if (!computedStyles) {
                return null;
            }
            return computedStyles[styleProperty];
        }
        catch (e) {
            return null;
        }
    }
}

// Used to make overloaded Add and Remove Event methods. Value is either a domObject or a domId. Returns a domObject.
EPi._GetDomObject = function (value) {
    if (typeof (value) != "object" && document.getElementById(value)) {
        value = document.getElementById(value);
    }
    return value;
}

// Translates the IE mouse button information to comply with DOM Level 2 standard
EPi.TranslateIEMouseButton = function (button) {
    //IE9 added some W3C compartibility supports, including value of the event object's button property.
    //And addEventListener as well.
    //So, we use addEventListener to detect if the browse handle button in standard way or not.
    if (window.addEventListener) {
        return button;
    }

    // IE Left Mouse Button
    if (button == 1) {
        return 0;
    }
    // IE Right Mouse Button
    if (button == 2) {
        return 2;
    }
    // IE Middle Mouse button
    if (button == 4) {
        return 1;
    }
    return void (0); //undefined
}


// Event Handling
// - Adding and removing eventListeners.
// In DOM compliant browsers (uses addEventListener, removeEventListener) it works as normal
// while in IE (uses attachEvent, detachEvent) we pass a custom event object as argument to the eventHandler.
// This custom event object has the most commnly used properties as the DOM event object and also includes
// the IE event object in a property _event.
// In IE we use the call method with the DOM object as context in order to make "this" in the eventHandler
// refer to the domObject. (Like in the DOM event model).
// In IE eventhandlers are added to a custom array property on the DOM node and called via a custom event
// handler attached to the DOM object.
// This makes it necessary to clean up the added events and eventHandlers in IE
// on unloading page which is done automatically with EPi._EventCleaner
EPi.AddEventListener = function (domRef, eventType, eventHandler) {
    var domObject = EPi._GetDomObject(domRef);
    // Special handling of window.load events.
    // window load events is run by EPi._InitManagerObjects which also has the doOnload property
    if (domObject == window && eventType == "load" && !eventHandler.doOnload) {
        // Check if this event is already added.
        for (var i = 0; i < EPi._loadEvents.length; i++) {
            if (EPi._loadEvents[i] == eventHandler) {
                return;
            }
        }
        EPi._loadEvents[EPi._loadEvents.length] = eventHandler;
        return;
    } else if (eventHandler.doOnload) {
        eventHandler = eventHandler.Handler;
    }

    if (eventType == "submit" && EPi.Form && !EPi.Form._isRegistered) {
        EPi.Form.SetOnSubmit();
    }

    // DOM
    if (domObject.addEventListener) {
        if (eventType == "submit" && EPi.Form) {
            eventType = "episubmit";
        }
        domObject.addEventListener(eventType, eventHandler, false);
    }
    // IE
    else if (domObject.attachEvent) {
        // Don't register the same eventHandler and eventType on the same domObject multiple times
        if (!domObject["_epi" + eventType]) {
            domObject["_epi" + eventType] = new Array();
            domObject["_epiEventHandler" + eventType] = function (e) {
                return EPi._ExecuteEventHandlers.call(domObject, e);
            };
            domObject.attachEvent("on" + eventType, domObject["_epiEventHandler" + eventType]);

            if (EPi._EventCleaner._doMemoryClean && domObject != window && domObject.nodeType != 9 /*document*/) {
                var unloadObj = {domObject: domObject, eventType: eventType};
                EPi._EventCleaner._objectsToClean[EPi._EventCleaner._objectsToClean.length] = unloadObj;
            }
        }

        var handlerArray = domObject["_epi" + eventType];
        for (var i = 0; i < handlerArray.length; i++) {
            if (handlerArray[i] == eventHandler)
                return;
        }

        handlerArray[handlerArray.length] = eventHandler;
    }
}

//Private IE helper method for execution of event handlers added to an _epi[eventType] property of DOM objects.
EPi._ExecuteEventHandlers = function (e) {
    if (!e) {
        e = window.event;
    }

    // early return before creating customEvent object
    // Check that the event handler array exists. Under some circumstances this is not the case.
    // For instance, when the unload event fires after navigating to an XML Feed.
    if (!this["_epi" + e.type]) {
        return;
    }

    // Create a custom event object
    var customEvent = {
        _event: e,
        type: e.type,
        target: e.srcElement,
        currentTarget: this,
        button: EPi.TranslateIEMouseButton(e.button),
        clientX: e.clientX, clientY: e.clientY,
        screenX: e.screenX, screeenY: e.screenY,
        altKey: e.altKey, ctrlKey: e.ctrlKey,
        shiftKey: e.shiftKey, charCode: e.keyCode, keyCode: e.keyCode,
        stopPropagation: function () {
            this._event.cancelBubble = true;
        },
        preventDefault: function () {
            this._event.returnValue = false;
        }
    }

    // The handlerArray includes all the event handlers for the current event type
    // and to be sure all of these are executed we use Array.concat() to copy the array.
    // An event handler might stop listening to this event when executed which changes the length of the original array.
    var handlerArray = this["_epi" + customEvent.type].concat();
    var returnValue;
    for (var i = 0; i < handlerArray.length; i++) {
        if (handlerArray[i])
            returnValue = handlerArray[i].call(this, customEvent);
    }

    if (customEvent.returnValue !== undefined) {
        e.returnValue = customEvent.returnValue;
    }

    if (returnValue !== undefined) {
        return returnValue;
    }
}

EPi.RemoveEventListener = function (domRef, eventType, eventHandler) {
    if (domObject == window && eventType == "load" && !eventHandler.doOnload) {
        return;
    } else if (eventHandler.doOnload) {
        eventHandler = eventHandler.Handler;
    }

    var domObject = EPi._GetDomObject(domRef);

    // DOM
    if (domObject && domObject.removeEventListener) {
        domObject.removeEventListener(eventType, eventHandler, false);
    }
    // IE
    else if (document.detachEvent) {
        if (domObject["_epi" + eventType]) {
            for (var i = 0; i < domObject["_epi" + eventType].length; i++) {
                if (domObject["_epi" + eventType][i] == eventHandler) {
                    if (domObject["_epi" + eventType].splice) {
                        domObject["_epi" + eventType].splice(i, 1);
                        if (domObject["_epi" + eventType].length == 0) {
                            // No listeners left; detach and dispose the execute helper.
                            EPi._IEDisposeEventHandlers(domObject, eventType);
                        }
                    } else {
                        // If IE version is lower than 5.5 splice isn't implemented
                        domObject["_epi" + eventType][i] = null;
                    }
                    break;
                }
            }
        }
    }
}

// WindowLoadListener is an easier way to add a load eventListener.
EPi.AddWindowLoadListener = function (eventHandler) {
    EPi.AddEventListener(window, "load", eventHandler);
}

// DispatchEvent is used to fire an event on a node through javascript without user interaction.
// Dispatch event can behave different for different kind of events so use with caution and thorough testing.
// The return value indicates whether any of the listeners which handled the event called preventDefault.
// If preventDefault was called the value is false, else the value is true.
EPi.DispatchEvent = function (target, eventType) {
    var e;
    // If the eventType is string create a new eventObject
    if (typeof (eventType) == "string") {
        // DOM
        if (document.createEvent) {
            var eventText = "";
            if (eventType.match("click") || eventType.match("mouse")) {
                eventText = "Mouse";
            }

            e = document.createEvent(eventText + "Events");
            e.initEvent(eventType, true, true);
        }
        // IE
        else if (document.createEventObject) {
            e = document.createEventObject();
            e.type = eventType;
        } else {
            return;
        }
    } else {
        e = eventType;
    }

    // Dispatch the event
    // DOM
    if (target.dispatchEvent) {
        return target.dispatchEvent(e);
    }
    // IE
    else if (target.fireEvent) {
        return target.fireEvent("on" + e.type, e);
    }
}

// Clean up of memory in IE
// Due to the memory leak problems we manually clean up
// events and eventhandlers when unloading page.
EPi._EventCleaner = {
    _doMemoryClean: false,
    _objectsToClean: new Array(),
    _CleanMemory:   function () {
        var i, o;
        var len = EPi._EventCleaner._objectsToClean.length;
        for (i = 0; i < len; i++) {
            o = EPi._EventCleaner._objectsToClean[i];
            // Try to detach the event handler.
            // o.domObject could already be disposed which would throw an exception.
            // but it also makes it unnecessary to dispose the event.
            try {
                EPi._IEDisposeEventHandlers(o.domObject, o.eventType);
            }
            catch (ex) {

            }
        }
    }
}

// Detach event handler executer method and clean up references from domObject to event handlers.
EPi._IEDisposeEventHandlers = function (domObject, eventType) {
    domObject.detachEvent("on" + eventType, domObject["_epiEventHandler" + eventType]);

    domObject["_epi" + eventType] = null;
    domObject["_epiEventHandler" + eventType] = null;

    if (domObject.removeAttribute) // Document doesn't support removeAttribute
    {
        domObject.removeAttribute("_epi" + eventType);
        domObject.removeAttribute("_epiEventHandler" + eventType);
    }
}

// Add unload Clean handler for IE
if (window.attachEvent) {
    EPi._EventCleaner._doMemoryClean = true;
    window.attachEvent("onunload", EPi._EventCleaner._CleanMemory);
}

// Register PropertyObject
// Used to store properties on a domNode
EPi.RegisterPropertyObject = function (domReference, objectKey, objectSettings) {
    var domObject = EPi._GetDomObject(domReference);

    if (!domObject[objectKey]) {
        domObject[objectKey] = objectSettings;
        return;
    }
    for (var p in objectSettings) {
        domObject[objectKey][p] = objectSettings[p];
    }
}

// Init of events and properties added by
// EPiServer ScriptManager
EPi._InitManagerObjects = {}
EPi._InitManagerObjects.doOnload = true;
EPi._InitManagerObjects.Handler = function (e) {

    if (EPi.SetupPropertyObjects) {
        EPi.SetupPropertyObjects(e)
    }

    if (EPi.SetupEvents) {
        EPi.SetupEvents(e);
    }

    // In page editing we need to execute code before the load events.
    // I.e. need to alter dialog handling before the EPi.Dialog.Close() is executed
    // See: epi.cms.widget.DialogWrapper._onIframeLoad
    window.setTimeout(function () {
        for (var i = 0; i < EPi._loadEvents.length; i++) {
            EPi._loadEvents[i].call(window, e);
        }
    }, 1);
}

EPi.AddWindowLoadListener(EPi._InitManagerObjects);


// Used to get the named property of the node or the property
// of the common propertyobject specified for the node.
EPi.GetProperty = function (node, propertyName, propertySuffix, parsePlaceholders) {

    if (typeof (parsePlaceholders) == "undefined") {
        parsePlaceholders = true;
    }

    if (!node || !node.EPiObject) {
        return null;
    }

    var returnValue = null;

    if (propertySuffix != null) {
        returnValue = EPi.GetProperty(node, propertyName + propertySuffix, null);
        if (returnValue)
            return returnValue;
    }

    if (node.EPiObject[propertyName] !== undefined) {
        returnValue = node.EPiObject[propertyName];
    } else if (node.EPiObject.commonScriptObject) {
        returnValue = window[node.EPiObject.commonScriptObject][propertyName];
    }

    if (parsePlaceholders && typeof (returnValue) == "string") {
        returnValue = EPi.PropertyParse(node, returnValue);
    }
    return returnValue;

}

// Used to create or update the value of a named property for a node.
EPi.SetProperty = function (node, propertyName, propertyValue) {
    if (!node.EPiObject)
        node["EPiObject"] = {};
    node.EPiObject[propertyName] = propertyValue;
}

// Searches a string property and replaces any found [xxx] with
// object.xxx using EPi.GetProperty (to possibly get global propertyObjects xxx)
EPi.PropertyParse = function (object, stringToParse) {
    var match = stringToParse.match(/\[.[^\[\]]*\]/g);
    if (!match) {
        return stringToParse;
    }

    var i, m, propertyName, propertyValue, len;
    len = match.length;
    for (i = 0; i < len; i++) {
        m = match[i];
        propertyName = m.substr(1, m.length - 2);
        propertyValue = EPi.GetProperty(object, propertyName, null, false);
        if (propertyValue) {
            stringToParse = stringToParse.replace(m, propertyValue);
        } else {
            stringToParse = stringToParse.replace(m, "");
        }
    }
    return stringToParse;
}

// ConfirmMessage eventhandler.
// Requires a confirmMessage property specified on the node which added the eventListener.
// The confirmMessage could either be set as node.EPiObject.confirmMessage or on the global propertyObject.
// The property confirmCondition
EPi.ConfirmMessage = function (e, suffix) {
    var confirmMessage = EPi.GetProperty(this, "confirmMessage", suffix);
    var confirmCondition = EPi.GetProperty(this, "confirmCondition", suffix);
    var postConfirmScript = EPi.GetProperty(this, "postConfirmHandler", suffix);

    if (confirmMessage != null && EPi.EvalCondition.call(this, e, confirmCondition, true)) {
        var confirmResult = confirm(confirmMessage);
        if (!confirmResult && e.preventDefault) {
            e.preventDefault();
            e.stopPropagation();
        }
        if (postConfirmScript && typeof (postConfirmScript) == "function") {
            postConfirmScript.call(this, e, confirmResult);
        }
    }
}

// AlertMessage event handler.
// Requires a alertMessage property specified on the node which added the eventListener.
// The confirmMessage could either be set as node.EPiObject.confirmMessage or on the global propertyObject.
EPi.AlertMessage = function (e) {
    var alertMessage = EPi.GetProperty(this, "alertMessage");
    var alertCondition = EPi.GetProperty(this, "alertCondition");

    if (alertMessage && EPi.EvalCondition.call(this, e, alertCondition, true)) {
        alert(alertMessage);
    }
}

// EvalCondition helper method
// Calls the method specified in the parameter conditionalCode in the current context and returns the status
// If conditionalCode itself returns a functio reference this function is called in the same way and its value is returned.
EPi.EvalCondition = function (e, conditionalCode, defaultValue) {
    var result = false;

    if (conditionalCode == null)
        return defaultValue;

    result = conditionalCode.call(this, e);

    if (typeof (result) == "function")
        result = result.call(this, e);

    return result;
}

// Focus and possibly select the text of an input element
EPi.FocusElement = function (clientId, focusElement, selectElement) {
    var targetElement = document.getElementById(clientId);

    if (targetElement != null) {
        if (focusElement && !targetElement.disabled)
            targetElement.focus();
        //Check if select is defined for the element. Only input elements supports select.
        if (selectElement && targetElement.select)
            targetElement.select();
    }
}

// PageLeaveCheck is used to prevent accidently leaving page without save/cancel.
// Usage: Add the EPi.PageLeaveCheck.Initalize to the window.load event.
// or on server side add the PageLeaveCheckEvent.
// To make save buttons and such able to leave page without triggering pageLeaveCheck
// add the DisablePageLeaveCheckEvent to the button while on server side.
// Traverses the document and adds event listeners to input of type text, radio, checkbox, password, file
// as well as select lists and textareas.
// The editor adds itself to this list by using the PageLeaveCheck.AddToChecklist method by adding a method
// that returns true or false if the user made changes to it ot not.
// If EPi.PageLeaveCheck.enabled is set to false no pageLeave check will occur.


EPi.PageLeaveCheck = {
    enabled: false,
    _initialized: false,
    _pageChanged: false,
    _InputChange: function () {
                        EPi.PageLeaveCheck._pageChanged = true;
                    },
    // Default pageLeave message. Only used if no message specified on server side.
    confirmMessage: "You have unsaved changes!",
    checklist: null,
    trigger: null
}

EPi.PageLeaveCheck.Initialize = function (e) {
    EPi.PageLeaveCheck.enabled = true;
    if (EPi.PageLeaveCheck._initialized) {
        return;
    }

    // IE has a very bad way of preventing the javascript submit by throwing an error
    // if the user clicks cancel in the onbeforeunload confirm message
    // why we rewrite the submit and enclosing it with a try catch block.
    // This change is unnecessary (though harmless) in firefox hence the check for document.all (IE)
    if (document.all) {
        var originalForm = EPi.GetForm();
        var originalSubmit = originalForm.submit;

        originalForm.submit = function () {
            try {
                originalSubmit.apply(originalForm, arguments);
            }
            catch (ex) {
                // Only allow this kind of exception
                if (ex.number && ((ex.number & 0xFFFF) != 16389)) {
                    throw(ex);
                }
            }
        };
    }

    var i, count, eventType;
    var inputElements = EPi.GetElementsByAttribute("input", "type");

    count = inputElements.length;
    for (i = 0; i < inputElements.length; i++) {
        switch (inputElements[i].type.toUpperCase())
        {
            case "TEXT":
            case "RADIO":
            case "PASSWORD":
            case "FILE":
            case "CHECKBOX":
                eventType = "change";
                break;
            default:
                eventType = null;
                break;
        }
        if (eventType != null && !inputElements[i].hasAttribute("data-exclude-from-page-leave-check")) {
            EPi.AddEventListener(inputElements[i], eventType, EPi.PageLeaveCheck._InputChange);
        }
    }

    var textAreas = document.getElementsByTagName("textarea");
    count = textAreas.length;
    for (i = 0; i < textAreas.length; i++) {
        EPi.AddEventListener(textAreas[i], "change", EPi.PageLeaveCheck._InputChange);
    }

    var selects = document.getElementsByTagName("select");
    count = selects.length;
    for (i = 0; i < selects.length; i++) {
        EPi.AddEventListener(selects[i], "change", EPi.PageLeaveCheck._InputChange);
    }

    // pageLeaveMessage holds translated text, defined from server side when adding PageLeaveCheck to page.
    if (window.EPiObject && window.EPiObject.pageLeaveMessage) {
        EPi.PageLeaveCheck.confirmMessage = window.EPiObject.pageLeaveMessage;
    }

    EPi.PageLeaveCheck._initialized = true;
    EPi.AddEventListener(window, "beforeunload", EPi.PageLeaveCheck._UnloadHandler);
}

// Register your script application to EPiServer's change detection by calling this function.
// The 'func' argument is a function object that will be called before leaving the page, if page
// is left without saving, to find out if there are any changes that would get lost.
// If there are any unsaved changes the function should return true, otherwise false.
EPi.PageLeaveCheck.AddToChecklist = function (func) {
    if (!EPi.PageLeaveCheck.checklist) {
        EPi.PageLeaveCheck.checklist = new Array();
    }
    EPi.PageLeaveCheck.checklist.push(func);
}

// Set the changed status of the page
// true = "Changed"; false = "Not changed"
EPi.PageLeaveCheck.SetPageChanged = function (bool) {
    EPi.PageLeaveCheck._pageChanged = bool;

    // Only the "Not Changed" state have to be propagated to the checklist.
    // If the _pageChanged state is set to "Changed" (true) checklist state is ignored.
    if (bool == false) {
        if (EPi.PageLeaveCheck.checklist) {
            var checklist = EPi.PageLeaveCheck.checklist;
            for (var i = 0; i < checklist.length; i++) {
                checklist[i](bool);
            }
        }
    }
}

// Returns true if the page has been changed, otherwise false
EPi.PageLeaveCheck.HasPageChanged = function () {
    // In IE force leave focus of input field.
    if (document.body) {
        document.body.focus();
    }

    if (EPi.PageLeaveCheck._pageChanged)
        return true;

    var isPageChanged = false;
    var checklist = EPi.PageLeaveCheck.checklist;
    var i;
    len = checklist ? checklist.length : 0;
    for (i = 0; i < len; i++) {
        if (checklist[i]()) {
            isPageChanged = true;
            break;
        }
    }
    return isPageChanged;
}


// Eventhandler for document. These Event listeners are dynamically added to document level on server side for
// the type of events (usually "click") the buttons and such implement to do a PageLeave that is ok.
// EPiObject.pageLeaveOk is a property on the domObject triggering this event.
EPi.PageLeaveCheck.SetTrigger = function (e) {
    EPi.PageLeaveCheck.TraverseTrigger(e.target);
}
EPi.PageLeaveCheck.TraverseTrigger = function (trigger) {
    if (trigger == document) {
        EPi.PageLeaveCheck.trigger = null;
    } else if (trigger && trigger.EPiObject && trigger.EPiObject.pageLeaveOk) {
        EPi.PageLeaveCheck.trigger = trigger;
    } else if (trigger && trigger.parentNode) {
        EPi.PageLeaveCheck.TraverseTrigger(trigger.parentNode);
    }
}

EPi.PageLeaveCheck._UnloadHandler = function (e) {
    if (!EPi.PageLeaveCheck.enabled || EPi.PageLeaveCheck.trigger != null) {
        return;
    }

    var isPageChanged = EPi.PageLeaveCheck.HasPageChanged();

    if (!isPageChanged) {
        return;
    }

    e = e || window.event;

    // For IE and Firefox prior to version 4
    if (e) {
        e.returnValue = EPi.PageLeaveCheck.confirmMessage;
    }

    // For Safari and Chrome
    return EPi.PageLeaveCheck.confirmMessage;
}


// Scripts for ClientScript.WebControls.ScriptToggleDisplayEvent
EPi.ToggleDisplay = {};

// toggleNodeIds contains references to all toggleNodes and is used to hide all toggleNodes. (Set by ScriptToggleDisplayEvent)
EPi.ToggleDisplay.toggleReferences = {};

// Hide all toggleNodes on page(on window.load).
EPi.ToggleDisplay.Initialize = function (e) {
    if (!EPi.ToggleDisplay.toggleReferences.EPiObject) {
        return;
    }
    var node, toggleNode, image;

    for (var id in EPi.ToggleDisplay.toggleReferences.EPiObject) {
        node = document.getElementById(EPi.ToggleDisplay.toggleReferences.EPiObject[id]);
        if (node == null) {
            continue;
        }

        toggleNode = document.getElementById(EPi.GetProperty(node, "toggleNodeId"));
        if (toggleNode == null) {
            continue;
        }

        if (EPi.GetProperty(node, "visible")) {
            EPi.ToggleDisplay.SwitchVisibleToggleGroupNode(node);
        }

        if (EPi.GetProperty(node, "TitleShow")) {
            node.title = EPi.GetProperty(node, "TitleShow");
        }

        if (EPi.GetProperty(node, "ImageShow")) {
            image = document.createElement("img");
            image.src = EPi.GetProperty(node, "ImageShow");
            image.alt = EPi.GetProperty(node, "ImageAlt") || EPi.GetProperty(node, "TitleShow");
            image.className = EPi.GetProperty(node, "ImageClassName");
            node.insertBefore(image, node.firstChild);
        }
        if (!EPi.GetProperty(node, "visible")) {
            toggleNode.style.display = "none";
        }
    }
    // Deleting toggleReferences object.
    EPi.ToggleDisplay.toggleReferences = null;
    delete EPi.ToggleDisplay.toggleReferences;
}

EPi.ToggleDisplay.CreateToggleGroup = function (node, toggleNode) {
    var commonScriptObjectId = EPi.GetProperty(node, "commonScriptObject");
    var toggleGroup = EPi.GetProperty(node, "toggleGroup");

    var placeToStore;
    if (commonScriptObjectId) {
        placeToStore = window[commonScriptObjectId];
    } else {
        placeToStore = window;
    }

    var toggleGroupObject = placeToStore[toggleGroup];
    if (!toggleGroupObject) {
        toggleGroupObject = placeToStore[toggleGroup] = {};

        if (toggleNode) {
            toggleGroupObject.previouslyToggledNode = toggleNode
        }
    }

    return toggleGroupObject;
}

EPi.ToggleDisplay.SwitchVisibleToggleGroupNode = function (node) {
    var toggleGroup = EPi.GetProperty(node, "toggleGroup");
    if (toggleGroup) {
        var toggleNode = document.getElementById(EPi.GetProperty(node, "toggleNodeId"));

        // Create a place to store which toggleNode is visible in this toggleGroup if not already created.
        var toggleGroupObject = EPi.ToggleDisplay.CreateToggleGroup(node);

        var previouslyToggledNode = toggleGroupObject.previouslyToggledNode;
        if (previouslyToggledNode) {
            if (previouslyToggledNode == toggleNode) {
                return;
            }
            previouslyToggledNode.style.display = "none";
        }

        // Remember current toggleNode to be able to hide it when another node is clicked in this toggleGroup.
        toggleGroupObject.previouslyToggledNode = toggleNode;
    }
}

EPi.ToggleDisplay.ToggleViewStyle = function (node) {
    var toggleEnabled = EPi.GetProperty(node, "toggleEnabled");
    var toggleNode = document.getElementById(EPi.GetProperty(node, "toggleNodeId"));
    if (toggleEnabled && toggleNode) {
        var title, imgSrc, imgToFind;

        toggleNode.style.display = toggleNode.style.display == "none" ? "" : "none";

        // Get title and image properties
        // Usually set on commonScriptObject
        if (toggleNode.style.display == "none") {
            title = EPi.GetProperty(node, "TitleShow");
            imgSrc = EPi.GetProperty(node, "ImageShow");
            imgToFind = EPi.GetProperty(node, "ImageHide");
        } else {
            title = EPi.GetProperty(node, "TitleHide");
            imgSrc = EPi.GetProperty(node, "ImageHide");
            imgToFind = EPi.GetProperty(node, "ImageShow");
        }

        //Toggle title of clicked node (if available)
        if (node.title && title) {
            node.title = title;
        }
        // Toggle image (if we find a suitable one);
        var toggleImage = EPi.GetElementsByAttribute("img", "src", imgToFind, node, true);
        if (toggleImage.length > 0) {
            toggleImage[0].src = imgSrc;
        }
    } else {
        toggleNode.style.display = "";
    }
}

EPi.ToggleDisplay.EventHandler = function (e) {
    if (this.EPiObject) {
        // If clicked node is part of a toggleGroup switch which node to show.
        EPi.ToggleDisplay.SwitchVisibleToggleGroupNode(this);

        // If possible to show AND hide current toggleNode toggle the node
        EPi.ToggleDisplay.ToggleViewStyle(this);

        // If clicked node is an A element we don't want to follow the href
        if (EPi.GetProperty(this, "PreventDefault") == "true") {
            e.preventDefault();
        }
    }
}

EPi.GetCookie = function (sCookieName) {
    var dc = document.cookie;
    var prefix = sCookieName + "=";
    var begin = dc.indexOf("; " + prefix);
    if (begin == -1) {
        begin = dc.indexOf(prefix);
        if (begin != 0) return null;
    } else {
        begin += 2;
    }
    var end = document.cookie.indexOf(";", begin);
    if (end == -1) {
        end = dc.length;
    }

    temp = dc.substring(begin + prefix.length, end);
    temp = temp.replace(/\+/g, " ");

    return unescape(temp.replace(prefix, ""));
}

EPi.SetCookie = function (sName, sValue, exdays) {
    var exdate = new Date();
    exdate.setDate(exdate.getDate() + exdays);
    document.cookie = sName + "=" + escape(sValue) +
                      ";path=/" +
                      ((exdays == null) ? "" : "; expires=" + exdate.toUTCString());
}
