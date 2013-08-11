Pulse = function(doc) {
    _.extend(this, doc);
}

Pulse.prototype = {
    constructor: Pulse,
    stopped: function() { return this.stopTime ? true : false; }
}

Pulses = new Meteor.Collection("pulses", {
    transform: function(doc) {
        return new Pulse(doc);
    }
});