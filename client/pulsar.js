Pulsar = {
    canvas: null,
    context: null,
    speed: function(){
        return ((Pulsar.canvas.height + Pulsar.canvas.width) * 0.00005);
    },
    stopTime: function(){
        return new Date() - (Math.max(Pulsar.canvas.height, Pulsar.canvas.width) / Pulsar.speed() )
    },
    animate: function(){
        var cvs
        cvs = Pulsar.canvas
        var ctx
        ctx = Pulsar.context
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

    Pulse.prototype.outsideRadius = function() { return this.startAge() * Pulsar.speed();}
    Pulse.prototype.insideRadius = function() { return this.stopAge() * Pulsar.speed(); }

    Pulsar.animate();
})