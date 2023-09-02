
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

// ------------------------------------------------------------------------------

const bpm_precision = 5;
let input_bpm = 0;
let taps = [];
var bpm_speeds = new Set()
var hit = 0

function bpm_tap(){
    if (Date.now() - taps[taps.length-1] > (5000)){
        taps = []
        hit = 0
        document.getElementById('input_bpm').innerHTML = `0<br>bpm`;
        document.getElementById('input_speed').innerHTML = `0<br>m/s`;
        document.getElementById('tap_viz').innerHTML = ""
    }
    document.getElementById('tap_viz').innerHTML += (hit == 0 ? " ." : ".")
    hit = (hit + 1) % 4
    taps.length
    taps.push( Date.now() );
    bpm_calc();
}

function bpm_clear() {
    taps = []
    document.getElementById('input_bpm').innerHTML = `0<br>bpm`;
    document.getElementById('input_speed').innerHTML = `0<br>m/s`;
    document.getElementById('tap_viz').innerHTML = ""
    var ghosts = document.getElementsByClassName("ghost_card")
    for (var i = 0; i < ghosts.length; i++){
        ghosts[i].style.boxShadow = 'none'
    }
}

function bpm_calc(forced=false) {
    let current_bpm = 0;
    let avg_taps = [];

    if (taps.length >= 2) {
        
        for (let i = 0; i < taps.length; i++) {
        if (i >= 1) {
            avg_taps.push( Math.round( 60 / (taps[i] / 1000 - taps[i-1] / 1000) * 100) / 100 );
        }
        }
    }
    
    if (taps.length >= 24) {
        taps.shift();
    }
    
    if (avg_taps.length >= 2 || forced) {
        
        if(forced){
            current_bpm = parseInt(document.getElementById('input_bpm').innerHTML.split("<br>")[0])
        }
        else{
            current_bpm = get_bpm_average(avg_taps, bpm_precision)
        }
        input_bpm = current_bpm;
        input_ms = document.getElementById("bpm_type").checked ? get_ms(input_bpm) : get_ms_exact(input_bpm)
        document.getElementById('input_bpm').innerHTML = `${Math.round(input_bpm)}<br>bpm`;
        document.getElementById('input_speed').innerHTML = `${input_ms}<br>m/s`;
        mark_ghosts(input_ms)
        saveSettings()
    }
}

function get_ms(bpm){
    var sm = [0.46,0.74,1.00,1.29,1.62][parseInt($("#ghost_modifier_speed").val())]
    var cur_ms = 0
    var cur_offset = 1000
    bpm_speeds.forEach(function(m){
        var t = Math.ceil(((9.6*Math.pow(m,2)) + (45.341*m) + 9.5862) * sm) * (1+(offset/100))
        if (Math.abs(bpm-t) < cur_offset){
            cur_offset = Math.abs(bpm-t)
            cur_ms = m
        }
    })

    return cur_ms.toFixed(2)
}

function get_ms_exact(bpm){
    var sm = [0.46,0.74,1.00,1.29,1.62][parseInt($("#ghost_modifier_speed").val())]
    var cur_ms = (Math.sqrt(38400000*(bpm / (sm*(1+(offset/100))))+1687696201)-45341)/(19200)
    return cur_ms.toFixed(2)
}

function mark_ghosts(ms){
    ms = parseFloat(ms)
    var ghosts = document.getElementsByClassName("ghost_card")
    for (var i = 0; i < ghosts.length; i++){
        ghosts[i].style.boxShadow = 'none'
        var name = ghosts[i].getElementsByClassName("ghost_name")[0].textContent;
        var speed = ghosts[i].getElementsByClassName("ghost_speed")[0].textContent

        //Parse Ghost speeds
        if (speed.includes('|')){
            var speeds = speed.split('|')
            var speed_type = "or"
        }
        else if(speed.includes('-')){
            var speeds = speed.split('-')
            var speed_type = "range"
        }
        else{
            var speeds = [speed]
            var speed_type = "or"
        }

        // Get min and max
        var min_speed = parseFloat(speeds[0].replaceAll(" m/s",""))
        if (speeds.length > 1){
            var max_speed = parseFloat(speeds[1].replaceAll(" m/s",""))
        }
        else{
            var max_speed = min_speed
        }

        if(document.getElementById("bpm_type").checked){
            if ((speed_type == "range" && min_speed <= ms && ms <= max_speed) || name == "The Mimic"){
                ghosts[i].style.boxShadow = '0px 0px 10px 0px #dbd994'
            }
            else if(min_speed === ms || max_speed === ms){
                ghosts[i].style.boxShadow = '0px 0px 10px 0px #dbd994'
            }
        }
        else{
            if ((speed_type == "range" && (min_speed - 0.05) <= ms && ms <= (max_speed + 0.05)) || name == "The Mimic"){
                ghosts[i].style.boxShadow = '0px 0px 10px 0px #dbd994'
            }
            else if(((min_speed - 0.05) <= ms && ms <= (min_speed + 0.05)) || ((max_speed - 0.05) <= ms && ms <= (max_speed + 0.05))){
                ghosts[i].style.boxShadow = '0px 0px 10px 0px #dbd994'
            }
        }
    }
}

function get_bpm_average(values, precision) {
    let avg_taps = values;
    let n = 0;
    
    for (let i = avg_taps.length-1; i >= 0; i--) {
        n += avg_taps[i];
        if (avg_taps.length - i >= precision) break;
    }

    return n / bpm_precision;
}
