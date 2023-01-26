
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

function getTempo(s,i){
    return [
        Math.ceil((-68.3*Math.pow(s,6)) + (824*Math.pow(s,5)) + (-4045*Math.pow(s,4)) + (10333*Math.pow(s,3)) + (-14451*Math.pow(s,2)) + (10506*s) - 3068), // 50%, R^2:1
        Math.ceil((-32.1*Math.pow(s,6)) + (388*Math.pow(s,5)) + (-1912*Math.pow(s,4)) + (4896*Math.pow(s,3)) + (-6859*Math.pow(s,2)) + (5025*s) - 1459), // 75%, R^2:1
        Math.ceil((4.12*Math.pow(s,6)) + (-47.4*Math.pow(s,5)) + (222*Math.pow(s,4)) + (-541*Math.pow(s,3)) + (733*Math.pow(s,2)) + (-456*s) + 151), // 100%, R^2:1
        Math.ceil((-20.4*Math.pow(s,6)) + (263*Math.pow(s,5)) + (-1361*Math.pow(s,4)) + (3626*Math.pow(s,3)) + (-5211*Math.pow(s,2)) + (3908*s) - 1122), // 125%, R^2:1
        Math.ceil((-45*Math.pow(s,6)) + (573*Math.pow(s,5)) + (-2943*Math.pow(s,4)) +(7794*Math.pow(s,3)) + (-11155*Math.pow(s,2)) + (8272*s) - 2395)  // 150%, R^2:1
    ][i]
}

var last_id = "";
function toggleSound(set_tempo,id){
    speed = set_tempo
    if (last_id != id){
        last_id = id
        tempo = getTempo(speed,parseInt($("#ghost_modifier_speed").val()))
        start = Date.now()
        if (!running){
            startMetronome()
        }
    }
    else if (!running){
        tempo = getTempo(speed,parseInt($("#ghost_modifier_speed").val()))
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
    tempo = getTempo(speed,parseInt($("#ghost_modifier_speed").val()))
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