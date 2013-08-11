Meteor.methods({
    startPulse: function(x, y, code, sessionId) {
        Pulses.insert({ x: x, y: y, code: code, sessionId: sessionId, 
            fill: '#'+Math.floor(Math.random()*16777215).toString(16), 
            startTime: (new Date() * 1) 
        });
    },
    stopPulse: function(code, sessionId) {
        Pulses.update({code: code, sessionId: sessionId, stopTime: {$exists: false}}, {$set: {stopTime: (new Date() * 1)}}, {multi: true});
    },
    //get server time in milliseconds
    serverTime: function () {
        return new Date();
    }
})

Meteor.publish("pulses", function(){
    return Pulses.find();
});

// Periodic data cleanup (deletes old pulses)
Meteor.setInterval(function() {
    Pulses.remove({stopTime: {$lt: new Date() - 180000}});
    Pulses.remove({startTime: {$lt: new Date() - 360000}})
}, 15000);