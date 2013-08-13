Pulsar = {
    canvas: null,
    context: null,
    length: function(){
        return Math.sqrt(Math.pow(Pulsar.canvas.height, 2) + Math.pow(Pulsar.canvas.width,2));
    },
    speed: function(){
        return Pulsar.length() * 0.0001;
    },
    animate: function(){
        var cvs = Pulsar.canvas;
        var ctx = Pulsar.context;
        cvs.width = window.innerWidth;
        cvs.height = window.innerHeight;
        ctx.clearRect(0, 0, cvs.width, cvs.height);
        var pulses = Pulses.find({$or: [{stopTime: {$gt: Timing.stop()}}, {stopTime: {$exists: false}}]})
        if (!pulses.count()) {
            ctx.font = Math.round(Pulsar.length() * 0.025) + 'px Verdana';
            ctx.fillStyle = "#CCC"
            ctx.textAlign = 'center';
            ctx.fillText("(Someone click me!)", Math.round(cvs.width / 2), Math.round(cvs.height / 2));
        } else { 
            pulses.forEach(function(pulse) {
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
        }
        window.requestAnimationFrame(function(){ Pulsar.animate(); });
    }
}

Timing = {
    stop: function(){
        return Timing.server() - (Pulsar.length() / Pulsar.speed());
    },
    offset: 0,
    lastRequest: null,
    latency: 100,
    updateOffset: function() {
        Timing.lastRequest = new Date() * 1
        Meteor.call('serverTime', function(error, result) {
            var latency = Math.round((new Date() - Timing.lastRequest) / 2);
            Timing.latency = Math.round((Timing.latency + latency) / 2);
            offset = new Date() - result - Timing.latency;
            Timing.offset = Math.round((Timing.offset + offset) / 2);
            Timing.lastRequest = null;
        });
    },
    server: function(){
        return (new Date() * 1) - Timing.offset;
    },
}

Cursor = {
    x: null,
    y: null
}

Session.setDefault('id', Meteor.uuid())

Meteor.setInterval(function() { Timing.updateOffset(); }, 5000);

window.requestAnimationFrame = function(callback) {
    return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function(callback) { window.setTimeout(callback, 1000 / 60); };
}();

Deps.autorun(function () { Meteor.subscribe("pulses"); });

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

    Pulse.prototype.startAge = function() { return Timing.server() - this.startTime; }
    Pulse.prototype.stopAge = function() { return Timing.server() - this.stopTime; }
    Pulse.prototype.outsideRadius = function() { 
        return Math.abs(Math.round(this.startAge() * Pulsar.speed()));
    }
    Pulse.prototype.insideRadius = function() { 
        return Math.abs(Math.round(this.stopAge() * Pulsar.speed()));
    }

    Timing.updateOffset();
    Pulsar.animate();
})