Pulsar = {
	canvas: null,
    context: null,
    xCoord: function(code){
        return (Cursor.x || 0.5) * Pulsar.canvas.width;
    },
    yCoord: function(code){
        return (Cursor.y || 0.5) * Pulsar.canvas.height;
    },
    speed: function(){
        return Pulsar.canvas.height + Pulsar.canvas.width;
    },
    animate: function(){
        var cvs
        cvs = Pulsar.canvas
        var ctx
        ctx = Pulsar.context
        cvs.height = window.innerHeight;
        cvs.width = window.innerWidth;
        ctx.clearRect(0, 0, cvs.width, cvs.height);
        Pulses.find().forEach(function(pulse) {
            ctx.beginPath();
            ctx.arc(Pulsar.width * pulse.x, Pulsar.height * pulse.y, pulse.outsideRadius(), 0,  Math.PI * 2, false);
            if (pulse.stopped) {
                ctx.arc(Pulsar.width * pulse.x, Pulsar.height * pulse.y, pulse.insideRadius(), 0,  Math.PI * 2, true);
            }
            ctx.fillStyle = pulse.color;
            ctx.fill();
        })
        window.AnimationFrame(function(){ Pulsar.animate(); });
    }
}

Cursor = {
    x: null,
    y: null
}

AnimationFrame = function(callback) {
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

    Pulse.prototype.outsideRadius = function() { return this.startAge() * Pulsar.speed();}
    Pulse.prototype.insideRadius = function() { return this.stopAge() * Pulsar.speed(); }

    Pulsar.animate();
})