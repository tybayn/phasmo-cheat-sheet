
var snd = [new Audio('https://zero-network.net/phasmophobia/static/assets/footstep.mp3'),new Audio('assets/click.mp3')];
snd[0].preload = 'auto';
snd[1].preload = 'auto';
snd[0].load();
snd[1].load();

var speed = 1.7
var tempo = 115
var volume = 0.5
var muteTimerToggle = false
var muteTimerCountdown = false
var running = false
var start = Date.now()
var snd_choice = 0
var offset = 0
var additional_ghost_data = ["hantu","moroi","thaye"]
var additional_ghost_var = [0.18,0.085,0.175]

var last_id = "";

function mute(type){
    if(type == "toggle"){
        muteTimerToggle = document.getElementById("mute_timer_toggle").checked
    }
    if(type == "countdown"){
        muteTimerCountdown = document.getElementById("mute_timer_countdown").checked
    }
}

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
let bpm_hist = [];
let start_ts = 0
var bpm_speeds = new Set()
var hit = 0

function bpm_tap(ts=-1){

    if (ts == -1){
        ts = Date.now();
    }

    if (taps.length == 0){
        draw_graph()
    }

    if (ts - taps[taps.length-1] > (5000)){
        draw_graph();
        taps = []
        bpm_hist = []
        hit = 0
        document.getElementById('input_bpm').innerHTML = `0<br>bpm`;
        document.getElementById('input_speed').innerHTML = `0<br>m/s`;
        document.getElementById('tap_viz').innerHTML = ""
    }
    if(document.getElementById('tap_viz').innerHTML.length < 33)
        document.getElementById('tap_viz').innerHTML += (hit == 0 ? " ." : ".")
    else
        document.getElementById('tap_viz').innerHTML = (hit == 0 ? document.getElementById('tap_viz').innerHTML.substring(2) + " ." : document.getElementById('tap_viz').innerHTML.substring(1) + ".")
    hit = (hit + 1) % 4
    taps.push( ts );
    bpm_calc();

    if (taps.length >= 5)
        graph_bpm();
    else
        bpm_hist = []
}

function draw_graph(clear = true){
    var graph = $('#bpm_hist')
    var c = graph[0].getContext('2d');

    c.reset()

    c.lineWidth = 0.5;
    c.strokeStyle = '#fff'
    c.beginPath();
    c.moveTo(15,5)
    c.lineTo(15,graph.height() - 15)
    c.lineTo(graph.width(),graph.height() - 15)
    c.stroke();

    // Draw x axis
    c.textAlign = "center"
    c.font = "6pt Calibri"
    c.fillStyle = "#777"
    c.strokeStyle = '#444'
    for (var i = 0; i <= 45; i+=10){
        c.fillText(i, (graph.width()-15) / 45 * i + 15, graph.height() - 5)
        c.beginPath();
        c.setLineDash([2,1])
        c.moveTo((graph.width()-15) / 45 * i + 15,graph.height() - 5)
        c.lineTo((graph.width()-15) / 45 * i + 15,5)
        c.stroke();
    }

    // Draw y axis
    c.textAlign = "right"
    c.textBaseline = "middle"
    c.font = "6pt Calibri"
    c.fillStyle = "#777"
    c.strokeStyle = '#444'

    for (var i = 0; i <= 4.0; i+=0.5){
        c.fillText(i, 10, (graph.height()-20) - ((graph.height()-20) / 4 * i) + 5)
        c.beginPath();
        c.setLineDash([2,1])
        c.moveTo(15,(graph.height()-20) - ((graph.height()-20) / 4 * i) + 5)
        c.lineTo(graph.width(),(graph.height()-20) - ((graph.height()-20) / 4 * i) + 5)
        c.stroke();
    }

    // Draw previous graph
    if(bpm_hist.length > 0){
        c.lineWidth = 1;
        c.strokeStyle = clear ? "#700" : "#f00"
        c.beginPath();
        if(clear)
            c.setLineDash([2,2])
        else
            c.setLineDash([1,0])
        c.moveTo(15,(graph.height()-20) - ((graph.height()-20) / 4 * bpm_hist[0]) + 5)
        for(var i = 1; i < bpm_hist.length; i++){
            var cur_x = (graph.width()-15) / 45 * bpm_hist[i]['seconds'] + 15
            var cur_y = (graph.height()-20) - ((graph.height()-20) / 4 * bpm_hist[i]['speed']) + 5
            c.lineTo(cur_x,cur_y)
        }
        c.stroke()
    }
}

function graph_bpm(){
    var graph = $('#bpm_hist')
    var c = graph[0].getContext('2d');

    c.lineWidth = 1;
    c.strokeStyle = "#f00"
    c.beginPath();
    c.setLineDash([1,0])
    
    var cur_x = (graph.width()-15) / 45 * (bpm_hist[bpm_hist.length - 1]['seconds']) + 15
    var cur_y = (graph.height()-20) - ((graph.height()-20) / 4 * bpm_hist[bpm_hist.length - 1]['speed']) + 5
    if(bpm_hist.length > 1){
        var prev_x = (graph.width()-15) / 45 * (bpm_hist[bpm_hist.length - 2]['seconds']) + 15
        var prev_y = (graph.height()-20) - ((graph.height()-20) / 4 * bpm_hist[bpm_hist.length - 2]['speed']) + 5
    }
    else{
        var prev_x = cur_x
        var prev_y = cur_y
    }
    c.moveTo(prev_x,prev_y)
    c.lineTo(cur_x,cur_y)
    c.stroke()
}

function bpm_clear() {
    draw_graph()
    taps = []
    bpm_list = []
    document.getElementById('input_bpm').innerHTML = `0<br>bpm`;
    document.getElementById('input_speed').innerHTML = `0<br>m/s`;
    document.getElementById('tap_viz').innerHTML = ""
    var ghosts = document.getElementsByClassName("ghost_card")
    for (var i = 0; i < ghosts.length; i++){
        ghosts[i].style.boxShadow = 'none'
    }
    $("#guide_tab_footstep").hide()
    $("#hunts_tab_footstep").hide()
    $("#hunts_tab_indent_footstep").hide()
    for (var g = 0 ;g < additional_ghost_data.length; g++){
        var speed_tab = document.getElementById(`${additional_ghost_data[g]}_speed_breakdown`)
        for (var i = 1, row; row = speed_tab.rows[i]; i++){
            $(row).removeClass("row_select")
        }
    }
    send_bpm_link("-","-",["50%","75%","100%","125%","150%"][parseInt($("#ghost_modifier_speed").val())])
    send_ghosts_link()
}

function bpm_calc(forced=false) {
    let current_bpm = 0;
    let avg_taps = [];

    if (taps.length == 5) {
        start_ts = taps[taps.length - 1]
    }

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
        var ex_ms = get_ms_exact(input_bpm)
        var av_ms = get_ms(input_bpm)
        input_ms = document.getElementById("bpm_type").checked ? av_ms : ex_ms
        document.getElementById('input_bpm').innerHTML = `${Math.round(input_bpm)}<br>bpm`;
        document.getElementById('input_speed').innerHTML = `${input_ms}<br>m/s`;

        bpm_hist.push({"speed":input_ms,"seconds":(taps[taps.length - 1] - start_ts)/1000});
        
        try{
            mark_ghosts(input_ms)
        } catch(Error){
            // Om nom nom
        }
        try{
            mark_ghost_details(ex_ms)
        } catch(Error){
            // Om nom nom
        }
        send_bpm_link(Math.round(input_bpm).toString(),input_ms.toString(),["50%","75%","100%","125%","150%"][parseInt($("#ghost_modifier_speed").val())])
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

    return bpm == 0 ? 0.00 : cur_ms.toFixed(2)
}

function get_ms_exact(bpm){
    var sm = [0.46,0.74,1.00,1.29,1.62][parseInt($("#ghost_modifier_speed").val())]
    var cur_ms = (Math.sqrt(38400000*(bpm / (sm*(1+(offset/100))))+1687696201)-45341)/(19200)
    return bpm == 0 ? 0.00 : cur_ms.toFixed(2)
}

function mark_ghost_details(ms)
{
    ms = parseFloat(ms)
    $("#guide_tab_footstep").hide()
    $("#hunts_tab_footstep").hide()
    $("#hunts_tab_indent_footstep").hide()
    for (var g = 0 ;g < additional_ghost_data.length; g++){
        var speed_tab = document.getElementById(`${additional_ghost_data[g]}_speed_breakdown`)
        for (var i = 1, row; row = speed_tab.rows[i]; i++){
            $(row).removeClass("row_select")
            var speed = parseFloat(row.getElementsByClassName(`${additional_ghost_data[g]}_speed_item`)[0].textContent.replace(" m/s",""))
            if(((speed - additional_ghost_var[g]) <= ms && ms <= (speed + additional_ghost_var[g]))){
                $(row).addClass("row_select")
                $("#guide_tab_footstep").show()
                $("#hunts_tab_footstep").show()
                $("#hunts_tab_indent_footstep").show()
            }
        }
    }
}

function mark_ghosts(ms){
    ms = parseFloat(ms)
    bpm_list = []
    var ghosts = document.getElementsByClassName("ghost_card")
    for (var i = 0; i < ghosts.length; i++){
        ghosts[i].style.boxShadow = 'none'
        
        if(ms != 0.00){
            var name = ghosts[i].getElementsByClassName("ghost_name")[0].textContent;
            var speed = ghosts[i].getElementsByClassName("ghost_speed")[0].textContent;
            var has_los = ghosts[i].getElementsByClassName("ghost_has_los")[0].textContent == '1';

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

            if(has_los){
                if(["Raiju","Jinn"].includes(name)){
                    if(min_speed <= ms && ms <= (min_speed * 1.65)){
                        ghosts[i].style.boxShadow = '-6px 0px 5px -4px #dbd994'
                    }
                }
                else{
                    if(min_speed <= ms && ms <= (max_speed * 1.65)){
                        ghosts[i].style.boxShadow = '-6px 0px 5px -4px #dbd994'
                    }
                }
            }

            if(document.getElementById("bpm_type").checked){
                if ((speed_type == "range" && min_speed <= ms && ms <= max_speed) || name == "The Mimic"){
                    ghosts[i].style.boxShadow = '0px 0px 10px 2px #dbd994'
                    bpm_list.push(ghosts[i].id)
                }
                else if(min_speed === ms || max_speed === ms){
                    ghosts[i].style.boxShadow = '0px 0px 10px 2px #dbd994'
                    bpm_list.push(ghosts[i].id)
                }
            }
            else{
                if ((speed_type == "range" && (min_speed - 0.05) <= ms && ms <= (max_speed + 0.05)) || name == "The Mimic"){
                    ghosts[i].style.boxShadow = '0px 0px 10px 2px #dbd994'
                    bpm_list.push(ghosts[i].id)
                }
                else if(((min_speed - 0.05) <= ms && ms <= (min_speed + 0.05)) || ((max_speed - 0.05) <= ms && ms <= (max_speed + 0.05))){
                    ghosts[i].style.boxShadow = '0px 0px 10px 2px #dbd994'
                    bpm_list.push(ghosts[i].id)
                }
            }
        }
    }
    send_ghosts_link()
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
