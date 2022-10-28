function tristate(elem){
    var checkbox = $(elem).find("#checkbox");
    var label = $(elem).find(".label");
    if (checkbox.hasClass("neutral")){
        checkbox.removeClass("neutral")
        checkbox.addClass("good")
    }
    else if (checkbox.hasClass("good")){
        checkbox.removeClass("good")
        checkbox.addClass("bad")
        label.addClass("strike")
    }
    else if (checkbox.hasClass("bad")){
        checkbox.removeClass("bad")
        label.removeClass("strike")
        checkbox.addClass("neutral")
    }

    filter()
}

function select(elem){

    if (!$(elem).hasClass("faded")){
        var on = $(elem).hasClass("selected")

        var selected = $(".selected");
        for (var i = 0 ; i < selected.length; i++){
            $(selected[i]).removeClass("selected");
        }
        if ($(elem).hasClass("faded")){
            $(elem).removeClass("selected");
        }
        else if (!on){
            $(elem).addClass("selected");
        }
    }
}

function fade(elem){
    $(elem).toggleClass("faded");
    $(elem).removeClass("selected");
    $(elem).find(".ghost_name").toggleClass("strike")
}

function remove(elem){
    $(elem).addClass("permhidden");
}

function filter(){

    // Get values of checkboxes
    var base_speed = 1.7;
    var evi_array = [];
    var not_evi_array = [];
    var spe_array = [];
    var good_checkboxes = document.querySelectorAll(('#checkbox.good'));
    var bad_checkboxes = document.querySelectorAll(('#checkbox.bad'));
    var speed_checkboxes = document.querySelectorAll(('input[type=checkbox]:checked'));

    for (var i = 0; i < good_checkboxes.length; i++) {
        evi_array.push(good_checkboxes[i].parentElement.value);
    }

    for (var i = 0; i < bad_checkboxes.length; i++) {
        not_evi_array.push(bad_checkboxes[i].parentElement.value);
    }

    for (var i = 0; i < speed_checkboxes.length; i++) {
        spe_array.push(speed_checkboxes[i].value);
    }

    // Get all ghosts
    var ghosts = document.getElementsByClassName("ghost_card")

    for (var i = 0; i < ghosts.length; i++){
        var keep = true;

        //Check for evidence
        if (evi_array.length > 0){
            var evidence = ghosts[i].getElementsByClassName("ghost_evidence")[0];
            evi_array.forEach(function (item,index){
                if(!evidence.textContent.includes(item)){
                    keep = false
                }
            });
        }

        // Check for not evidence
        if (not_evi_array.length > 0){
            var evidence = ghosts[i].getElementsByClassName("ghost_evidence")[0];
            not_evi_array.forEach(function (item,index){
                if(evidence.textContent.includes(item)){
                    keep = false
                }
            });
        }

        //Check for speed
        if (spe_array.length > 0){
            var speed = ghosts[i].getElementsByClassName("ghost_speed")[0].textContent;
            if (speed.includes('|')){
                var speeds = speed.split('|')
            }
            else if(speed.includes('-')){
                var speeds = speed.split('-')
            }
            else{
                var speeds = [speed]
            }

            var min_speed = parseFloat(speeds[0].replaceAll(" m/s",""))
            if (speeds.length > 1){
                var max_speed = parseFloat(speeds[1].replaceAll(" m/s",""))
            }
            else{
                var max_speed = min_speed
            }

            var skeep = false,nkeep = false,fkeep = false;
            spe_array.forEach(function (item,index){
                if (item === "Slow" && min_speed < base_speed){
                    skeep = true;
                }
                if (item === "Normal" && (min_speed === base_speed || max_speed === base_speed)){
                    nkeep = true;
                }
                if (item === "Fast" && max_speed > base_speed){
                    fkeep = true;
                }
            });

            if(!skeep && !nkeep && !fkeep){
                keep = false;
            }
        }

        if (keep){
            ghosts[i].className = ghosts[i].className.replaceAll(" hidden","");
        }
        else{
            ghosts[i].className += " hidden";
        }
    }
}