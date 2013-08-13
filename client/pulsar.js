Pulsar = {
    canvas: null,
    context: null,
    length: function(){
        return Math.sqrt(Math.pow(Pulsar.canvas.height, 2) + Math.pow(Pulsar.canvas.width,2));
    },
    speed: function(){
        return Pulsar.length() * 0.0001;
    },
    stopTime: function(){
        return Pulsar.serverTime() - (Pulsar.length() / Pulsar.speed());
    },
    timeOffset: 0,
    lastRequestTime: null,
    latency: 100,
    updateTimeOffset: function() {
        Pulsar.lastRequestTime = new Date() * 1
        Meteor.call('serverTime', function(error, result) {
            var latency = new Date() - Pulsar.lastRequestTime;
            Pulsar.latency = Math.round((Pulsar.latency + latency) / 2);
            offset = new Date() - result - Pulsar.latency;
            Pulsar.timeOffset = Math.round((Pulsar.timeOffset + offset) / 2);
            Pulsar.lastRequestTime = null;
        });
    },
    serverTime: function(){
        return (new Date() * 1) - Pulsar.timeOffset;
    },
    animate: function(){
        var cvs = Pulsar.canvas;
        var ctx = Pulsar.context;
        cvs.width = window.innerWidth;
        cvs.height = window.innerHeight;
        ctx.clearRect(0, 0, cvs.width, cvs.height);
        Pulses.find({$or: [{stopTime: {$gt: Pulsar.stopTime()}}, {stopTime: {$exists: false}}]}).forEach(function(pulse) {
            var x = Math.round(cvs.width * pulse.x);
            var y = Math.round(cvs.height * pulse.y);
            ctx.beginPath();
            ctx.arc(x, y, pulse.outsideRadius(), 0,  Math.PI * 2, true);
            if (pulse.stopped()) {
                ctx.arc(x, y, pulse.insideRadius(), 0,  Math.PI * 2, false);
            }
            ctx.fillStyle = pulse.fill;
            ctx.fill();
        })
        window.requestAnimationFrame(function(){ Pulsar.animate(); });
    }
}

Cursor = {
    x: null,
    y: null
}

Session.setDefault('id', Meteor.uuid())

Meteor.setInterval(function() { Pulsar.updateTimeOffset(); }, 5000);

window.requestAnimationFrame = function(callback) {
    return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function(callback) { window.setTimeout(callback, 1000 / 60); };
}();

Deps.autorun(function () { Meteor.subscribe("pulses", Session.get("roomId")); });

Meteor.startup(function() {

    Pulsar.canvas = $("canvas#pulsar")[0];
    Pulsar.context = Pulsar.canvas.getContext("2d");

    $(Pulsar.canvas)
    .mousemove(function(e){
        var cvs = Pulsar.canvas
        Cursor.x = (e.pageX - cvs.offsetLeft) / cvs.width;
        Cursor.y = (e.pageY - cvs.offsetTop) / cvs.height;
    })
    .mouseout(function(e){
        Cursor.x = null;
        Cursor.y = null;
    })

    .mousedown(function(e){
        Meteor.call("startPulse", Cursor.x, Cursor.y, 'mouse', Session.get('id'))
    })
    .mouseup(function(e){
        Meteor.call("stopPulse", 'mouse', Session.get('id'))
    })

    Pulse.prototype.startAge = function() { return Pulsar.serverTime() - this.startTime; }
    Pulse.prototype.stopAge = function() { return Pulsar.serverTime() - this.stopTime; }
    Pulse.prototype.outsideRadius = function() { return Math.abs(Math.round(this.startAge() * Pulsar.speed()));}
    Pulse.prototype.insideRadius = function() { return Math.abs(Math.round(this.stopAge() * Pulsar.speed()));}

    Pulsar.updateTimeOffset();
    Pulsar.animate();
})