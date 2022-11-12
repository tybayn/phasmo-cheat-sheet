
var snd = new Audio('assets/footstep.wav');
snd.preload = 'auto';
snd.load();

var speed = 1.7
var tempo = 115
var running = false
var start = Date.now()

var last_id = "";
function toggleSound(set_tempo,id){
    speed = set_tempo
    var speed_modifier = parseFloat($("#ghost_modifier_speed").val()) / 100
    if (last_id != id){
        last_id = id
        tempo = ((9.6*Math.pow(set_tempo,2)) + (45.341*set_tempo) + 9.5862) * speed_modifier
        start = Date.now()
        if (!running){
            startMetronome()
        }
    }
    else if (!running){
        tempo = ((9.6*Math.pow(set_tempo,2)) + (45.341*set_tempo) + 9.5862) * speed_modifier
        start = Date.now()
        if (!running){
            startMetronome()
        }
    }
    else{
        start = Date.now() - 6000
    }
}

function setTempo(){
    var speed_modifier = parseFloat($("#ghost_modifier_speed").val()) / 100
    tempo = ((9.6*Math.pow(speed,2)) + (45.341*speed) + 9.5862) * speed_modifier
}

function startMetronome() {
    running = true
    var interval = 1000 / (tempo / 60)
    var footstep = snd.cloneNode()
    footstep.play();
    setTimeout(step, interval);
    function step() {
        if (Date.now() - start <= 5000) {
            var interval = 1000 / (tempo / 60)
            var footstep = snd.cloneNode()
            footstep.play();
            setTimeout(step, interval);
        }
        else{
            running = false
        }
    }
}