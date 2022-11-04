const all_evidence = ["DOTs","EMF 5","Fingerprints","Freezing","Ghost Orbs","Writing","Spirit Box"]
    const impossible = {
        "DOTs":{
            "EMF 5":["Writing"],
            "Fingerprints":["Freezing","Writing"],
            "Freezing":["Fingerprints","Writing","Spirit Box"],
            "Writing":["EMF 5","Fingerprints","Freezing"],
            "Spirit Box":["Freezing"]
        },
        "EMF 5":{
            "DOTs":["Writing"],
            "Fingerprints":["Spirit Box"],
            "Freezing":["Ghost Orbs"],
            "Ghost Orbs":["Freezing","Writing","Spirit Box"],
            "Writing":["DOTs","Ghost Orbs"],
            "Spirit Box":["Fingerprints","Ghost Orbs"]
        },
        "Fingerprints":{
            "DOTs":["Freezing","Writing"],
            "EMF 5":["Spirit Box"],
            "Freezing":["DOTs"],
            "Ghost Orbs":["Writing","Spirit Box"],
            "Writing":["DOTs","Ghost Orbs"],
            "Spirit Box":["EMF 5","Ghost Orbs"]
        },
        "Freezing":{
            "DOTs":["Fingerprints","Writing","Spirit Box"],
            "EMF 5":["Ghost Orbs"],
            "Freezing":["Ghost Orbs"],
            "Ghost Orbs":["Freezing","Writing","Spirit Box"],
            "Writing":["DOTs","Ghost Orbs"],
            "Spirit Box":["Fingerprints","Ghost Orbs"]
        },
        "Ghost Orbs":{
            "EMF 5":["Freezing","Writing","Spirit Box"],
            "Fingerprints":["Writing","Spirit Box"],
            "Freezing":["EMF 5"],
            "Writing":["EMF 5","Fingerprints"],
            "Spirit Box":["EMF 5","Fingerprints"]
        },
        "Writing":{
            "DOTs":["EMF 5","Fingerprints","Freezing"],
            "EMF 5":["DOTs","Ghost Orbs"],
            "Fingerprints":["DOTs","Ghost Orbs"],
            "Freezing":["DOTs"],
            "Ghost Orbs":["EMF 5","Fingerprints"]
        },
        "Spirit Box":{
            "DOTs":["Freezing"],
            "EMF 5":["Fingerprints","Ghost Orbs"],
            "Fingerprints":["EMF 5","Ghost Orbs"],
            "Freezing":["DOTs"],
            "Ghost Orbs":["EMF 5","Fingerprints"]
        }
    }

function tristate(elem){
    var checkbox = $(elem).find("#checkbox");
    var label = $(elem).find(".label");

    if (checkbox.hasClass("disabled")){
        return;
    }

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

    // Filter other evidences
    for (var i = 0; i < all_evidence.length; i++){
        var checkbox = document.getElementById(all_evidence[i]);
        $(checkbox).removeClass("block")
        $(checkbox).find("#checkbox").removeClass(["block","disabled"])
        $(checkbox).find(".label").removeClass("disabled-text")
    }
    if (evi_array.length == 2){
        var imp_evi = impossible[evi_array[0]][evi_array[1]]
        for (var i = 0; i < imp_evi.length; i++){
            var checkbox = document.getElementById(imp_evi[i]);
            $(checkbox).addClass("block")
            $(checkbox).find("#checkbox").removeClass(["good","bad"])
            $(checkbox).find("#checkbox").addClass(["neutral","block","disabled"])
            $(checkbox).find(".label").addClass("disabled-text")
            $(checkbox).find(".label").removeClass("strike")
        }
    }
    if (evi_array.length == 3){
        var imp_evi = all_evidence.filter(x => !evi_array.includes(x))
        for (var i = 0; i < imp_evi.length; i++){
            var checkbox = document.getElementById(imp_evi[i]);
            $(checkbox).addClass("block")
            $(checkbox).find("#checkbox").removeClass(["good","bad"])
            $(checkbox).find("#checkbox").addClass(["neutral","block","disabled"])
            $(checkbox).find(".label").removeClass("strike")
        }
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

        ghosts[i].className = ghosts[i].className.replaceAll(" hidden","");
        if (!keep){
            ghosts[i].className += " hidden";
        }
    }
}