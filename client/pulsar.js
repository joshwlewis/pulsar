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
    updateTimeOffset: function() {
        Meteor.call("serverTime", function(error,result) {
            offset = new Date() - result;
            Pulsar.timeOffset = (Pulsar.timeOffset + offset) / 2;
        });
    },
    serverTime: function(){
        return (new Date() * 1) + Pulsar.timeOffset;
    },
    animate: function(){
        var cvs = Pulsar.canvas
        var ctx = Pulsar.context
        cvs.height = window.innerHeight;
        cvs.width = window.innerWidth;
        ctx.clearRect(0, 0, cvs.width, cvs.height);
        Pulses.find({$or: [{stopTime: {$gt: Pulsar.stopTime()}}, {stopTime: {$exists: false}}]}).forEach(function(pulse) {
            ctx.beginPath();
            ctx.arc(cvs.width * pulse.x, cvs.height * pulse.y, pulse.outsideRadius(), 0,  Math.PI * 2, true);
            if (pulse.stopped()) {
                ctx.arc(cvs.width * pulse.x, cvs.height * pulse.y, pulse.insideRadius(), 0,  Math.PI * 2, false);
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

Meteor.setInterval(function() { Pulsar.updateTimeOffset();}, 15000);

window.requestAnimationFrame = function(callback) {
    return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function(callback) { window.setTimeout(callback, 1000 / 60); };
}();

Deps.autorun(function () { Meteor.subscribe("pulses", Session.get("roomId")); });

Meteor.startup(function() {

    Pulsar.canvas = $("canvas#pulsar")[0];
    Pulsar.context = Pulsar.canvas.getContext("2d");

    $(Pulsar.canvas)
    .mousemove(function(e){
        Cursor.x = (e.pageX - Pulsar.canvas.offsetLeft) / Pulsar.canvas.width;
        Cursor.y = (e.pageY - Pulsar.canvas.offsetTop) / Pulsar.canvas.height;
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

    Pulse.prototype.outsideRadius = function() { return Math.ceil(this.startAge() * Pulsar.speed());}
    Pulse.prototype.insideRadius = function() { return Math.floor(this.stopAge() * Pulsar.speed());}

    Pulsar.updateTimeOffset();
    Pulsar.animate();
})