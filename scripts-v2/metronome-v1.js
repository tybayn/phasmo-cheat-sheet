
var snd = [new Audio('https://zero-network.net/phasmophobia/static/assets/footstep.wav'),new Audio('assets/click.wav')];
snd[0].preload = 'auto';
snd[1].preload = 'auto';
snd[0].load();
snd[1].load();

var speed = 1.7
var tempo = 115
var volume = 0.5
var running = false
var start = Date.now()
var snd_choice = 0
var offset = 0

var last_id = "";
function toggleSound(set_tempo,id){
    adjustOffset(0)
    speed = set_tempo
    var speed_modifier = [0.46,0.74,1.00,1.29,1.62][parseInt($("#ghost_modifier_speed").val())]
    if (last_id != id){
        last_id = id
        tempo = Math.ceil(((9.6*Math.pow(speed,2)) + (45.341*speed) + 9.5862) * speed_modifier) * (1+(offset/100))
        start = Date.now()
        if (!running){
            startMetronome()
        }
    }
    else if (!running){
        tempo = Math.ceil(((9.6*Math.pow(speed,2)) + (45.341*speed) + 9.5862) * speed_modifier) * (1+(offset/100))
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
    var speed_modifier = [0.46,0.74,1.00,1.29,1.62][parseInt($("#ghost_modifier_speed").val())]
    tempo = Math.ceil(((9.6*Math.pow(speed,2)) + (45.341*speed) + 9.5862) * speed_modifier) * (1+(offset/100))
}

function setVolume(){
    volume = $("#modifier_volume").val()/100
}

function adjustOffset(v){
    var cur_offset = document.getElementById("offset_value").innerText
    offset = parseInt(cur_offset.replace(/\d+(?:-\d+)+/g,"")) + parseInt(v)
    offset = offset > 15 ? 15 : offset < -15 ? -15 : offset;
    document.getElementById("offset_value").innerText = ` ${offset}% `
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