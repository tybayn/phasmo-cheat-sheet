const zeroPad = (num, places) => String(num).padStart(places, '0')

document.body.onkeyup = function(e) {
    if (e.key == "t" ||
        e.code == "KeyT" ||      
        e.keyCode == 84      
    ) {
        toggle_timer();
        send_timer();
    }
    if (e.key == "h" ||
        e.code == "KeyH" ||      
        e.keyCode == 72      
    ) {
        toggle_cooldown_timer();
        send_cooldown_timer();
    }
    if (e.key == "f" ||
        e.code == "KeyF" ||      
        e.keyCode == 70      
    ) {
        bpm_tap();
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
}

var timer_snd = [
    new Audio('assets/finish.mp3'),
    new Audio('assets/1.mp3'),
    new Audio('assets/2.mp3'),
    new Audio('assets/3.mp3'),
    new Audio('assets/4.mp3'),
    new Audio('assets/5.mp3'),
    new Audio('assets/spirit_smudge.mp3'),
    new Audio('assets/standard_smudge.mp3'),
    new Audio('assets/demon_smudge.mp3'),
    new Audio('assets/demon_cooldown.mp3'),
    new Audio('assets/standard_cooldown.mp3'),
    new Audio('assets/start.mp3'),
    new Audio('assets/stop.mp3')];
timer_snd[0].preload = 'auto';
timer_snd[1].preload = 'auto';
timer_snd[2].preload = 'auto';
timer_snd[3].preload = 'auto';
timer_snd[4].preload = 'auto';
timer_snd[5].preload = 'auto';
timer_snd[6].preload = 'auto';
timer_snd[7].preload = 'auto';
timer_snd[8].preload = 'auto';
timer_snd[9].preload = 'auto';
timer_snd[10].preload = 'auto';
timer_snd[11].preload = 'auto';
timer_snd[12].preload = 'auto';
timer_snd[0].load();
timer_snd[1].load();
timer_snd[2].load();
timer_snd[3].load();
timer_snd[4].load();
timer_snd[5].load();
timer_snd[6].load();
timer_snd[7].load();
timer_snd[8].load();
timer_snd[9].load();
timer_snd[10].load();
timer_snd[11].load();
timer_snd[12].load();

var cur_timer;
var cur_cooldown_timer;

function toggle_timer(force_start = false, force_stop = false){

    if(force_start){
        if($("#play_button").hasClass("playing")){
            clearTimeout(cur_timer)
            setTimeout(function() {
                start_timer();
            }, 200)
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
            clearTimeout(cur_timer)
        }
        if(!muteTimerToggle){
            stop_sound = timer_snd[12].cloneNode()
            stop_sound.volume = volume
            stop_sound.play()
        }
    }

    else if($("#play_button").hasClass("playing")){
        $("#play_button").removeClass("playing")
        $("#play_button").attr('src','imgs/play.png')
        clearTimeout(cur_timer)
        if(!muteTimerToggle){
            stop_sound = timer_snd[12].cloneNode()
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
        start_sound = timer_snd[11].cloneNode()
        start_sound.volume = volume
        start_sound.play()
    }

    var time = 180

    var deadline = new Date(Date.now() + time *1000);
    var min_obj = document.getElementById("minute")
    var sec_obj = document.getElementById("second")
    var progress_bar = $('#progressBar')
    var progress_bar_inner = document.getElementById('progressBarInner')
    
    function progress(timetotal) {
        var t = deadline - Date.now();
        var minutes = Math.floor((t % (1000 * 60 * 60)) / (1000 * 60));
        var seconds = Math.floor((t % (1000 * 60)) / 1000);
        var timeleft = Math.floor(t / 1000);

        if(!muteTimerCountdown){
            if (timeleft == 128){
                cur_sound = timer_snd[8].cloneNode()
                cur_sound.volume = volume
                cur_sound.play()
            }
            if (timeleft == 98){
                cur_sound = timer_snd[7].cloneNode()
                cur_sound.volume = volume
                cur_sound.play()
            }
            if (timeleft == 8){
                cur_sound = timer_snd[6].cloneNode()
                cur_sound.volume = volume
                cur_sound.play()
            }
            if (timeleft == 125 || timeleft == 95 || timeleft == 5){
                cur_sound = timer_snd[5].cloneNode()
                cur_sound.volume = volume
                cur_sound.play()
            }
            if (timeleft == 124 || timeleft == 94 || timeleft == 4){
                cur_sound = timer_snd[4].cloneNode()
                cur_sound.volume = volume
                cur_sound.play()
            }
            if (timeleft == 123 || timeleft == 93 || timeleft == 3){
                cur_sound = timer_snd[3].cloneNode()
                cur_sound.volume = volume
                cur_sound.play()
            }
            if (timeleft == 122 || timeleft == 92 || timeleft == 2){
                cur_sound = timer_snd[2].cloneNode()
                cur_sound.volume = volume
                cur_sound.play()
            }
            if (timeleft == 121 || timeleft == 91 || timeleft == 1){
                cur_sound = timer_snd[1].cloneNode()
                cur_sound.volume = volume
                cur_sound.play()
            }
            if (timeleft == 120 || timeleft == 90 || timeleft == 0){
                cur_sound = timer_snd[0].cloneNode()
                cur_sound.volume = volume
                cur_sound.play()
            }
        }

        min_val = t<0 ? "00" : zeroPad(minutes,2);
        sec_val = t<0 ? "00" : zeroPad(seconds,2);

        send_timer_link("TIMER_VAL",`${min_val[1]}:${sec_val}`)

        min_obj.innerHTML = min_val
        sec_obj.innerHTML = sec_val

        var progressBarWidth = timeleft * progress_bar.width() / timetotal;
        progress_bar_inner.style.width = progressBarWidth;
        
        if(timeleft > 0) {
            cur_timer = setTimeout(function() {
                progress(timetotal);
            }, 1000);
        }
        else{
            $("#play_button").removeClass("playing")
            $("#play_button").attr('src','imgs/play.png')
        }
    };

    progress(time);
    
}

function toggle_cooldown_timer(force_start = false, force_stop = false){
    if(force_start){
        if($("#play_cooldown_button").hasClass("playing")){
            clearTimeout(cur_cooldown_timer)
            setTimeout(function() {
                start_cooldown_timer();
            }, 200)
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
            clearTimeout(cur_cooldown_timer)
        }
        if(!muteTimerToggle){
            stop_sound = timer_snd[12].cloneNode()
            stop_sound.volume = volume
            stop_sound.play()
        }
    }

    else if($("#play_cooldown_button").hasClass("playing")){
        $("#play_cooldown_button").removeClass("playing")
        $("#play_cooldown_button").attr('src','imgs/play.png')
        clearTimeout(cur_cooldown_timer)
        if(!muteTimerToggle){
            stop_sound = timer_snd[12].cloneNode()
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
        start_sound = timer_snd[11].cloneNode()
        start_sound.volume = volume
        start_sound.play()
    }

    var time = 25

    var deadline = new Date(Date.now() + time *1000);
    var min_obj = document.getElementById("minute_cooldown")
    var sec_obj = document.getElementById("second_cooldown")
    var progress_bar = $('#cooldownProgressBar')
    var progress_bar_inner = document.getElementById('cooldownProgressBarInner')
    
    function progress(timetotal) {
        var t = deadline - Date.now();
        var minutes = Math.floor((t % (1000 * 60 * 60)) / (1000 * 60));
        var seconds = Math.floor((t % (1000 * 60)) / 1000);
        var timeleft = Math.floor(t / 1000);

        if(!muteTimerCountdown){
            if (timeleft == 10){
                cur_sound = timer_snd[9].cloneNode()
                cur_sound.volume = volume
                cur_sound.play()
            }
            if (timeleft == 5){
                cur_sound = timer_snd[10].cloneNode()
                cur_sound.volume = volume
                cur_sound.play()
            }
        
            if (timeleft == 8 || timeleft == 3){
                cur_sound = timer_snd[3].cloneNode()
                cur_sound.volume = volume
                cur_sound.play()
            }
            if (timeleft == 7 || timeleft == 2){
                cur_sound = timer_snd[2].cloneNode()
                cur_sound.volume = volume
                cur_sound.play()
            }
            if (timeleft == 6 || timeleft == 1){
                cur_sound = timer_snd[1].cloneNode()
                cur_sound.volume = volume
                cur_sound.play()
            }
            if (timeleft == 5 || timeleft == 0){
                cur_sound = timer_snd[0].cloneNode()
                cur_sound.volume = volume
                cur_sound.play()
            }
        }

        min_val = t<0 ? "00" : zeroPad(minutes,2);
        sec_val = t<0 ? "00" : zeroPad(seconds,2);

        send_timer_link("COOLDOWN_VAL",`${min_val[1]}:${sec_val}`)

        min_obj.innerHTML = min_val
        sec_obj.innerHTML = sec_val

        var progressBarWidth = timeleft * progress_bar.width() / timetotal;
        progress_bar_inner.style.width = progressBarWidth;
        
        if(timeleft > 0) {
            cur_cooldown_timer = setTimeout(function() {
                progress(timetotal);
            }, 1000);
        }
        else{
            $("#play_cooldown_button").removeClass("playing")
            $("#play_cooldown_button").attr('src','imgs/play.png')
        }
    };

    progress(time);
    
}