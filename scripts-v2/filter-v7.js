function getCookie(e){let t=e+"=",i=decodeURIComponent(document.cookie).split(";");for(let n=0;n<i.length;n++){let o=i[n];for(;" "==o.charAt(0);)o=o.substring(1);if(0==o.indexOf(t))return o.substring(t.length,o.length)}return""}
function setCookie(e,t,i){let n=new Date;n.setTime(n.getTime()+864e5*i);let o="expires="+n.toUTCString();document.cookie=e+"="+t+";"+o+";path=/"}

const all_evidence = ["DOTs","EMF 5","Fingerprints","Freezing","Ghost Orbs","Writing","Spirit Box"]
const all_ghosts = ["Spirit","Wraith","Phantom","Poltergeist","Banshee","Jinn","Mare","Revenant","Shade","Demon","Yurei","Oni","Yokai","Hantu","Goryo","Myling","Onryo","The Twins","Raiju","Obake","The Mimic","Moroi","Deogen","Thaye"]
const all_speed = ["Slow","Normal","Fast"]

var state = {"evidence":{},"speed":{"Slow":0,"Normal":0,"Fast":0},"ghosts":{}}
var user_settings = {"num_evidences":3,"ghost_modifier":2,"volume":50,"offset":0,"sound_type":0,"speed_logic_type":0,"bpm":0}


let hasLink = false;

function loadData(){
    fetch("https://zero-network.net/phasmophobia/data/ghosts.json", {signal: AbortSignal.timeout(6000)})
    .then(data => data.json())
    .then(data => {
        loadSettings()

        var cards = document.getElementById('cards')
        var cur_version = document.getElementById('current-version-label')
        var evidence_list = document.getElementById('evidence')

        evidence_list.innerHTML = "";
        for(var i = 0; i < data.evidence.length; i++){
            evidence_list.innerHTML += `
            <button id="${data.evidence[i]}" class="tricheck white" name="evidence" onclick="tristate(this)" value="${data.evidence[i]}">
                <div id="checkbox" class="neutral"><span class="icon"></span></div>
                <div class="label">${data.evidence[i]}</div>
            </button>
            `
        }

        cards.innerHTML = "";
        for(var i = 0; i < data.ghosts.length; i++){
            bpm_speeds.add(data.ghosts[i].min_speed)
            if(data.ghosts[i].max_speed != null){bpm_speeds.add(data.ghosts[i].max_speed)}
            if(data.ghosts[i].alt_speed != null){bpm_speeds.add(data.ghosts[i].alt_speed)}
            var ghost = new Ghost(data.ghosts[i]);
            cards.innerHTML += `${ghost.ghostTemplate}`
        }
        cur_version.innerHTML = `${data.version}`

        var start_state = getCookie("state")

        for (var i = 0; i < all_evidence.length; i++){
            state["evidence"][all_evidence[i]] = 0
        }
        for (var i = 0; i < all_ghosts.length; i++){
            state["ghosts"][all_ghosts[i]] = 1
        }
        
        if (!start_state){
            start_state = state;
        }
        else{
            start_state = JSON.parse(start_state)
        }
    
        for (const [key, value] of Object.entries(start_state["ghosts"])){ 
            if (value == 0){
                fade(document.getElementById(key));
            }
            else if (value == -1){
                remove(document.getElementById(key));
            }
            else if (value == 2){
                select(document.getElementById(key));
            }
        }
        for (const [key, value] of Object.entries(start_state["evidence"])){ 
            if (value == 1){
                tristate(document.getElementById(key));
            }
            else if (value == -1){
                tristate(document.getElementById(key));
                tristate(document.getElementById(key));
            }
        }
        for (const [key, value] of Object.entries(start_state["speed"])){ 
            if (value == 1){
                $("#"+key)[0].click();
            }
        }
        
        loadSettings()
        filter()

    })
    .catch(error => {
        loadSettings()

        fetch("backup-data/ghosts_backup.json")
        .then(data => data.json())
        .then(data => {
            var cards = document.getElementById('cards')
            var cur_version = document.getElementById('current-version-label')
            var evidence_list = document.getElementById('evidence')

            evidence_list.innerHTML = "";
            for(var i = 0; i < data.evidence.length; i++){
                evidence_list.innerHTML += `
                <button id="${data.evidence[i]}" class="tricheck phasfont white" name="evidence" onclick="tristate(this)" value="${data.evidence[i]}">
                    <div id="checkbox" class="neutral"><span class="icon"></span></div>
                    <div class="label">${data.evidence[i]}</div>
                </button>
                `
            }
            cards.innerHTML = "";
            for(var i = 0; i < data.ghosts.length; i++){
                var ghost = new Ghost(data.ghosts[i]);
                cards.innerHTML += `${ghost.ghostTemplate}`
            }
            cur_version.innerHTML = `${data.version}`
            loadSettings()
            filter()
        })
    })
}

function dualstate(elem,ignore_link=false){
    var checkbox = $(elem).find("#checkbox");

    if (checkbox.hasClass("disabled")){
        return;
    }

    if (checkbox.hasClass("neutral")){
        checkbox.removeClass("neutral")
        checkbox.addClass("good")
    }
    else if (checkbox.hasClass("good")){
        checkbox.removeClass("good")
        checkbox.addClass("neutral")
    }

    if(!ignore_link){filter(ignore_link)}
}

function tristate(elem,ignore_link=false){
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

    if(!ignore_link){filter(ignore_link)}
}

function select(elem,ignore_link=false){
    if (!$(elem).hasClass("faded")){
        var on = false
        if (!ignore_link){

            on = $(elem).hasClass("selected")

            for (const [key, value] of Object.entries(state["ghosts"])){ 
                if(value == 2){
                    state['ghosts'][key] = 1
                    document.getElementById(key).className = "ghost_card"
                }
            }
        }

        if (on){
            $(elem).removeClass("selected");
            state["ghosts"][$(elem).find(".ghost_name")[0].innerText] = 1;
        }
        else{
            $(elem).addClass("selected");
            state["ghosts"][$(elem).find(".ghost_name")[0].innerText] = 2;
        }
        setCookie("state",JSON.stringify(state),1)
        if(!ignore_link){filter(ignore_link)}

    }
}

function fade(elem,ignore_link=false){
    if(!ignore_link){
        if (state["ghosts"][$(elem).find(".ghost_name")[0].innerText] != 0){
            state["ghosts"][$(elem).find(".ghost_name")[0].innerText] = 0;
        }
        else{
            state["ghosts"][$(elem).find(".ghost_name")[0].innerText] = 1;
        }
    }
    $(elem).toggleClass("faded");
    $(elem).removeClass("selected");
    $(elem).find(".ghost_name").toggleClass("strike");
    setCookie("state",JSON.stringify(state),1)
    if (hasLink && !ignore_link){send_state()}
}

function remove(elem,ignore_link=false){
    state["ghosts"][$(elem).find(".ghost_name")[0].innerText] = -1;
    $(elem).addClass("permhidden");
    setCookie("state",JSON.stringify(state),1)
    if (hasLink && !ignore_link){send_state()}
}

function filter(ignore_link=false){
    state["evidence"] = {}
    state["speed"] = {"Slow":0,"Normal":0,"Fast":0}
    for (var i = 0; i < all_evidence.length; i++){
        state["evidence"][all_evidence[i]] = 0
    }

    // Get values of checkboxes
    var base_speed = 1.7;
    var evi_array = [];
    var not_evi_array = [];
    var spe_array = [];
    var good_checkboxes = document.querySelectorAll('[name="evidence"] .good');
    var bad_checkboxes = document.querySelectorAll('[name="evidence"] .bad');
    var speed_checkboxes = document.querySelectorAll('[name="speed"] .good');
    var num_evidences = document.getElementById("num_evidence").value
    var speed_logic_type = document.getElementById("speed_logic_type").checked ? 1 : 0;

    for (var i = 0; i < good_checkboxes.length; i++) {
        evi_array.push(good_checkboxes[i].parentElement.value);
        state["evidence"][good_checkboxes[i].parentElement.value] = 1;
    }

    for (var i = 0; i < bad_checkboxes.length; i++) {
        not_evi_array.push(bad_checkboxes[i].parentElement.value);
        state["evidence"][bad_checkboxes[i].parentElement.value] = -1;
    }

    for (var i = 0; i < speed_checkboxes.length; i++) {
        spe_array.push(speed_checkboxes[i].parentElement.value);
        state["speed"][speed_checkboxes[i].parentElement.value] = 1;
    }


    // Filter other evidences
    for (var i = 0; i < all_evidence.length; i++){
        var checkbox = document.getElementById(all_evidence[i]);
        $(checkbox).removeClass("block")
        $(checkbox).find("#checkbox").removeClass(["block","disabled"])
        $(checkbox).find(".label").removeClass("disabled-text")
    }
    // Filter other evidences
    for (var i = 0; i < all_speed.length; i++){
        var checkbox = document.getElementById(all_speed[i]);
        $(checkbox).removeClass("block")
        $(checkbox).find("#checkbox").removeClass(["block","disabled"])
        $(checkbox).find(".label").removeClass("disabled-text")
    }

    // Get all ghosts
    var ghosts = document.getElementsByClassName("ghost_card")
    var keep_evidence = new Set();
    var keep_speed = new Set();
    var mimic_evi = []
    var mimic_nm_evi = ""

    for (var i = 0; i < ghosts.length; i++){
        var keep = true;
        var name = ghosts[i].getElementsByClassName("ghost_name")[0].textContent;
        var evi_objects = ghosts[i].getElementsByClassName("ghost_evidence_item")
        var evidence = []
        for (var j = 0; j < evi_objects.length; j++){evidence.push(evi_objects[j].textContent)}
        var nm_evidence = ghosts[i].getElementsByClassName("ghost_nightmare_evidence")[0].textContent;
        var speed = ghosts[i].getElementsByClassName("ghost_speed")[0].textContent;
        if (name == "The Mimic"){
            evidence.push("Ghost Orbs")
            mimic_evi = evidence
            nm_evidence = "Ghost Orbs"
            mimic_nm_evi = "Ghost Orbs"
        }
        

        // Check for evidences
        // Standard
        if (num_evidences == "3"){

            if (evi_array.length > 0){
                evi_array.forEach(function (item,index){
                    if(!evidence.includes(item)){
                        keep = false
                    }
                });
            }

            if (not_evi_array.length > 0){
                not_evi_array.forEach(function (item,index){
                    if(evidence.includes(item)){
                        keep = false
                    }
                });
            }
        }

        // Nightmare Mode
        else if (num_evidences == "2"){


            if (evi_array.length == 3 && name != "The Mimic"){
                keep = false
            }
            else if (evi_array.length > 0){
                if (evi_array.length > (evidence.length > 3 ? 2 : 1) && evidence.filter(x => !evi_array.includes(x)).includes(nm_evidence)){
                    keep = false
                }

                evi_array.forEach(function (item,index){
                    if(!evidence.includes(item)){
                        keep = false
                    }
                });

            }

            if (nm_evidence != "" && not_evi_array.includes(nm_evidence)){
                keep = false
            }
            if (not_evi_array.length > 1){
                if (evidence.filter(x => !not_evi_array.includes(x)).length <= (evidence.length > 3 ? 2 : 1)){
                    keep = false
                }
            }
        }

        // Insanity
        else if (num_evidences == "1"){

            if (evi_array.length == 2 && name != "The Mimic"){
                keep = false
            }
            else if (evi_array.length > 0){
                if (evi_array.length > (evidence.length > 3 ? 1 : 0) && evidence.filter(x => !evi_array.includes(x)).includes(nm_evidence)){
                    keep = false
                }

                evi_array.forEach(function (item,index){
                    if(!evidence.includes(item)){
                        keep = false
                    }
                });

            }

            if (nm_evidence != "" && not_evi_array.includes(nm_evidence)){
                keep = false
            }
            if (not_evi_array.length > 1){
                if (evidence.filter(x => !not_evi_array.includes(x)).length <= (evidence.length > 3 ? 1 : 0)){
                    keep = false
                }
            }
        }

        // Apocalypse
        else if (num_evidences == "0"){

            if (evi_array.length > 0 && name != "The Mimic"){
                keep = false
            }

            if (not_evi_array.length > 0 && name == "The Mimic"){
                keep = false
            }
        }

        //Check for speed
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

        // Check if speed is being kept
        if (keep){
            if(min_speed < base_speed || name == "The Mimic"){
                keep_speed.add('Slow')
            }
            if ((speed_type == "range" && min_speed <= base_speed && base_speed <= max_speed) || name == "The Mimic"){
                keep_speed.add('Normal')
            }
            else if(min_speed === base_speed || max_speed === base_speed){
                keep_speed.add('Normal')
            }
            if(max_speed > base_speed || name == "The Mimic"){
                keep_speed.add('Fast')
            }
        }

        // Check if ghost is being kept
        if (spe_array.length > 0){
            var skeep = false,nkeep = false,fkeep = false;

            var shas = (min_speed < base_speed || name == "The Mimic")
            var nhas = (speed_type == "or" && (min_speed === base_speed || max_speed === base_speed || name == "The Mimic")) || (speed_type == "range" && min_speed <= base_speed && base_speed <= max_speed)
            var fhas = (max_speed > base_speed || name == "The Mimic")

            spe_array.forEach(function (item,index){

                if (item == "Slow"){
                    skeep = true
                }
                else if (item == "Normal"){
                    nkeep = true
                }
                else if (item == "Fast"){
                    fkeep = true
                }
            });

            // OR Logic
            if (speed_logic_type == 0){
                if(!((skeep && shas) || (nkeep && nhas) || (fkeep && fhas))){
                    keep = false
                }
            }

            // AND Logic
            else{
                if(!(skeep == (skeep && shas) && nkeep == (nkeep && nhas) && fkeep == (fkeep && fhas))){
                    keep = false
                }
            }

        }

        ghosts[i].className = ghosts[i].className.replaceAll(" hidden","");
        if (!keep){
            ghosts[i].className += " hidden";
        }
        else{
            for (var e = 0; e < evidence.length; e++){
                keep_evidence.add(evidence[e])
            }
        }
    }

    if (num_evidences == "3"){
        if (evi_array.length > 0){
            all_evidence.filter(evi => !keep_evidence.has(evi)).forEach(function(item){
                if (!not_evi_array.includes(item)){
                    var checkbox = document.getElementById(item);
                    $(checkbox).addClass("block")
                    $(checkbox).find("#checkbox").removeClass(["good","bad"])
                    $(checkbox).find("#checkbox").addClass(["neutral","block","disabled"])
                    $(checkbox).find(".label").addClass("disabled-text")
                    $(checkbox).find(".label").removeClass("strike")
                }
            })
        }
    }

    else if (num_evidences == "2"){
        var keep_evi = evi_array
        if (keep_evi.length == 3){
            all_evidence.filter(evi => !keep_evi.includes(evi)).forEach(function(item){
                if (!not_evi_array.includes(item)){
                    var checkbox = document.getElementById(item);
                    $(checkbox).addClass("block")
                    $(checkbox).find("#checkbox").removeClass(["good","bad"])
                    $(checkbox).find("#checkbox").addClass(["neutral","block","disabled"])
                    $(checkbox).find(".label").addClass("disabled-text")
                    $(checkbox).find(".label").removeClass("strike")
                }
            })
        }
        else if (keep_evi.length == 2){
            if (keep_evi.every(x => mimic_evi.includes(x))){
                mimic_evi.pop(mimic_nm_evi)
                if (keep_evi.every(x => mimic_evi.includes(x))){
                    keep_evi.push(mimic_nm_evi)
                }
                else{
                    keep_evi=mimic_evi
                    keep_evi.push(mimic_nm_evi)
                } 
            }

            all_evidence.filter(evi => !keep_evi.includes(evi)).forEach(function(item){
                if (!not_evi_array.includes(item)){
                    var checkbox = document.getElementById(item);
                    $(checkbox).addClass("block")
                    $(checkbox).find("#checkbox").removeClass(["good","bad"])
                    $(checkbox).find("#checkbox").addClass(["neutral","block","disabled"])
                    $(checkbox).find(".label").addClass("disabled-text")
                    $(checkbox).find(".label").removeClass("strike")
                }
            })
        }
        else if (keep_evi.length > 0){
            all_evidence.filter(evi => !keep_evidence.has(evi)).forEach(function(item){
                if (!not_evi_array.includes(item)){
                    var checkbox = document.getElementById(item);
                    $(checkbox).addClass("block")
                    $(checkbox).find("#checkbox").removeClass(["good","bad"])
                    $(checkbox).find("#checkbox").addClass(["neutral","block","disabled"])
                    $(checkbox).find(".label").addClass("disabled-text")
                    $(checkbox).find(".label").removeClass("strike")
                }
            })
        }
    }

    else if (num_evidences == "1"){
        var keep_evi = evi_array
        if (keep_evi.length == 2){
            all_evidence.filter(evi => !keep_evi.includes(evi)).forEach(function(item){
                if (!not_evi_array.includes(item)){
                    var checkbox = document.getElementById(item);
                    $(checkbox).addClass("block")
                    $(checkbox).find("#checkbox").removeClass(["good","bad"])
                    $(checkbox).find("#checkbox").addClass(["neutral","block","disabled"])
                    $(checkbox).find(".label").addClass("disabled-text")
                    $(checkbox).find(".label").removeClass("strike")
                }
            })
        }
        else if (keep_evi.length == 1){
            if (keep_evi.every(x => mimic_evi.includes(x))){
                mimic_evi.pop(mimic_nm_evi)
                if (keep_evi.every(x => mimic_evi.includes(x))){
                    keep_evi.push(mimic_nm_evi)
                }
                else{
                    keep_evi=mimic_evi
                    keep_evi.push(mimic_nm_evi)
                } 
            }

            all_evidence.filter(evi => !keep_evi.includes(evi)).forEach(function(item){
                if (!not_evi_array.includes(item)){
                    var checkbox = document.getElementById(item);
                    $(checkbox).addClass("block")
                    $(checkbox).find("#checkbox").removeClass(["good","bad"])
                    $(checkbox).find("#checkbox").addClass(["neutral","block","disabled"])
                    $(checkbox).find(".label").addClass("disabled-text")
                    $(checkbox).find(".label").removeClass("strike")
                }
            })
        }
        else if (keep_evi.length > 0){
            all_evidence.filter(evi => !keep_evidence.has(evi)).forEach(function(item){
                if (!not_evi_array.includes(item)){
                    var checkbox = document.getElementById(item);
                    $(checkbox).addClass("block")
                    $(checkbox).find("#checkbox").removeClass(["good","bad"])
                    $(checkbox).find("#checkbox").addClass(["neutral","block","disabled"])
                    $(checkbox).find(".label").addClass("disabled-text")
                    $(checkbox).find(".label").removeClass("strike")
                }
            })
        }
    }

    else if (num_evidences == "0"){
        all_evidence.filter(evi => evi != 'Ghost Orbs').forEach(function(item){
            var checkbox = document.getElementById(item);
            $(checkbox).addClass("block")
            $(checkbox).find("#checkbox").removeClass(["good","bad"])
            $(checkbox).find("#checkbox").addClass(["neutral","block","disabled"])
            $(checkbox).find(".label").addClass("disabled-text")
            $(checkbox).find(".label").removeClass("strike")
        })
    }

    if (evi_array.length > 0){
        all_speed.filter(spe => !keep_speed.has(spe)).forEach(function(item){
            var checkbox = document.getElementById(item);
            $(checkbox).addClass("block")
            $(checkbox).find("#checkbox").removeClass(["good"])
            $(checkbox).find("#checkbox").addClass(["neutral","block","disabled"])
            $(checkbox).find(".label").addClass("disabled-text")
        })
    }
    
    setCookie("state",JSON.stringify(state),1)
    if (hasLink && !ignore_link){send_state()}
}

function showGlobe(){
    $("#world").fadeToggle(400)
    reloadData()
    scale()
}

function showInfo(){

    if (!$("#blackout").is(":visible")){
        set_sparkle(false)
        initSparkling()
    }
    else{
        set_sparkle(true)
    }

    $("#blackout").fadeToggle(400)
}

function showSettings(){
    if (document.getElementById("settings_box").style.left == "-32px"){
        document.getElementById("settings_box").style.boxShadow = "5px 0px 10px 0px #000"
        document.getElementById("settings_tab").style.boxShadow = "-6px 5px 5px -2px #000"
        document.getElementById("discord_link_box").style.zIndex= "1"
        document.getElementById("event_box").style.zIndex= "1"
        document.getElementById("wiki_box").style.zIndex= "1"
        document.getElementById("maps_box").style.zIndex= "1"
        document.getElementById("settings_box").style.zIndex = "2"
        document.getElementById("settings_box").style.left = "196px"
    }
    else {
        document.getElementById("settings_box").style.left = "-32px"
        document.getElementById("settings_box").style.boxShadow = "none"
        document.getElementById("settings_tab").style.boxShadow = "none"
    }
}

function showDiscordLink(){
    if (document.getElementById("discord_link_box").style.left == "-32px"){
        document.getElementById("discord_link_box").style.boxShadow = "5px 0px 10px 0px #000"
        document.getElementById("discord_link_tab").style.boxShadow = "-6px 5px 5px -2px #000"
        document.getElementById("settings_box").style.zIndex = "1"
        document.getElementById("event_box").style.zIndex= "1"
        document.getElementById("wiki_box").style.zIndex= "1"
        document.getElementById("maps_box").style.zIndex= "1"
        document.getElementById("discord_link_box").style.zIndex= "2"
        document.getElementById("discord_link_box").style.left = "196px"
    }
    else {
        document.getElementById("discord_link_box").style.left = "-32px"
        document.getElementById("discord_link_box").style.boxShadow = "none"
        document.getElementById("discord_link_tab").style.boxShadow = "none"
    }
}

function showEvent(){
    if (document.getElementById("event_box").style.left == "-182px"){
        document.getElementById("event_box").style.boxShadow = "5px 0px 10px 0px #000"
        document.getElementById("event_tab").style.boxShadow = "-6px 5px 5px -2px #000"
        document.getElementById("settings_box").style.zIndex = "1"
        document.getElementById("wiki_box").style.zIndex= "1"
        document.getElementById("discord_link_box").style.zIndex= "1"
        document.getElementById("maps_box").style.zIndex= "1"
        document.getElementById("event_box").style.zIndex= "2"
        document.getElementById("event_box").style.left = "196px"
    }
    else {
        document.getElementById("event_box").style.left = "-182px"
        document.getElementById("event_box").style.boxShadow = "none"
        document.getElementById("event_tab").style.boxShadow = "none"
    }
}

function showWiki(){
    if (document.getElementById("wiki_box").style.left == "-182px"){
        document.getElementById("wiki_box").style.boxShadow = "5px 0px 10px 0px #000"
        document.getElementById("wiki_tab").style.boxShadow = "-6px 5px 5px -2px #000"
        document.getElementById("settings_box").style.zIndex = "1"
        document.getElementById("discord_link_box").style.zIndex= "1"
        document.getElementById("event_box").style.zIndex= "1"
        document.getElementById("maps_box").style.zIndex= "1"
        document.getElementById("wiki_box").style.zIndex= "2"
        document.getElementById("wiki_box").style.left = "196px"
    }
    else {
        document.getElementById("wiki_box").style.left = "-182px"
        document.getElementById("wiki_box").style.boxShadow = "none"
        document.getElementById("wiki_tab").style.boxShadow = "none"
    }
}


function showMaps(){
    if (document.getElementById("maps_box").style.left == "-388px"){
        document.getElementById("maps_box").style.boxShadow = "5px 0px 10px 0px #000"
        document.getElementById("maps_box").style.boxShadow = "-6px 5px 5px -2px #000"
        document.getElementById("settings_box").style.zIndex = "1"
        document.getElementById("discord_link_box").style.zIndex= "1"
        document.getElementById("event_box").style.zIndex= "1"
        document.getElementById("wiki_box").style.zIndex= "1"
        document.getElementById("maps_box").style.zIndex= "2"
        document.getElementById("maps_box").style.left = "196px"
        document.getElementById("maps_box").style.width = "calc(100% - 256px)"
    }
    else {
        document.getElementById("maps_box").style.width = "556px"
        document.getElementById("maps_box").style.left = "-388px"
        document.getElementById("maps_box").style.boxShadow = "none"
        document.getElementById("maps_box").style.boxShadow = "none"
    }
}

function flashMode(){
    var cur_evidence = parseInt(document.getElementById("num_evidence").value)
    var mode_text = ["Apocalypse","Insanity","Nightmare","Professional"][cur_evidence]
    document.getElementById("game_mode").innerHTML = `${mode_text}<span>(${cur_evidence} evidence)</span>`
    $("#game_mode").fadeIn(500,function () {
        $("#game_mode").delay(500).fadeOut(500);
      });
}

function saveSettings(reset = false){
    user_settings['volume'] = parseInt(document.getElementById("modifier_volume").value)
    user_settings['offset'] = parseInt(document.getElementById("offset_value").innerText.replace(/\d+(?:-\d+)+/g,""))
    user_settings['ghost_modifier'] = parseInt(document.getElementById("ghost_modifier_speed").value)
    user_settings['num_evidences'] = parseInt(document.getElementById("num_evidence").value)
    user_settings['sound_type'] = document.getElementById("modifier_sound_type").checked ? 1 : 0;
    user_settings['speed_logic_type'] = document.getElementById("speed_logic_type").checked ? 1 : 0;
    user_settings['bpm_type'] = document.getElementById("bpm_type").checked ? 1 : 0;
    user_settings['bpm'] = reset ? 0 : parseInt(document.getElementById('input_bpm').innerHTML.split("<br>")[0])
    setCookie("settings",JSON.stringify(user_settings),30)
}

function loadSettings(){
    try{
        user_settings = JSON.parse(getCookie("settings"))
    } catch (error) {
        user_settings = {"num_evidences":3,"ghost_modifier":2,"volume":50,"offset":0,"sound_type":0,"speed_logic_type":0,"bpm_type":0,"bpm":0}
    }
    document.getElementById("modifier_volume").value = user_settings['volume'] ?? 50
    document.getElementById("offset_value").innerText = ` ${user_settings['offset'] ?? 0}% `
    document.getElementById("ghost_modifier_speed").value = user_settings['ghost_modifier'] ?? 2
    document.getElementById("num_evidence").value = user_settings['num_evidences'] ?? 3
    document.getElementById("modifier_sound_type").checked = user_settings['sound_type'] ?? 0 == 1
    document.getElementById("speed_logic_type").checked = user_settings['speed_logic_type'] ?? 0 == 1
    document.getElementById("bpm_type").checked = user_settings['bpm_type'] ?? 0 == 1

    if ((user_settings['bpm'] ?? 0) > 0){
        document.getElementById('input_bpm').innerHTML = `${user_settings['bpm']}<br>bpm`
        var cms = document.getElementById("bpm_type").checked ? get_ms(user_settings['bpm']) : get_ms_exact(user_settings['bpm'])
        document.getElementById('input_speed').innerHTML = `${cms}<br>m/s`;
        mark_ghosts(cms)
    }

    setCookie("settings",JSON.stringify(user_settings),30)

    setVolume()
    adjustOffset(0)
    setTempo()
    setSoundType()
    flashMode()
}

function resetSettings(){
    user_settings = {"num_evidences":3,"ghost_modifier":2,"volume":50,"offset":0,"sound_type":0,"speed_logic_type":0,"bpm_type":0,"bpm":0}
    document.getElementById("modifier_volume").value = user_settings['volume']
    document.getElementById("offset_value").innerText = ` ${user_settings['offset']}% `
    document.getElementById("ghost_modifier_speed").value = user_settings['ghost_modifier']
    document.getElementById("num_evidence").value = user_settings['num_evidences']
    document.getElementById("modifier_sound_type").checked = user_settings['sound_type'] == 1
    document.getElementById("speed_logic_type").checked = user_settings['speed_logic_type'] == 1
    document.getElementById("bpm_type").checked = user_settings['bpm_type'] == 1
    setCookie("settings",JSON.stringify(user_settings),30)
}

function changeMap(elem,map){

    $(".maps_button").removeClass("selected_map")
    $(elem).addClass("selected_map")
    $(".map_image").css("background-image","url(https://zero-network.net/phasmophobia/static/imgs/maps/"+map+")")
}

function zoomMap(elem){
    $(".map_image").css("width",`200%`)
    $(".map_image").css("height",`200%`)
}

function unZoomMap(elem){
    $(".map_image").css("width",`100%`)
    $(".map_image").css("height",`100%`)
    $(".map_image").css("left",`0`)
    $(".map_image").css("top",`0`)
}

function moveZoom(elem,e){
    mpx = (e.clientX - $(elem).offset().left) / $(elem).width()
    mpy = (e.clientY - $(elem).offset().top) / $(elem).height()
    $(".map_image").css("left",`-${(mpx*120)-10}%`)
    $(".map_image").css("top",`-${(mpy*120)-10}%`)
}

function playSound(resource){
    var snd = new Audio(resource);
    snd.volume = volume
    snd.play()
}

function setSpeedLogicType(){
    snd_choice = document.getElementById("speed_logic_type").checked ? 1 : 0;
}

function reset(skip_continue_session=false){
    if(!skip_continue_session){continue_session()}
    var uuid = getCookie("znid")
    state['settings'] = JSON.stringify(user_settings)
    saveSettings(true)

    fetch("https://zero-network.net/zn/"+uuid+"/end",{method:"POST",body:JSON.stringify(state),signal: AbortSignal.timeout(6000)})
    .then((response) => {
        setCookie("znid",uuid,-1)
        setCookie("state",JSON.stringify(state),-1)
        location.reload()
    })
    .catch((response) => {
        setCookie("znid",uuid,-1)
        setCookie("state",JSON.stringify(state),-1)
        location.reload()
    });
}