const zeroPad = (num, places) => String(num).padStart(places, '0')
var bpm_down = false
document.body.onkeyup = function(e) {
    if(e.key == "/" ||
        e.code == "Slash" ||
        e.keyCode == 47
    ){
        closeAll(true,false)
        showSearch();
    }
    
    if($("#search_bar").is(":focus"))
        return 
    
    if (e.key == "f" ||
        e.code == "KeyF" ||      
        e.keyCode == 70      
    ) {
        bpm_down = false
    }
    if (e.key == "t" ||
        e.code == "KeyT" ||      
        e.keyCode == 84      
    ) {
        toggle_timer();
        send_timer();
    }
    if (e.key == "c" ||
        e.code == "KeyC" ||      
        e.keyCode == 67      
    ) {
        toggle_cooldown_timer();
        send_cooldown_timer();
    }
    if (e.key == "h" ||
        e.code == "KeyH" ||      
        e.keyCode == 72      
    ) {
        toggle_hunt_timer();
        send_hunt_timer();
    }
    if (e.key == "q" ||
        e.code == "KeyQ" ||      
        e.keyCode == 81      
    ) {
        toggleFilterTools();
    }
    if (e.key == "r" ||
        e.code == "KeyR" ||      
        e.keyCode == 82      
    ) {
        bpm_clear();
        saveSettings();
    }
    if(e.key == "m" ||
        e.code == "keyM" ||
        e.keyCode == 77
    ){
        closeAll(true,false)
        showMaps();
    }
    if(e.key == "g" ||
        e.code == "keyG" ||
        e.keyCode == 71
    ){
        closeAll(false, true)
        showWiki();
    }
    if(e.keyCode == 37){
        closeAll();
    }
}

document.body.onkeydown = function(e){
    if (!bpm_down && (e.key == "f" ||
        e.code == "KeyF" ||      
        e.keyCode == 70)      
    ) {
        bpm_down = true
        bpm_tap();
    }
}

var timer_snd = []

var smudge_worker;
var cooldown_worker;
var hunt_worker;
var sound_worker;

var count_direction = 0;
var map_size = 0;
var map_difficulty = 2;
var cursed_hunt = 20;
const map_hunt_lengths = [
    [15+cursed_hunt,30+cursed_hunt,40+cursed_hunt],
    [20+cursed_hunt,40+cursed_hunt,50+cursed_hunt],
    [30+cursed_hunt,50+cursed_hunt,60+cursed_hunt]
];


function updateMapSize(size){
    map_size = {"S":0,"M":1,"L":2}[size]
    document.getElementById("minute_hunt").innerHTML = zeroPad(Math.floor(map_hunt_lengths[map_difficulty][map_size]/60),2)
    document.getElementById("second_hunt").innerHTML = zeroPad(map_hunt_lengths[map_difficulty][map_size] % 60,2)
    document.getElementsByClassName('normal_line')[0].style.left = `${(20/map_hunt_lengths[map_difficulty][map_size])*100}%`
    document.getElementsByClassName('hunt_size_label')[0].innerText = `${lang_data['{{map}}']}: ${["S","M","L"][map_size]}, ${lang_data['{{hunt}}']}: ${["L","M","H"][map_difficulty]}`
    document.getElementById("map_size_info").innerText = `${lang_data['{{map_size}}']}: ${lang_data[["{{small}}","{{medium}}","{{large}}"][map_size]]}`
    document.getElementById("max_num_lights").innerText = `${lang_data['{{max_lights}}']}: ${["9","8","7"][map_size]}`
    draw_graph()
}

function updateMapDifficulty(difficulty){
    if(difficulty.match(/[0-9]{4}-[0-9]{4}-[0-9]{4}/g))
        map_difficulty = {"0":2,"1":2,"2":2,"3":2,"3I":1,"3A":0}[document.getElementById("cust_hunt_length").value]
    else
        map_difficulty = {"0":2,"1":2,"2":2,"3":2,"3I":1,"3A":0}[["-5","-1"].includes(difficulty) ? document.getElementById("cust_hunt_length").value : difficulty]
    document.getElementById("minute_hunt").innerHTML = zeroPad(Math.floor(map_hunt_lengths[map_difficulty][map_size]/60),2)
    document.getElementById("second_hunt").innerHTML = zeroPad(map_hunt_lengths[map_difficulty][map_size] % 60,2)
    document.getElementsByClassName('normal_line')[0].style.left = `${(20/map_hunt_lengths[map_difficulty][map_size])*100}%`
    document.getElementsByClassName('hunt_size_label')[0].innerText = `${lang_data['{{map}}']}: ${["S","M","L"][map_size]}, ${lang_data['{{hunt}}']}: ${["L","M","H"][map_difficulty]}`
}

function toggleCountup(){
    count_direction = document.getElementById("timer_count_up").checked ? 1 : 0;
    document.getElementById('progressBarInner').style.float = count_direction == 0 ? 'left' : 'right';
    document.getElementById('cooldownProgressBarInner').style.float = count_direction == 0 ? 'left' : 'right';
    document.getElementById('huntProgressBarInner').style.float = count_direction == 0 ? 'left' : 'right';
}

function toggle_timer(force_start = false, force_stop = false){

    if(force_start){
        if($("#play_button").hasClass("playing")){
            smudge_worker.terminate();
            start_timer()
        }
        else{
            $("#play_button").addClass("playing")
            $("#play_button").attr('src','imgs/pause.png')
            start_timer()
        }
    }

    else if(force_stop){
        if($("#play_button").hasClass("playing")){
            $("#play_button").removeClass("playing")
            $("#play_button").attr('src','imgs/play.png')
            smudge_worker.terminate();
        }
        if(!muteTimerToggle){
            stop_sound = timer_snd[14].cloneNode()
            stop_sound.volume = volume
            stop_sound.play()
        }
    }

    else if($("#play_button").hasClass("playing")){
        $("#play_button").removeClass("playing")
        $("#play_button").attr('src','imgs/play.png')
        smudge_worker.terminate();
        if(!muteTimerToggle){
            stop_sound = timer_snd[14].cloneNode()
            stop_sound.volume = volume
            stop_sound.play()
        }
    }

    else{
        $("#play_button").addClass("playing")
        $("#play_button").attr('src','imgs/pause.png')
        start_timer()
    }
}

function start_timer(){
    if(!muteTimerToggle){
        start_sound = timer_snd[13].cloneNode()
        start_sound.volume = volume
        start_sound.play()
    }

    var time = 180 +1
    var prev_t = ""
    var snds_played = [0,0,0,0,0,0,0]

    var deadline = new Date(Date.now() + time *1000);
    var min_obj = document.getElementById("minute")
    var sec_obj = document.getElementById("second")
    var progress_bar = $('#progressBar')
    var progress_bar_inner = document.getElementById('progressBarInner')
    
    function progress() {
        var t = deadline - Date.now();
        var dt = t;
        var timeleft = Math.floor(t / 1000);

        var is_demon = timeleft <= 120 && timeleft > 90;
        var is_spirit = timeleft <= 90;
        var is_split = document.getElementById("timer_split").checked
        if (count_direction == 1){
            t = (181*1000) - t
            dt = t
        }
        else{
            dt = !is_spirit && is_split ? t - (90*1000) : t
        }

        var minutes = Math.floor((t % (1000 * 60 * 60)) / (1000 * 60));
        var seconds = Math.floor((t % (1000 * 60)) / 1000);
        var d_minutes = Math.floor((dt % (1000 * 60 * 60)) / (1000 * 60));
        var d_seconds = Math.floor((dt % (1000 * 60)) / 1000);

        if(!muteTimerCountdown){
            if (timeleft == 128){
                if(snds_played[0] == 0){
                    cur_sound = timer_snd[8].cloneNode()
                    cur_sound.volume = volume
                    cur_sound.play()
                    snds_played[0] = 1
                    snds_played[6] = 0
                }
            }
            if (timeleft == 98){
                if(snds_played[0] == 0){
                    cur_sound = timer_snd[7].cloneNode()
                    cur_sound.volume = volume
                    cur_sound.play()
                    snds_played[0] = 1
                    snds_played[6] = 0
                }
            }
            if (timeleft == 8){
                if(snds_played[0] == 0){
                    cur_sound = timer_snd[6].cloneNode()
                    cur_sound.volume = volume
                    cur_sound.play()
                    snds_played[0] = 1
                    snds_played[6] = 0
                }
            }
            if (timeleft == 125 || timeleft == 95 || timeleft == 5){
                if(snds_played[1] == 0){
                    cur_sound = timer_snd[5].cloneNode()
                    cur_sound.volume = volume
                    cur_sound.play()
                    snds_played[1] = 1
                    snds_played[0] = 0
                }
            }
            if (timeleft == 124 || timeleft == 94 || timeleft == 4){
                if(snds_played[2] == 0){
                    cur_sound = timer_snd[4].cloneNode()
                    cur_sound.volume = volume
                    cur_sound.play()
                    snds_played[2] = 1
                    snds_played[1] = 0
                }
            }
            if (timeleft == 123 || timeleft == 93 || timeleft == 3){
                if(snds_played[3] == 0){
                    cur_sound = timer_snd[3].cloneNode()
                    cur_sound.volume = volume
                    cur_sound.play()
                    snds_played[3] = 1
                    snds_played[2] = 0
                }
            }
            if (timeleft == 122 || timeleft == 92 || timeleft == 2){
                if(snds_played[4] == 0){
                    cur_sound = timer_snd[2].cloneNode()
                    cur_sound.volume = volume
                    cur_sound.play()
                    snds_played[4] = 1
                    snds_played[3] = 0
                }
            }
            if (timeleft == 121 || timeleft == 91 || timeleft == 1){
                if(snds_played[5] == 0){
                    cur_sound = timer_snd[1].cloneNode()
                    cur_sound.volume = volume
                    cur_sound.play()
                    snds_played[5] = 1
                    snds_played[4] = 0
                }
            }
            if (timeleft == 120 || timeleft == 90 || timeleft == 0){
                if(snds_played[6] == 0){
                    cur_sound = timer_snd[0].cloneNode()
                    cur_sound.volume = volume
                    cur_sound.play()
                    snds_played[6] = 1
                    snds_played[5] = 0
                }
            }
        }

        min_val = t<0 ? "00" : zeroPad(minutes,2);
        sec_val = t<0 ? "00" : zeroPad(seconds,2);
        d_min_val = t<0 ? "00" : zeroPad(d_minutes,2);
        d_sec_val = t<0 ? "00" : zeroPad(d_seconds,2);
        d_val = `${d_min_val[1]}:${d_sec_val}`
        if(prev_t != d_val){
            send_timer_link("TIMER_VAL",`${d_val}`,is_split && is_spirit ? 2 : is_split && is_demon ? 1 : 0)

            min_obj.innerHTML = min_val
            sec_obj.innerHTML = sec_val

            var progressBarWidth = count_direction == 0 ? timeleft * progress_bar.width() / (time-1) : (180 - timeleft) * progress_bar.width() / (time-1);
            progress_bar_inner.style.width = progressBarWidth;

            prev_t = d_val
        }

        if(timeleft <= 0){
            smudge_worker.terminate();
            $("#play_button").removeClass("playing")
            $("#play_button").attr('src','imgs/play.png')
        }
    };

    const blob = new Blob([`(function(e){setInterval(function(){this.postMessage(null)},100)})()`])
    const url = window.URL.createObjectURL(blob)
    smudge_worker = new Worker(url)
    smudge_worker.onmessage = () => {
        progress()
    }
}

function toggle_cooldown_timer(force_start = false, force_stop = false){
    if(force_start){
        if($("#play_cooldown_button").hasClass("playing")){
            cooldown_worker.terminate();
            start_cooldown_timer();
        }
        else{
            $("#play_cooldown_button").addClass("playing")
            $("#play_cooldown_button").attr('src','imgs/pause.png')
            start_cooldown_timer()
        }
    }

    else if(force_stop){
        if($("#play_cooldown_button").hasClass("playing")){
            $("#play_cooldown_button").removeClass("playing")
            $("#play_cooldown_button").attr('src','imgs/play.png')
            cooldown_worker.terminate();
        }
        if(!muteTimerToggle){
            stop_sound = timer_snd[14].cloneNode()
            stop_sound.volume = volume
            stop_sound.play()
        }
    }

    else if($("#play_cooldown_button").hasClass("playing")){
        $("#play_cooldown_button").removeClass("playing")
        $("#play_cooldown_button").attr('src','imgs/play.png')
        cooldown_worker.terminate();
        if(!muteTimerToggle){
            stop_sound = timer_snd[14].cloneNode()
            stop_sound.volume = volume
            stop_sound.play()
        }
    }
    else{
        $("#play_cooldown_button").addClass("playing")
        $("#play_cooldown_button").attr('src','imgs/pause.png')
        start_cooldown_timer()
    }
}

function start_cooldown_timer(){
    if(!muteTimerToggle){
        start_sound = timer_snd[13].cloneNode()
        start_sound.volume = volume
        start_sound.play()
    }

    var time = 25 +1
    var prev_t = ""
    var snds_played = [0,0,0,0,0]

    var deadline = new Date(Date.now() + time *1000);
    var min_obj = document.getElementById("minute_cooldown")
    var sec_obj = document.getElementById("second_cooldown")
    var progress_bar = $('#cooldownProgressBar')
    var progress_bar_inner = document.getElementById('cooldownProgressBarInner')
    
    function progress() {
        var t = deadline - Date.now();
        var timeleft = Math.floor(t / 1000);

        var is_demon = timeleft <= 5;
        var is_split = document.getElementById("timer_split").checked

        if (count_direction == 1)
            t = (26*1000) - t

        var minutes = Math.floor((t % (1000 * 60 * 60)) / (1000 * 60));
        var seconds = Math.floor((t % (1000 * 60)) / 1000);

        if(!muteTimerCountdown){
            if (timeleft == 10){
                if(snds_played[0] == 0){
                    cur_sound = timer_snd[9].cloneNode()
                    cur_sound.volume = volume
                    cur_sound.play()
                    snds_played[0] = 1
                    snds_played[4] = 0
                }
            }
            if (timeleft == 5){
                if(snds_played[0] == 0){
                    cur_sound = timer_snd[10].cloneNode()
                    cur_sound.volume = volume
                    cur_sound.play()
                    snds_played[0] = 1
                    snds_played[4] = 0
                }
            }
        
            if (timeleft == 8 || timeleft == 3){
                if(snds_played[1] == 0){
                    cur_sound = timer_snd[3].cloneNode()
                    cur_sound.volume = volume
                    cur_sound.play()
                    snds_played[1] = 1
                    snds_played[0] = 0
                    snds_played[4] = 0
                }
            }
            if (timeleft == 7 || timeleft == 2){
                if(snds_played[2] == 0){
                    cur_sound = timer_snd[2].cloneNode()
                    cur_sound.volume = volume
                    cur_sound.play()
                    snds_played[2] = 1
                    snds_played[1] = 0
                }
            }
            if (timeleft == 6 || timeleft == 1){
                if(snds_played[3] == 0){
                    cur_sound = timer_snd[1].cloneNode()
                    cur_sound.volume = volume
                    cur_sound.play()
                    snds_played[3] = 1
                    snds_played[2] = 0
                }
            }
            if (timeleft == 5 || timeleft == 0){
                if(snds_played[4] == 0){
                    cur_sound = timer_snd[0].cloneNode()
                    cur_sound.volume = volume
                    cur_sound.play()
                    snds_played[4] = 1
                    snds_played[3] = 0
                }
            }
        }

        min_val = t<0 ? "00" : zeroPad(minutes,2);
        sec_val = t<0 ? "00" : zeroPad(seconds,2);
        d_val = `${min_val[1]}:${sec_val}`
        if(prev_t != d_val){

            send_timer_link("COOLDOWN_VAL",`${d_val}`,is_split && is_demon ? 1 : 0)

            min_obj.innerHTML = min_val
            sec_obj.innerHTML = sec_val

            var progressBarWidth = count_direction == 0 ? timeleft * progress_bar.width() / (time-1) : (25 - timeleft) * progress_bar.width() / (time-1);
            progress_bar_inner.style.width = progressBarWidth;

            prev_t = d_val
        }

        if(timeleft <= 0){
            cooldown_worker.terminate();
            $("#play_cooldown_button").removeClass("playing")
            $("#play_cooldown_button").attr('src','imgs/play.png')
        }
    };

    const blob = new Blob([`(function(e){setInterval(function(){this.postMessage(null)},100)})()`])
    const url = window.URL.createObjectURL(blob)
    cooldown_worker = new Worker(url)
    cooldown_worker.onmessage = () => {
        progress()
    }
}

function toggle_hunt_timer(force_start = false, force_stop = false){
    if(force_start){
        if($("#play_hunt_button").hasClass("playing")){
            hunt_worker.terminate();
            start_hunt_timer();
        }
        else{
            $("#play_hunt_button").addClass("playing")
            $("#play_hunt_button").attr('src','imgs/pause.png')
            start_hunt_timer()
        }
    }

    else if(force_stop){
        if($("#play_hunt_button").hasClass("playing")){
            $("#play_hunt_button").removeClass("playing")
            $("#play_hunt_button").attr('src','imgs/play.png')
            hunt_worker.terminate();
        }
        if(!muteTimerToggle){
            stop_sound = timer_snd[14].cloneNode()
            stop_sound.volume = volume
            stop_sound.play()
        }
    }

    else if($("#play_hunt_button").hasClass("playing")){
        $("#play_hunt_button").removeClass("playing")
        $("#play_hunt_button").attr('src','imgs/play.png')
        hunt_worker.terminate();
        if(!muteTimerToggle){
            stop_sound = timer_snd[14].cloneNode()
            stop_sound.volume = volume
            stop_sound.play()
        }
    }
    else{
        $("#play_hunt_button").addClass("playing")
        $("#play_hunt_button").attr('src','imgs/pause.png')
        start_hunt_timer()
    }
}

function start_hunt_timer(){
    if(!muteTimerToggle){
        start_sound = timer_snd[13].cloneNode()
        start_sound.volume = volume
        start_sound.play()
    }

    var time = map_hunt_lengths[map_difficulty][map_size] +1;
    var prev_t = ""
    var snds_played = [0,0,0,0,0,0,0]

    var deadline = new Date(Date.now() + time *1000);
    var min_obj = document.getElementById("minute_hunt")
    var sec_obj = document.getElementById("second_hunt")
    var progress_bar = $('#huntProgressBar')
    var progress_bar_inner = document.getElementById('huntProgressBarInner')
    
    function progress() {
        var t = deadline - Date.now();
        var dt = t;
        var timeleft = Math.floor(t / 1000);
        var is_cursed = timeleft <= cursed_hunt;
        var is_split = document.getElementById("timer_split").checked
        if (count_direction == 1){
            t = ((map_hunt_lengths[map_difficulty][map_size]+1)*1000) - t
            dt = t
        }
        else{
            dt = !is_cursed && is_split ? t - (cursed_hunt*1000) : t
        }

        var minutes = Math.floor((t % (1000 * 60 * 60)) / (1000 * 60));
        var seconds = Math.floor((t % (1000 * 60)) / 1000);
        var d_minutes = Math.floor((dt % (1000 * 60 * 60)) / (1000 * 60));
        var d_seconds = Math.floor((dt % (1000 * 60)) / 1000);

        if(!muteTimerCountdown){
            if (timeleft == 27){
                if(snds_played[0] == 0){
                    cur_sound = timer_snd[11].cloneNode()
                    cur_sound.volume = volume
                    cur_sound.play()
                    snds_played[0] = 1
                    snds_played[6] = 0
                }
            }
            if (timeleft == 7){
                if(snds_played[0] == 0){
                    cur_sound = timer_snd[12].cloneNode()
                    cur_sound.volume = volume
                    cur_sound.play()
                    snds_played[0] = 1
                    snds_played[6] = 0
                }
            }

            if (timeleft == 25 || timeleft == 5){
                if(snds_played[1] == 0){
                    cur_sound = timer_snd[5].cloneNode()
                    cur_sound.volume = volume
                    cur_sound.play()
                    snds_played[1] = 1
                    snds_played[0] = 0
                }
            }

            if (timeleft == 24 || timeleft == 4){
                if(snds_played[2] == 0){
                    cur_sound = timer_snd[4].cloneNode()
                    cur_sound.volume = volume
                    cur_sound.play()
                    snds_played[2] = 1
                    snds_played[1] = 0
                }
            }
        
            if (timeleft == 23 || timeleft == 3){
                if(snds_played[3] == 0){
                    cur_sound = timer_snd[3].cloneNode()
                    cur_sound.volume = volume
                    cur_sound.play()
                    snds_played[3] = 1
                    snds_played[2] = 0
                }
            }
            if (timeleft == 22 || timeleft == 2){
                if(snds_played[4] == 0){
                    cur_sound = timer_snd[2].cloneNode()
                    cur_sound.volume = volume
                    cur_sound.play()
                    snds_played[4] = 1
                    snds_played[3] = 0
                }
            }
            if (timeleft == 21 || timeleft == 1){
                if(snds_played[5] == 0){
                    cur_sound = timer_snd[1].cloneNode()
                    cur_sound.volume = volume
                    cur_sound.play()
                    snds_played[5] = 1
                    snds_played[4] = 0
                }
            }
            if (timeleft == 20 || timeleft == 0){
                if(snds_played[6] == 0){
                    cur_sound = timer_snd[0].cloneNode()
                    cur_sound.volume = volume
                    cur_sound.play()
                    snds_played[6] = 1
                    snds_played[5] = 0
                }
            }
        }

        min_val = t<0 ? "00" : zeroPad(minutes,2);
        sec_val = t<0 ? "00" : zeroPad(seconds,2);
        d_min_val = t<0 ? "00" : zeroPad(d_minutes,2);
        d_sec_val = t<0 ? "00" : zeroPad(d_seconds,2);
        d_val = `${d_min_val[1]}:${d_sec_val}`
        if(prev_t != d_val){

            send_timer_link("HUNT_VAL",`${d_val}`,is_split && is_cursed ? 1 : 0)

            min_obj.innerHTML = min_val
            sec_obj.innerHTML = sec_val

            var progressBarWidth = count_direction == 0 ? timeleft * progress_bar.width() / (time-1) : (map_hunt_lengths[map_difficulty][map_size] - timeleft) * progress_bar.width() / (time-1);
            progress_bar_inner.style.width = progressBarWidth;

            prev_t = d_val
        }

        if(timeleft <= 0){
            hunt_worker.terminate();
            $("#play_hunt_button").removeClass("playing")
            $("#play_hunt_button").attr('src','imgs/play.png')
        }
    };

    const blob = new Blob([`(function(e){setInterval(function(){this.postMessage(null)},100)})()`])
    const url = window.URL.createObjectURL(blob)
    hunt_worker = new Worker(url)
    hunt_worker.onmessage = () => {
        progress()
    }
}

function toggle_sound_timer(force_start = false, force_stop = false){
    if(force_start){
        if($("#play_sound_button").hasClass("playing")){
            sound_worker.terminate();
            start_sound_timer();
        }
        else{
            $("#play_sound_button").addClass("playing")
            $("#play_sound_button").attr('src','imgs/pause.png')
            start_sound_timer()
        }
    }

    else if(force_stop){
        if($("#play_sound_button").hasClass("playing")){
            $("#play_sound_button").removeClass("playing")
            $("#play_sound_button").attr('src','imgs/play.png')
            sound_worker.terminate();
        }
        if(!muteTimerToggle){
            stop_sound = timer_snd[14].cloneNode()
            stop_sound.volume = volume
            stop_sound.play()
        }
    }

    else if($("#play_sound_button").hasClass("playing")){
        $("#play_sound_button").removeClass("playing")
        $("#play_sound_button").attr('src','imgs/play.png')
        sound_worker.terminate();
        if(!muteTimerToggle){
            stop_sound = timer_snd[14].cloneNode()
            stop_sound.volume = volume
            stop_sound.play()
        }
    }
    else{
        $("#play_sound_button").addClass("playing")
        $("#play_sound_button").attr('src','imgs/pause.png')
        start_sound_timer()
    }
}

function start_sound_timer(){
    if(!muteTimerToggle){
        start_sound = timer_snd[13].cloneNode()
        start_sound.volume = volume
        start_sound.play()
    }

    var time = 80 +1;
    var prev_t = ""
    var snds_played = [0,0,0,0,0,0,0]

    var deadline = new Date(Date.now() + time *1000);
    var min_obj = document.getElementById("minute_sound")
    var sec_obj = document.getElementById("second_sound")
    var progress_bar = $('#soundProgressBar')
    var progress_bar_inner = document.getElementById('soundProgressBarInner')
    
    function progress() {
        var t = deadline - Date.now();
        var dt = t;
        var timeleft = Math.floor(t / 1000);
        var is_normal = timeleft <= 15;
        var is_split = document.getElementById("timer_split").checked
        if (count_direction == 1)
            t = (81*1000) - t
        dt = t

        var minutes = Math.floor((t % (1000 * 60 * 60)) / (1000 * 60));
        var seconds = Math.floor((t % (1000 * 60)) / 1000);
        var d_minutes = Math.floor((dt % (1000 * 60 * 60)) / (1000 * 60));
        var d_seconds = Math.floor((dt % (1000 * 60)) / 1000);

        if(!muteTimerCountdown){
            if (timeleft == 23){
                if(snds_played[0] == 0){
                    cur_sound = timer_snd[16].cloneNode()
                    cur_sound.volume = volume
                    cur_sound.play()
                    snds_played[0] = 1
                    snds_played[6] = 0
                }
            }
            if (timeleft == 8){
                if(snds_played[0] == 0){
                    cur_sound = timer_snd[15].cloneNode()
                    cur_sound.volume = volume
                    cur_sound.play()
                    snds_played[0] = 1
                    snds_played[6] = 0
                }
            }

            if (timeleft == 20 || timeleft == 5){
                if(snds_played[1] == 0){
                    cur_sound = timer_snd[5].cloneNode()
                    cur_sound.volume = volume
                    cur_sound.play()
                    snds_played[1] = 1
                    snds_played[0] = 0
                }
            }

            if (timeleft == 19 || timeleft == 4){
                if(snds_played[2] == 0){
                    cur_sound = timer_snd[4].cloneNode()
                    cur_sound.volume = volume
                    cur_sound.play()
                    snds_played[2] = 1
                    snds_played[1] = 0
                }
            }
        
            if (timeleft == 18 || timeleft == 3){
                if(snds_played[3] == 0){
                    cur_sound = timer_snd[3].cloneNode()
                    cur_sound.volume = volume
                    cur_sound.play()
                    snds_played[3] = 1
                    snds_played[2] = 0
                }
            }
            if (timeleft == 17 || timeleft == 2){
                if(snds_played[4] == 0){
                    cur_sound = timer_snd[2].cloneNode()
                    cur_sound.volume = volume
                    cur_sound.play()
                    snds_played[4] = 1
                    snds_played[3] = 0
                }
            }
            if (timeleft == 16 || timeleft == 1){
                if(snds_played[5] == 0){
                    cur_sound = timer_snd[1].cloneNode()
                    cur_sound.volume = volume
                    cur_sound.play()
                    snds_played[5] = 1
                    snds_played[4] = 0
                }
            }
            if (timeleft == 15 || timeleft == 0){
                if(snds_played[6] == 0){
                    cur_sound = timer_snd[0].cloneNode()
                    cur_sound.volume = volume
                    cur_sound.play()
                    snds_played[6] = 1
                    snds_played[5] = 0
                }
            }
        }

        min_val = t<0 ? "00" : zeroPad(minutes,2);
        sec_val = t<0 ? "00" : zeroPad(seconds,2);
        d_min_val = t<0 ? "00" : zeroPad(d_minutes,2);
        d_sec_val = t<0 ? "00" : zeroPad(d_seconds,2);
        d_val = `${d_min_val[1]}:${d_sec_val}`
        if(prev_t != d_val){

            send_timer_link("SOUND_VAL",`${d_val}`,is_split && is_normal ? 1 : 0)

            min_obj.innerHTML = min_val
            sec_obj.innerHTML = sec_val

            var progressBarWidth = count_direction == 0 ? timeleft * progress_bar.width() / (time-1) : (80 - timeleft) * progress_bar.width() / (time-1);
            progress_bar_inner.style.width = progressBarWidth;

            prev_t = d_val
        }

        if(timeleft <= 0){
            sound_worker.terminate();
            $("#play_sound_button").removeClass("playing")
            $("#play_sound_button").attr('src','imgs/play.png')
        }
    };

    const blob = new Blob([`(function(e){setInterval(function(){this.postMessage(null)},100)})()`])
    const url = window.URL.createObjectURL(blob)
    sound_worker = new Worker(url)
    sound_worker.onmessage = () => {
        progress()
    }
}