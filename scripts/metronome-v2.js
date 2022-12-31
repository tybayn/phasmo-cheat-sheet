
var snd = [new Audio('assets/footstep.wav'),new Audio('assets/click.wav')];
snd[0].preload = 'auto';
snd[1].preload = 'auto';
snd[0].load();
snd[1].load();

var speed = 1.7
var tempo = 115
var volume = 0.5
var running = false
var start = Date.now()
var snd_choice = 0;

var last_id = "";
function toggleSound(set_tempo,id){
    speed = set_tempo
    var speed_modifier = [0.48,0.75,1.00,1.29,1.62][parseInt($("#ghost_modifier_speed").val())]
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

function setSoundType(){
    snd_choice = document.getElementById("modifier_sound_type").checked ? 1 : 0;
}

function setTempo(){
    var speed_modifier = [0.48,0.75,1.00,1.29,1.62][parseInt($("#ghost_modifier_speed").val())]
    tempo = ((9.6*Math.pow(speed,2)) + (45.341*speed) + 9.5862) * speed_modifier
}

function setVolume(){
    volume = $("#modifier_volume").val()/100
}

function startMetronome() {
    running = true
    var interval = 1000 / (tempo / 60)
    var footstep = snd[snd_choice].cloneNode()
    footstep.volume = volume
    footstep.play();
    setTimeout(step, interval);
    function step() {
        if (Date.now() - start <= 5000) {
            var interval = 1000 / (tempo / 60)
            var footstep = snd[snd_choice].cloneNode()
            footstep.volume = volume
            footstep.play();
            setTimeout(step, interval);
        }
        else{
            running = false
        }
    }
}