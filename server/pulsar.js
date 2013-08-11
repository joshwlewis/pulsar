Meteor.methods({
    startPulse: function(x, y, code, sessionId) {
        Pulses.insert({ x: x, y: y, code: code, sessionId: sessionId, startTime: (new Date() * 1) });
    },
    endPulse: function(code, sessionId) {
        Pulses.update({ code: code, sessionId: sessionId, stopTime: {$ne: null, $exists: true}}, {stopTime: (new Date() * 1)});
    }
})

Meteor.publish("pulses", function(){
    return Pulses.find();
});