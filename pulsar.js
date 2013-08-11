Pulse = function(doc) {
    _.extend(this, doc);
}

Pulse.prototype = {
    constructor: Pulse,
    startAge: function() { return new Date() - this.startTime },
    stopAge: function() { return new Date() - this.stopTime },
    stopped: function() { return this.stopTime ? true : false; }
}

Pulses = new Meteor.Collection("pulses", {
    transform: function(doc) {
        return new Pulse(doc);
    }
});