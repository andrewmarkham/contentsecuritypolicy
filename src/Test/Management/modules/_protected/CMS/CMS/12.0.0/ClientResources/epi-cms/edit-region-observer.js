(function () {
    // Helper method to clone enumerable properties so they can be sent via postMessage.
    var clone = function (from) {
        if (from === null || typeof from !== "object") {
            return from;
        }
        var to = {};
        for (var property in from) {
            if (from.hasOwnProperty(property)) {
                to[property] = from[property];
            }
        }
        return to;
    };

    // Get all the editable nodes and filter out nested nodes.
    var getEditableNodes = function () {
        var allNodes = document.querySelectorAll("[data-epi-edit], [data-epi-property-name]");
        // Write out all the combinations of nested nodes to avoid runtime calculations which would always give the same result.
        var nestedNodes = document.querySelectorAll("[data-epi-edit] [data-epi-edit], [data-epi-property-name] [data-epi-property-name], [data-epi-property-name] [data-epi-edit], [data-epi-edit] [data-epi-property-name]");
        // Use array prototype methods since IE doesn't support Array.from
        return Array.prototype.filter.call(allNodes, function (node) {
            return Array.prototype.indexOf.call(nestedNodes, node) === -1;
        });
    };

    // Get the position and data attributes for a node.
    var getProperties = function (node) {
        var rect = node.getBoundingClientRect(),
            style = window.getComputedStyle(node),
            property = {
                dataset: clone(node.dataset),
                x: rect.left + window.pageXOffset,
                y: rect.top + window.pageYOffset,
                w: rect.right - rect.left,
                h: rect.bottom - rect.top
            };

        // Handle negative margins
        var left = parseFloat(style.marginLeft),
            top = parseFloat(style.marginTop),
            right = parseFloat(style.marginRight),
            bottom = parseFloat(style.marginBottom);

        if (left < 0) {
            property.x -= left;
            property.w += left;
        }
        if (right < 0) {
            property.w -= right;
        }
        if (top < 0) {
            property.x -= top;
            property.h += top;
        }
        if (bottom < 0) {
            property.h -= bottom;
        }
        return property;
    };

    // There could be subpixel positioning differences so only consider
    // changes greater than 1 pixel to be different.
    var isDifferent = function (a, b) {
        return Math.abs(a - b) > 1;
    };

    // Run as a recursive timeout loop since execution may take longer than the delay.
    var properties = [];
    var timeout;
    var run = function (force) {
        timeout = setTimeout(function () {
            var newProperties = getEditableNodes().map(getProperties);
            // Check if any properties have changed size.
            var isResized = newProperties.some(function (newProperty, index) {
                var currentProperty = properties[index];
                return !currentProperty
                    || isDifferent(newProperty.x, currentProperty.x)
                    || isDifferent(newProperty.y, currentProperty.y)
                    || isDifferent(newProperty.h, currentProperty.h)
                    || isDifferent(newProperty.w, currentProperty.w);
            });
            // Only publish positions when something has changed.
            if (force || isResized || properties.length !== newProperties.length) {
                properties = newProperties;
                window.epi.publish("/site/property-positions", newProperties);
            }
            run(false);
        }, 250);
    };

    window.addEventListener("load", function () {
        if (!window.epi) {
            return;
        }
        window.epi.subscribe("/site/check-property-positions", function () {
            run(true);
        });
    });
    window.addEventListener("unload", function () {
        clearTimeout(timeout);
    });
})();
