define("epi/shell/request/mutators", [
    "dojo/when"
], function (
    when
) {

    var _mutators = [];

    var mutators = function () {
        // summary:
        //      Returns an array of configured mutators.
        //      The collection may change during runtime, so don't hold on to the returned array
        // tags:
        //      internal xproduct
        // returns: An array with request mutators

        return _mutators.concat();
    };

    mutators.add = function (mutator) {
        // summary:
        //      Register a new request mutator

        _mutators.push(mutator);
    };

    mutators.remove = function (mutator) {
        // summary:
        //      Remove a registered request mutator.
        // returns:
        //      The removed mutator; or null if no matching mutator was found.

        var index = _mutators.indexOf(mutator);
        if (index !== -1) {
            return _mutators.splice(index, 1)[0];
        }
        return null;
    };

    mutators.execute = function (methodName, data) {
        // summary:
        //      Execute the specified method on all mutators in the mutator chain.
        // methodName: String
        //      Name of the method to execute on each mutator
        // data: object
        //      A custom data object passed to the executed method.
        // returns:
        //      A Deferred resolved with the data from the last mutator in the chain.

        var previous = when(data);

        _mutators.forEach(function (mutator) {
            var method = mutator[methodName];
            previous = method ? previous.then(method.bind(mutator)) : previous;
        });

        return previous;
    };

    return mutators;
});
