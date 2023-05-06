const zeroPad = (num, places) => String(num).padStart(places, '0')

document.body.onkeyup = function(e) {
    if (e.key == "t" ||
        e.code == "KeyT" ||      
        e.keyCode == 84      
    ) {
        toggle_timer();
        send_timer();
    }
    if (e.key == "f" ||
        e.code == "KeyF" ||      
        e.keyCode == 70      
    ) {
        bpm_tap();
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
    new Audio('assets/finish.wav'),
    new Audio('assets/1.wav'),
    new Audio('assets/2.wav'),
    new Audio('assets/3.wav'),
    new Audio('assets/4.wav'),
    new Audio('assets/5.wav'),
    new Audio('assets/spirit_smudge.wav'),
    new Audio('assets/standard_smudge.wav'),
    new Audio('assets/demon_smudge.wav')];
timer_snd[0].preload = 'auto';
timer_snd[1].preload = 'auto';
timer_snd[2].preload = 'auto';
timer_snd[3].preload = 'auto';
timer_snd[4].preload = 'auto';
timer_snd[5].preload = 'auto';
timer_snd[6].preload = 'auto';
timer_snd[7].preload = 'auto';
timer_snd[8].preload = 'auto';
timer_snd[0].load();
timer_snd[1].load();
timer_snd[2].load();
timer_snd[3].load();
timer_snd[4].load();
timer_snd[5].load();
timer_snd[6].load();
timer_snd[7].load();
timer_snd[8].load();

var cur_timer;

function toggle_timer(){
    $("#play_button").toggleClass("playing")
    $("#play_button").attr('src',$("#play_button").hasClass("playing") ? 'imgs/pause.png' : 'imgs/play.png')

    if($("#play_button").hasClass("playing")){
        $("#play_button").attr('src','imgs/pause.png')
        start_timer()
    }
    else{
        $("#play_button").attr('src','imgs/play.png')
        clearTimeout(cur_timer)
    }
}

function start_timer(){

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


        min_obj.innerHTML = t<0 ? "00" : zeroPad(minutes,2);
        sec_obj.innerHTML = t<0 ? "00" : zeroPad(seconds,2);

        var progressBarWidth = timeleft * progress_bar.width() / timetotal;
        progress_bar_inner.style.width = progressBarWidth;
        
        if(timeleft > 0) {
            cur_timer = setTimeout(function() {
                progress(timetotal);
            }, 1000);
        }
        else{
            $("#play_button").toggleClass("playing")
            $("#play_button").attr('src','imgs/play.png')
        }
    };

    progress(time);
    
}