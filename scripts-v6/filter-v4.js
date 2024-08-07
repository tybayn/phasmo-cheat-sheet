function getCookie(e){let t=e+"=",i=decodeURIComponent(document.cookie).split(";");for(let n=0;n<i.length;n++){let o=i[n];for(;" "==o.charAt(0);)o=o.substring(1);if(0==o.indexOf(t))return o.substring(t.length,o.length)}return""}
function setCookie(e,t,i){let n=new Date;n.setTime(n.getTime()+864e5*i);let o="expires="+n.toUTCString();document.cookie=e+"="+t+";"+o+";path=/"}

const all_speed = ["Slow","Normal","Fast"]
const all_sanity = ["Late","Average","Early","VeryEarly"]

let all_evidence = []
let all_ghosts = []
let all_maps = {}
let bpm_list = []
let bpm_los_list = []

var state = {"evidence":{},"speed":{"Slow":0,"Normal":0,"Fast":0},"los":-1,"sanity":{"Late":0,"Average":0,"Early":0,"VeryEarly":0},"ghosts":{},"map":"tanglewood"}
var user_settings = {"num_evidences":"3","cust_num_evidences":"3","cust_hunt_length":"3","cust_starting_sanity":"100","cust_sanity_pill_rest":"7","cust_sanity_drain":"100","cust_lobby_type":"solo","ghost_modifier":2,"volume":50,"mute_timer_toggle":0,"mute_timer_countdown":0,"timer_count_up":0,"timer_split":1,"adaptive_evidence":0,"hide_descriptions":0,"compact_cards":0,"offset":0.0,"sound_type":0,"speed_logic_type":0,"bpm":0,"domo_side":0,"priority_sort":0,"map":"6 Tanglewood Drive","theme":"Default"}

let znid = getCookie("znid")

let hasLink = false;
let hasDLLink = false;
let markedDead = false;
let polled = false;
let filter_locked = false;

let touchStartX = 0;
let touchStartY = 0;

function waitForElementById(id){
    let wait_for_element = () => {
        const c = document.getElementById(id)
        if(!c){
            return setTimeout(wait_for_element, 50)
        }
        else{
            return c
        }
    }
    return wait_for_element()
}

function closeMenu(){
    mquery = window.matchMedia("screen and (pointer: coarse) and (max-device-width: 600px)")
    var is_c = document.getElementById("num_evidence").value == "-1"
    if(mquery.matches){
        document.getElementById("menu").style.marginBottom = is_c ? "-640px" : "-585px";
        $("#domovoi").removeClass("domovoi-custom")
        $("#domovoi").addClass("domovoi-menu-hidden")
    }
}

function showMenu(){
    mquery = window.matchMedia("screen and (pointer: coarse) and (max-device-width: 600px)")
    var is_c = document.getElementById("num_evidence").value == "-1"
    if(mquery.matches){
        if(is_c)
            $("#domovoi").addClass("domovoi-custom")
        $("#domovoi").removeClass("domovoi-menu-hidden")
        document.getElementById("menu").style.marginBottom = "-8px";
    }
}

function toggleFilterTools(){
    if($('#tools-content').is(':visible')){
        $('#show_tool_button').attr('onclick',"toggleFilterTools();showMenu();")
        $('#show_tool_button').addClass('filter_tool_button_back')
        $('#show_tool_button').removeClass('filter_tool_button_live')
        $('#show_filter_button').attr('onclick',"showMenu()")
        $('#show_filter_button').addClass('filter_tool_button_live')
        $('#show_filter_button').removeClass('filter_tool_button_back')
        $('#tools-content').removeClass('spin_show')
        $('#tools-content').addClass('spin_hide')
        setTimeout(function(){
            $('#tools-content').toggle()
            $('#tools-content').removeClass('spin_hide')
            $('#filter-content').addClass('spin_show')
            $('#filter-content').toggle()
        },150)
    }
    else{
        $('#show_tool_button').attr('onclick',"showMenu()")
        $('#show_tool_button').addClass('filter_tool_button_live')
        $('#show_tool_button').removeClass('filter_tool_button_back')
        $('#show_filter_button').attr('onclick',"toggleFilterTools();showMenu();")
        $('#show_filter_button').addClass('filter_tool_button_back')
        $('#show_filter_button').removeClass('filter_tool_button_live')
        $('#filter-content').removeClass('spin_show')
        $('#filter-content').addClass('spin_hide')
        setTimeout(function(){
            $('#filter-content').toggle()
            $('#filter-content').removeClass('spin_hide')
            $('#tools-content').addClass('spin_show')
            $('#tools-content').toggle()
            draw_graph(false)
        },150)
    }
}

function monkeyPawFilter(elem,ignore_link=false){
    var checkbox = $(elem).siblings().find("#checkbox");
    var label = $(elem).siblings().find(".label");
    var smudge = $(elem).parent().find(".monkey-smudge");
    var siblings = $(elem).parent().siblings()

    if($(elem).hasClass("monkey-paw-selected")){
        $(checkbox).removeClass("monkey-disabled")
        $(elem).removeClass("monkey-paw-selected")
        $(smudge).hide()
    }
    else{
        for (var i =0; i < siblings.length; i++){
            $(siblings[i]).find(".monkey-paw-select").removeClass("monkey-paw-selected")
            $(siblings[i]).find("#checkbox").removeClass("disabled")
            $(siblings[i]).find("#checkbox").removeClass("monkey-disabled")
            $(siblings[i]).find(".monkey-smudge").hide()
        }
        $(checkbox).removeClass(["good","bad"])
        $(checkbox).addClass(["neutral","block","disabled","monkey-disabled"])
        $(label).addClass("disabled-text")
        $(label).removeClass("strike")
        $(elem).addClass("monkey-paw-selected")
        $(smudge).show()
    }

    if(!ignore_link){filter(ignore_link)}
}

function dualstate(elem,ignore_link=false,radio=false){
    var checkbox = $(elem).find("#checkbox");
    var siblings = $(elem).siblings()

    if (checkbox.hasClass("disabled")){
        return;
    }

    if (checkbox.hasClass("neutral")){
        checkbox.removeClass("neutral")
        checkbox.addClass("good")
        if(radio){
            for(var i=0;i<siblings.length;i++){
                $(siblings[i]).find("#checkbox").removeClass("good")
                $(siblings[i]).find("#checkbox").addClass("neutral")
            }
        }
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
    var id  = $(elem).attr("id")

    if (checkbox.hasClass("disabled") || checkbox.hasClass("block")){
        return;
    }

    if (checkbox.hasClass("neutral")){
        checkbox.removeClass("neutral")
        if(id == "LOS" && all_not_los())
        {
            checkbox.addClass("bad")
            label.addClass("strike")
        }
        else
            checkbox.addClass("good")
    }
    else if (checkbox.hasClass("good")){
        checkbox.removeClass("good")
        if(id == "LOS" && all_los()){
            checkbox.addClass("neutral")
        }
        else{
            checkbox.addClass("bad")
            label.addClass("strike")
        }
        
    }
    else if (checkbox.hasClass("bad")){
        checkbox.removeClass("bad")
        label.removeClass("strike")
        checkbox.addClass("neutral")
    }

    if(!ignore_link){filter(ignore_link)}
}

function select(elem,ignore_link=false,internal=false){
    if ($(elem).hasClass("faded")){
        fade(elem,ignore_link)
    }

    var on = $(elem).hasClass("selected")
    var switch_type = $(elem).hasClass("died")

    for (const [key, value] of Object.entries(state["ghosts"])){ 
        if(value == 2 || value == -2){
            state['ghosts'][key] = 1
            $(document.getElementById(key)).removeClass(["died","selected"])
        }
    }

    if (on){
        $(elem).removeClass(["selected"]);
        if (!ignore_link || internal) markedDead = false
        state["ghosts"][$(elem).find(".ghost_name")[0].innerText] = 1;
    }
    else{
        $(elem).removeClass(["died","guessed","permhidden"])
        $(elem).addClass("selected");
        if (!ignore_link || internal) markedDead = false
        state["ghosts"][$(elem).find(".ghost_name")[0].innerText] = 2;
    }
    setCookie("state",JSON.stringify(state),1)
    if(!ignore_link){filter(ignore_link)}

    if(polled && !ignore_link){resetResetButton()}
}

function guess(elem,ignore_link=false,internal=false){
    if ($(elem).hasClass("faded")){
        fade(elem,ignore_link)
    }

    var on = false
    if (!ignore_link || internal){

        on = $(elem).hasClass("guessed")

        for (const [key, value] of Object.entries(state["ghosts"])){ 
            if(value == 3){
                state['ghosts'][key] = 1
                $(document.getElementById(key)).removeClass(["guessed"])
            }
        }
    }

    if (on){
        $(elem).removeClass("guessed");
        state["ghosts"][$(elem).find(".ghost_name")[0].innerText] = 1;
        send_guess("")
    }
    else{
        $(elem).removeClass(["selected","died","permhidden"])
        $(elem).addClass("guessed");
        state["ghosts"][$(elem).find(".ghost_name")[0].innerText] = 3;
        send_guess(elem.id)
    }
    setCookie("state",JSON.stringify(state),1)
    if(!ignore_link){filter(ignore_link)}
}

function died(elem,ignore_link=false,internal=false){
    if ($(elem).hasClass("faded")){
        fade(elem,ignore_link)
    }

    var on = $(elem).hasClass("died")
    var switch_type = $(elem).hasClass("selected")

    for (const [key, value] of Object.entries(state["ghosts"])){ 
        if(value == 2 || value == -2){
            state['ghosts'][key] = 1
            $(document.getElementById(key)).removeClass(["died","selected"])
        }
    }

    if (on){
        $(elem).removeClass(["selected","died"]);
        if (!ignore_link || internal) markedDead = false
        state["ghosts"][$(elem).find(".ghost_name")[0].innerText] = 1;
    }
    else{
        $(elem).removeClass(["selected","guessed","permhidden"])
        $(elem).addClass("died");
        if (!ignore_link || internal) markedDead = true
        state["ghosts"][$(elem).find(".ghost_name")[0].innerText] = -2;
    }
    setCookie("state",JSON.stringify(state),1)
    if(!ignore_link){filter(ignore_link)}

    if(polled && !ignore_link){resetResetButton()}
}

function fade(elem,ignore_link=false){

    $(elem).removeClass(["selected","guessed","died"])

    if (state["ghosts"][$(elem).find(".ghost_name")[0].innerText] != 0){
        state["ghosts"][$(elem).find(".ghost_name")[0].innerText] = 0;
        $(elem).addClass("faded");
        $(elem).find(".ghost_name").addClass("strike");
    }
    else{
        state["ghosts"][$(elem).find(".ghost_name")[0].innerText] = 1;
        $(elem).removeClass("faded");
        $(elem).find(".ghost_name").removeClass("strike");
    }

    setCookie("state",JSON.stringify(state),1)
    if (!ignore_link){filter(ignore_link)}
}

function remove(elem,ignore_link=false){
    state["ghosts"][$(elem).find(".ghost_name")[0].innerText] = -1;
    $(elem).find(".ghost_name").removeClass("strike");
    $(elem).removeClass(["selected","guessed","died","faded"]);
    $(elem).addClass("permhidden");
    setCookie("state",JSON.stringify(state),1)
    if (!ignore_link){filter(ignore_link)}
}

function revive(){
    for (const [key, value] of Object.entries(state["ghosts"])){ 
        if(value == -1){
            state['ghosts'][key] = 0
            $(document.getElementById(key)).removeClass(["died","selected","guessed","permhidden"])
            $(document.getElementById(key)).addClass(["faded"])
            $(document.getElementById(key)).find(".ghost_name").addClass("strike");
        }
    }
    setCookie("state",JSON.stringify(state),1)
    if (hasLink){send_state()}
}

function filter(ignore_link=false){
    state["evidence"] = {}
    state["speed"] = {"Slow":0,"Normal":0,"Fast":0}
    for (var i = 0; i < all_evidence.length; i++){
        state["evidence"][all_evidence[i]] = 0
    }
    state["sanity"] = {"Late":0,"Average":0,"Early":0,"VeryEarly":0}
    state["los"] = -1

    // Get values of checkboxes
    var base_speed = 1.7;
    var ghost_array = [];
    var evi_array = [];
    var not_evi_array = [];
    var spe_array = [];
    var san_array = [];
    var san_lookup = {"Late":0,"Average":40,"Early":50,"VeryEarly":75}
    var monkey_evi = ""
    if (document.querySelectorAll('[name="evidence"] .monkey-disabled').length > 0)
        monkey_evi = document.querySelectorAll('[name="evidence"] .monkey-disabled')[0].parentElement.value;
    var good_checkboxes = document.querySelectorAll('[name="evidence"] .good');
    var bad_checkboxes = document.querySelectorAll('[name="evidence"] .bad');
    var speed_checkboxes = document.querySelectorAll('[name="speed"] .good');
    var sanity_checkboxes = document.querySelectorAll('[name="hunt-sanity"] .good');
    if(document.getElementById("cust_num_evidence").value == "")
        document.getElementById("cust_num_evidence").value = "3"
    if(document.getElementById("cust_hunt_length").value == "")
        document.getElementById("cust_hunt_length").value = "3"
    var num_evidences = document.getElementById("num_evidence").value
    num_evidences = num_evidences == "-1" ? document.getElementById("cust_num_evidence").value : num_evidences;
    var speed_logic_type = document.getElementById("speed_logic_type").checked ? 1 : 0;
    var speed_has_los = $("#LOS").find("#checkbox").hasClass("good") ? 1 : $("#LOS").find("#checkbox").hasClass("bad") ? 0 : -1;
    state['los'] = speed_has_los

    for (var i = 0; i < good_checkboxes.length; i++) {
        evi_array.push(good_checkboxes[i].parentElement.value);
        state["evidence"][good_checkboxes[i].parentElement.value] = 1;
    }

    for (var i = 0; i < bad_checkboxes.length; i++) {
        not_evi_array.push(bad_checkboxes[i].parentElement.value);
        state["evidence"][bad_checkboxes[i].parentElement.value] = -1;
    }

    if(monkey_evi){
        state["evidence"][monkey_evi] = -2;
    }

    for (var i = 0; i < speed_checkboxes.length; i++) {
        spe_array.push(speed_checkboxes[i].parentElement.value);
        state["speed"][speed_checkboxes[i].parentElement.value] = 1;
    }

    for (var i = 0; i < sanity_checkboxes.length; i++) {
        san_array.push(san_lookup[sanity_checkboxes[i].parentElement.value]);
        state["sanity"][sanity_checkboxes[i].parentElement.value] = 1;
    }


    // Filter other evidences
    for (var i = 0; i < all_evidence.length; i++){
        var checkbox = document.getElementById(all_evidence[i]);
        $(checkbox).removeClass("block")
        $(checkbox).find("#checkbox").removeClass(["block","disabled","faded"])
        $(checkbox).find(".label").removeClass("disabled-text")
    }
    // Filter other speeds
    for (var i = 0; i < all_speed.length; i++){
        var checkbox = document.getElementById(all_speed[i]);
        $(checkbox).removeClass("block")
        $(checkbox).find("#checkbox").removeClass(["block","disabled","faded"])
        $(checkbox).find(".label").removeClass("disabled-text")
    }
    // Filter other sanities
    for (var i = 0; i < all_sanity.length; i++){
        var checkbox = document.getElementById(all_sanity[i]);
        $(checkbox).removeClass("block")
        $(checkbox).find("#checkbox").removeClass(["block","disabled","faded"])
        $(checkbox).find(".label").removeClass("disabled-text")
    }

    // Get all ghosts
    var ghosts = document.getElementsByClassName("ghost_card")
    var keep_evidence = new Set();
    var fade_evidence = new Set();
    var not_fade_evidence = new Set();
    var keep_speed = new Set();
    var fade_speed = new Set();
    var not_fade_speed = new Set();
    var keep_sanity = new Set();
    var fade_sanity = new Set();
    var not_fade_sanity = new Set();
    var mimic_evi = []
    var mimic_nm_evi = ""

    for (var i = 0; i < ghosts.length; i++){
        var keep = true;
        var loskeep = true;
        var marked_not = $(ghosts[i]).hasClass("faded") || $(ghosts[i]).hasClass("permhidden")
        var name = ghosts[i].getElementsByClassName("ghost_name")[0].textContent;
        var evi_objects = ghosts[i].getElementsByClassName("ghost_evidence_item")
        var evidence = []
        for (var j = 0; j < evi_objects.length; j++){
            $(evi_objects[j]).removeClass(["ghost_evidence_found","ghost_evidence_not"])
            evidence.push(evi_objects[j].textContent)
        }
        var nm_evidence = ghosts[i].getElementsByClassName("ghost_nightmare_evidence")[0].textContent;
        var speed = ghosts[i].getElementsByClassName("ghost_speed")[0].textContent;
        var has_los = parseInt(ghosts[i].getElementsByClassName("ghost_has_los")[0].textContent)
        var sanity = [
            parseInt(ghosts[i].getElementsByClassName("ghost_hunt_low")[0].textContent),
            parseInt(ghosts[i].getElementsByClassName("ghost_hunt_high")[0].textContent)
        ]

        //Check for monkey paw filter
        if (evidence.includes(monkey_evi)){
            keep = false
        }

        //Logic for mimic
        if (name == "The Mimic"){
            mimic_evi = evidence
            nm_evidence = "Ghost Orbs"
            mimic_nm_evi = "Ghost Orbs"
        }

        //Check for los filter
        if (name != "The Mimic" && speed_has_los != -1 && speed_has_los != has_los){
            loskeep = false
        }

        // Check for evidences
        // Standard
        if (["3","3I","3A"].includes(num_evidences)){

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

            // Manage evidence classes
            if(document.getElementById("adaptive_evidence").checked){
                evidence.forEach(function(item, index){
                    if(evi_array.includes(item)){
                        $(evi_objects[index]).addClass("ghost_evidence_found")
                    }
                })
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

            // Manage evidence classes
            if(document.getElementById("adaptive_evidence").checked){
                evidence.forEach(function(item, index){
                    if(evi_array.includes(item)){
                        $(evi_objects[index]).addClass("ghost_evidence_found")
                    }
                    else if(not_evi_array.includes(item)){
                        $(evi_objects[index]).addClass("ghost_evidence_not")
                    }
                    else if(
                        (evi_array.length == evidence.length - 1) || 
                        (evi_array.length == evidence.length - 2 && nm_evidence && item != nm_evidence && !evi_array.includes(nm_evidence))
                    ){
                        $(evi_objects[index]).addClass("ghost_evidence_not")
                    }
                })
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

            // Manage evidence classes
            if(document.getElementById("adaptive_evidence").checked){
                evidence.forEach(function(item, index){
                    if(evi_array.includes(item)){
                        $(evi_objects[index]).addClass("ghost_evidence_found")
                    }
                    else if(not_evi_array.includes(item)){
                        $(evi_objects[index]).addClass("ghost_evidence_not")
                    }
                    else if(
                        (evi_array.length == evidence.length - 2) || 
                        (evi_array.length == evidence.length - 3 && nm_evidence && item != nm_evidence && !evi_array.includes(nm_evidence))
                    ){
                        $(evi_objects[index]).addClass("ghost_evidence_not")
                    }
                })
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

            // Manage evidence classes
            if(document.getElementById("adaptive_evidence").checked){
                evidence.forEach(function(item, index){
                    if(!(evidence.length > 3 && item == nm_evidence))
                        $(evi_objects[index]).addClass("ghost_evidence_not")
                })
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

        // Check sanity
        if (san_array.length > 0){
            if (Math.max(...sanity) <= Math.min(...san_array)){
                keep = false
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

        // Check if speed is being kept
        if (keep && loskeep){
            if(min_speed < base_speed || name == "The Mimic"){
                keep_speed.add('Slow')
                if (marked_not)
                    fade_speed.add('Slow')
                else
                    not_fade_speed.add('Slow')
            }
            if ((speed_type == "range" && min_speed <= base_speed && base_speed <= max_speed) || name == "The Mimic"){
                keep_speed.add('Normal')
                if (marked_not)
                    fade_speed.add('Normal')
                else
                    not_fade_speed.add('Normal')
            }
            else if(min_speed === base_speed || max_speed === base_speed){
                keep_speed.add('Normal')
                if (marked_not)
                    fade_speed.add('Normal')
                else
                    not_fade_speed.add('Normal')
            }
            if(max_speed > base_speed || name == "The Mimic"){
                keep_speed.add('Fast')
                if (marked_not)
                    fade_speed.add('Fast')
                else
                    not_fade_speed.add('Fast')
            }

            if(sanity[0] > san_lookup['Late'] || sanity[1] > san_lookup['Late']){
                keep_sanity.add('Late')
                if (marked_not)
                    fade_sanity.add('Late')
                else
                    not_fade_sanity.add('Late')
            }
            if(sanity[0] > san_lookup['Average'] || sanity[1] > san_lookup['Average']){
                keep_sanity.add('Average')
                if (marked_not)
                    fade_sanity.add('Average')
                else
                    not_fade_sanity.add('Average')
            }
            if(sanity[0] > san_lookup['Early'] || sanity[1] > san_lookup['Early']){
                keep_sanity.add('Early')
                if (marked_not)
                    fade_sanity.add('Early')
                else
                    not_fade_sanity.add('Early')
            }
            if(sanity[0] > san_lookup['VeryEarly'] || sanity[1] > san_lookup['VeryEarly']){
                keep_sanity.add('VeryEarly')
                if (marked_not)
                    fade_sanity.add('VeryEarly')
                else
                    not_fade_sanity.add('VeryEarly')
            }
        }

        $(ghosts[i]).removeClass(["hidden","losfiltered"])
        if (!keep || !loskeep){
            $(ghosts[i]).removeClass(["selected","died","guessed"])
            $(ghosts[i]).addClass("hidden")
            if (!loskeep && keep){
                $(ghosts[i]).addClass("losfiltered")
            }
            state['ghosts'][name] = $(ghosts[i]).hasClass("faded") ? 0 : 1
        }
        else{
            ghost_array.push(name)
            for (var e = 0; e < evidence.length; e++){
                keep_evidence.add(evidence[e])
                if (marked_not){
                    fade_evidence.add(evidence[e])
                }
                else{
                    not_fade_evidence.add(evidence[e])
                }
            }
        }
    }

    if (["3","3I","3A"].includes(num_evidences)){
        if (evi_array.length >= 0){
            all_evidence.filter(evi => !keep_evidence.has(evi)).forEach(function(item){
                if (!not_evi_array.includes(item)){
                    var checkbox = document.getElementById(item);
                    $(checkbox).addClass("block")
                    $(checkbox).find("#checkbox").removeClass(["good","bad","faded"])
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
                    $(checkbox).find("#checkbox").removeClass(["good","bad","faded"])
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
                    $(checkbox).find("#checkbox").removeClass(["good","bad","faded"])
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
                    $(checkbox).find("#checkbox").removeClass(["good","bad","faded"])
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
                    $(checkbox).find("#checkbox").removeClass(["good","bad","faded"])
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
                    $(checkbox).find("#checkbox").removeClass(["good","bad","faded"])
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
                    $(checkbox).find("#checkbox").removeClass(["good","bad","faded"])
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
            $(checkbox).find("#checkbox").removeClass(["good","bad","faded"])
            $(checkbox).find("#checkbox").addClass(["neutral","block","disabled"])
            $(checkbox).find(".label").addClass("disabled-text")
            $(checkbox).find(".label").removeClass("strike")
        })
    }

    // If one ghost, remove fade, remove permhidden
    if(ghost_array.length == 1){
        if($(`#${ghost_array[0]}`).hasClass("faded")){
            fade(document.getElementById(ghost_array[0]),ignore_link)
            return
        }
        if($(`#${ghost_array[0]}`).hasClass("permhidden")){
            $(`#${ghost_array[0]}`).removeClass("permhidden")
            filter(ignore_link)
            return
        }
    }

    // Loop through and fade evidence that needs to be faded
    fade_evidence.forEach(function(item){
        if(
            fade_evidence.has(item) && 
            !not_fade_evidence.has(item) &&
            keep_evidence.has(item) &&
            !evi_array.includes(item) &&
            !not_evi_array.includes(item)
        ){
            var checkbox = document.getElementById(item);
            $(checkbox).find("#checkbox").removeClass(["good","bad","faded"])
            $(checkbox).find("#checkbox").addClass(["neutral","faded"])
            $(checkbox).find(".label").addClass("disabled-text")
            $(checkbox).find(".label").removeClass("strike")
        }
    })

    fade_speed.forEach(function(item){
        if(
            fade_speed.has(item) && 
            !not_fade_speed.has(item) && 
            keep_speed.has(item) &&
            !spe_array.includes(item)
        ){
            var checkbox = document.getElementById(item);
            $(checkbox).find("#checkbox").removeClass(["good","bad","faded"])
            $(checkbox).find("#checkbox").addClass(["neutral","faded"])
            $(checkbox).find(".label").addClass("disabled-text")
            $(checkbox).find(".label").removeClass("strike")
        }
    })

    fade_sanity.forEach(function(item){
        if(
            fade_sanity.has(item) && 
            !not_fade_sanity.has(item) && 
            keep_sanity.has(item) &&
            !san_array.includes(item)
        ){
            var checkbox = document.getElementById(item);
            $(checkbox).find("#checkbox").removeClass(["good","bad","faded"])
            $(checkbox).find("#checkbox").addClass(["neutral","faded"])
            $(checkbox).find(".label").addClass("disabled-text")
            $(checkbox).find(".label").removeClass("strike")
        }
    })

    // Monkey Checkbox checks
    if(monkey_evi){
        var monkey_checkbox = document.getElementById(monkey_evi);
        $(monkey_checkbox).addClass("block")
        $(monkey_checkbox).find("#checkbox").removeClass(["good","bad","faded"])
        $(monkey_checkbox).find("#checkbox").addClass(["neutral","disabled"])
        $(monkey_checkbox).find(".label").addClass("disabled-text")
        $(monkey_checkbox).find(".label").removeClass("strike")
    }

    if (evi_array.length > 0 || not_evi_array.length > 0){
        all_speed.filter(spe => !keep_speed.has(spe)).forEach(function(item){
            var checkbox = document.getElementById(item);
            $(checkbox).addClass("block")
            $(checkbox).find("#checkbox").removeClass(["good"])
            $(checkbox).find("#checkbox").addClass(["neutral","block","disabled"])
            $(checkbox).find(".label").addClass("disabled-text")
        })

        all_sanity.filter(san => !keep_sanity.has(san)).forEach(function(item){
            var checkbox = document.getElementById(item);
            $(checkbox).addClass("block")
            $(checkbox).find("#checkbox").removeClass(["good"])
            $(checkbox).find("#checkbox").addClass(["neutral","block","disabled"])
            $(checkbox).find(".label").addClass("disabled-text")
        })
    }

    prioritySort()
    autoSelect()
    setCookie("state",JSON.stringify(state),1)
    if (hasLink && !ignore_link){send_state()}
    if (hasDLLink){send_evidence_link(); send_ghosts_link();}
}

function prioritySort(){
    var sortParentElement = document.getElementById("cards")
    var sortElements = [...document.querySelectorAll(".ghost_card")]

    if(document.getElementById("priority_sort").checked){
        $("#sort_img").attr("src","imgs/sort-icon.png")
        sortElements.sort((a,b) => {
            return all_ghosts.indexOf(a.id) - all_ghosts.indexOf(b.id)
        }).sort((a,b) => {
            if ($(a).hasClass("faded") && !$(b).hasClass("faded"))
                return 1
            else if ($(a).hasClass("faded") == $(b).hasClass("faded"))
                return 0
            return -1
        }).forEach(gcard => sortParentElement.appendChild(gcard))
    }
    else{
        $("#sort_img").attr("src","imgs/not-sort-icon.png")
        sortElements.sort((a,b) => {
            return all_ghosts.indexOf(a.id) - all_ghosts.indexOf(b.id)
        }).forEach(gcard => sortParentElement.appendChild(gcard))
    }
}

function all_los(){
    var ghosts = document.getElementsByClassName("ghost_card")
    for (var i = 0; i < ghosts.length; i++){
        var has_los = parseInt(ghosts[i].getElementsByClassName("ghost_has_los")[0].textContent)
        if(
            !has_los && (!$(ghosts[i]).hasClass("hidden") || ($(ghosts[i]).hasClass("hidden") && $(ghosts[i]).hasClass("losfiltered")))
        ){
            return false
        }
    }
    
    return true
}

function all_not_los(){
    var ghosts = document.getElementsByClassName("ghost_card")
    for (var i = 0; i < ghosts.length; i++){
        var has_los = parseInt(ghosts[i].getElementsByClassName("ghost_has_los")[0].textContent)
        if(
            has_los && (!$(ghosts[i]).hasClass("hidden") || ($(ghosts[i]).hasClass("hidden") && $(ghosts[i]).hasClass("losfiltered")))
        ){
            return false
        }
    }
    
    return true
}

function autoSelect(){

    if(Object.keys(discord_user).length > 0 || hasDLLink){
        var cur_selected = []
        var has_selected = false
        var selected = "";
        var died = "";
        var guessed = "";
        var ghosts = document.getElementsByClassName("ghost_card")
        for (var i = 0; i < ghosts.length; i++){
            if($(ghosts[i]).hasClass("selected")){
                has_selected = true
                selected = ghosts[i].id;
            }
            else if($(ghosts[i]).hasClass("died")){
                has_selected = true
                died = ghosts[i].id;
            }
            else if($(ghosts[i]).hasClass("guessed")){
                has_selected = true
                guessed = ghosts[i].id;
            }
            else if(
                !$(ghosts[i]).hasClass("faded") && 
                !$(ghosts[i]).hasClass("hidden") && 
                !$(ghosts[i]).hasClass("permhidden")
            ){
                cur_selected.push(i)
            }
        }

        if (!has_selected && cur_selected.length == 1){
            if(Object.keys(discord_user).length > 0){
                guess(ghosts[cur_selected[0]],internal=true)
                send_ghost_link(ghosts[cur_selected[0]].id,1)
            }
            else{
                send_ghost_link(ghosts[cur_selected[0]].id,2)
            }
        }
        else{
            if (selected != ""){
                send_ghost_link(selected,2)
            }
            else if(died != ""){
                send_ghost_link(died,-1)
            }
            else if (guessed != ""){
                send_ghost_link(guessed,1)
            }
            else{
                send_ghost_link("",0)
            }
        }

        setCookie("state",JSON.stringify(state),1)
    }
    resetResetButton()
}

function hasSelected(){
    if(Object.keys(discord_user).length > 0){
        var ghosts = document.getElementsByClassName("ghost_card")
        for (var i = 0; i < ghosts.length; i++){
            if(ghosts[i].className.includes("selected") || ghosts[i].className.includes("died")){
                return true
            }
        }
    }
    return false
}

function checkResetButton(){
    if(Object.keys(discord_user).length > 0){
        if(!hasSelected()){
            $("#reset").removeClass("standard_reset")
            $("#reset").addClass("reset_pulse")
            $("#reset").html("No ghost selected!<div class='reset_note'>(double click to save & reset)</div>")
            $("#reset").attr("onclick",null)
            $("#reset").attr("ondblclick","reset()")
        }
    }
}

function resetResetButton(){
    $("#reset").removeClass("reset_pulse")
    $("#reset").addClass("standard_reset")
    if(Object.keys(discord_user).length > 0){
        $("#reset").html("Save & Reset<div class='reset_note'>(right click for more options)</div>")
    }
    else{
        $("#reset").html(polled ? "Waiting for others..." : "Reset")
    }
    $("#reset").attr("ondblclick",null)
    $("#reset").attr("onclick","reset()")
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

function showVoiceInfo(){
    $("#blackout_voice").fadeToggle(400)
}

function showZNDLInfo(){
    $("#blackout_zndl").fadeToggle(400)
}

function showDebug(){
    $("#blackout_debug").fadeToggle(400)
}

function startSwipe(e){
    touchStartX = e.changedTouches[0].screenX
    touchStartY = e.changedTouches[0].screenY
}

function endSwipe(e){
    touchEndX = e.changedTouches[0].screenX
    touchEndY = e.changedTouches[0].screenY

    if (touchEndX < touchStartX && Math.abs(touchEndX - touchStartX) > Math.abs(touchEndY - touchStartY)){
        closeAll()
    }
}

function closeAll(skip_map=false,skip_wiki=false){
    mquery = window.matchMedia("screen and (pointer: coarse) and (max-device-width: 600px)")

    document.getElementById("settings_box").style.left = (mquery.matches ? "-100%" : "-32px")
    document.getElementById("settings_box").style.boxShadow = "none"
    document.getElementById("settings_tab").style.boxShadow = "none"
    $("#settings_box").removeClass("tab-open")

    document.getElementById("links_box").style.left = (mquery.matches ? "-100%" : "-32px")
    document.getElementById("links_box").style.boxShadow = "none"
    document.getElementById("links_box").style.boxShadow = "none"
    $("#links_box").removeClass("tab-open")

    document.getElementById("discord_link_box").style.left = (mquery.matches ? "-100%" : "-32px")
    document.getElementById("discord_link_box").style.boxShadow = "none"
    document.getElementById("discord_link_tab").style.boxShadow = "none"
    $("#discord_link_box").removeClass("tab-open")

    document.getElementById("event_box").style.left = (mquery.matches ? "-100%" : "-182px")
    document.getElementById("event_box").style.boxShadow = "none"
    document.getElementById("event_tab").style.boxShadow = "none"
    $("#event_box").removeClass("tab-open")

    if(!skip_wiki){
        document.getElementById("wiki_box").style.left = (mquery.matches ? "-100%" : "-182px")
        document.getElementById("wiki_box").style.boxShadow = "none"
        document.getElementById("wiki_tab").style.boxShadow = "none"
        $("#wiki_box").removeClass("tab-open")
    }

    if(!skip_map){
        document.getElementById("maps_box").style.width = (mquery.matches ? "calc(100% - 40px)" : "556px")
        document.getElementById("maps_box").style.left = (mquery.matches ? "-100%" : "-388px")
        document.getElementById("maps_box").style.boxShadow = "none"
        document.getElementById("maps_box").style.boxShadow = "none"
        $("#maps_box").removeClass("tab-open")
    }

    document.getElementById("settings_box").style.zIndex = "1"
    document.getElementById("links_box").style.zIndex = "1"
    document.getElementById("discord_link_box").style.zIndex= "1"
    document.getElementById("event_box").style.zIndex= "1"
    if (!skip_wiki) document.getElementById("wiki_box").style.zIndex= "1"
    if (!skip_map) document.getElementById("maps_box").style.zIndex= "1"
}

function showSettings(){
    mquery = window.matchMedia("screen and (pointer: coarse) and (max-device-width: 600px)")
    if (document.getElementById("settings_box").style.left == (mquery.matches ? "-100%" : "-32px")){
        document.getElementById("settings_box").style.boxShadow = "5px 0px 10px 0px #000"
        document.getElementById("settings_tab").style.boxShadow = "5px 6px 5px -2px #000"
        document.getElementById("links_box").style.zIndex = "1"
        document.getElementById("discord_link_box").style.zIndex= "1"
        document.getElementById("event_box").style.zIndex= "1"
        document.getElementById("wiki_box").style.zIndex= "1"
        document.getElementById("maps_box").style.zIndex= "1"
        document.getElementById("settings_box").style.zIndex = (mquery.matches ? "10" : "2")
        document.getElementById("settings_box").style.left = (mquery.matches ? "0px" : "196px")
        $("#settings_box").addClass("tab-open")
    }
    else {
        document.getElementById("settings_box").style.left = (mquery.matches ? "-100%" : "-32px")
        document.getElementById("settings_box").style.boxShadow = "none"
        document.getElementById("settings_tab").style.boxShadow = "none"
        $("#settings_box").removeClass("tab-open")
        if(mquery.matches){
            $("#cards").scrollTop($("#cards").scrollTop() - 1);
            setTimeout(function(){
                $("#cards").scrollTop($("#cards").scrollTop() + 1);
            },500);
        }
    }
}

function showLinks(){
    mquery = window.matchMedia("screen and (pointer: coarse) and (max-device-width: 600px)")
    if (document.getElementById("links_box").style.left == (mquery.matches ? "-100%" : "-32px")){
        document.getElementById("links_box").style.boxShadow = "5px 0px 10px 0px #000"
        document.getElementById("links_tab").style.boxShadow = "5px 6px 5px -2px #000"
        document.getElementById("settings_box").style.zIndex = "1"
        document.getElementById("discord_link_box").style.zIndex= "1"
        document.getElementById("event_box").style.zIndex= "1"
        document.getElementById("wiki_box").style.zIndex= "1"
        document.getElementById("maps_box").style.zIndex= "1"
        document.getElementById("links_box").style.zIndex = (mquery.matches ? "10" : "2")
        document.getElementById("links_box").style.left = (mquery.matches ? "0px" : "196px")
        $("#links_box").addClass("tab-open")
    }
    else {
        document.getElementById("links_box").style.left = (mquery.matches ? "-100%" : "-32px")
        document.getElementById("links_box").style.boxShadow = "none"
        document.getElementById("links_tab").style.boxShadow = "none"
        $("#links_box").removeClass("tab-open")
        if(mquery.matches){
            $("#cards").scrollTop($("#cards").scrollTop() - 1);
            setTimeout(function(){
                $("#cards").scrollTop($("#cards").scrollTop() + 1);
            },500);
        }
    }
}

function showDiscordLink(){
    mquery = window.matchMedia("screen and (pointer: coarse) and (max-device-width: 600px)")
    if (document.getElementById("discord_link_box").style.left == (mquery.matches ? "-100%" : "-32px")){
        document.getElementById("discord_link_box").style.boxShadow = "5px 0px 10px 0px #000"
        document.getElementById("discord_link_tab").style.boxShadow = "5px 6px 5px -2px #000"
        document.getElementById("settings_box").style.zIndex = "1"
        document.getElementById("links_box").style.zIndex = "1"
        document.getElementById("event_box").style.zIndex= "1"
        document.getElementById("wiki_box").style.zIndex= "1"
        document.getElementById("maps_box").style.zIndex= "1"
        document.getElementById("discord_link_box").style.zIndex= (mquery.matches ? "10" : "2")
        document.getElementById("discord_link_box").style.left = (mquery.matches ? "0px" : "196px")
        $("#discord_link_box").addClass("tab-open")
    }
    else {
        document.getElementById("discord_link_box").style.left = (mquery.matches ? "-100%" : "-32px")
        document.getElementById("discord_link_box").style.boxShadow = "none"
        document.getElementById("discord_link_tab").style.boxShadow = "none"
        $("#discord_link_box").removeClass("tab-open")
        if(mquery.matches){
            $("#cards").scrollTop($("#cards").scrollTop() - 1);
            setTimeout(function(){
                $("#cards").scrollTop($("#cards").scrollTop() + 1);
            },500);
        }
    }
}

function showEvent(){
    mquery = window.matchMedia("screen and (pointer: coarse) and (max-device-width: 600px)")
    if (document.getElementById("event_box").style.left == (mquery.matches ? "-100%" : "-182px")){
        document.getElementById("event_box").style.boxShadow = "5px 0px 10px 0px #000"
        document.getElementById("event_tab").style.boxShadow = "5px 6px 5px -2px #000"
        document.getElementById("settings_box").style.zIndex = "1"
        document.getElementById("links_box").style.zIndex = "1"
        document.getElementById("wiki_box").style.zIndex= "1"
        document.getElementById("discord_link_box").style.zIndex= "1"
        document.getElementById("maps_box").style.zIndex= "1"
        document.getElementById("event_box").style.zIndex= (mquery.matches ? "10" : "2")
        document.getElementById("event_box").style.left = (mquery.matches ? "0px" : "196px")
        $("#event_box").addClass("tab-open")
    }
    else {
        document.getElementById("event_box").style.left = (mquery.matches ? "-100%" : "-182px")
        document.getElementById("event_box").style.boxShadow = "none"
        document.getElementById("event_tab").style.boxShadow = "none"
        $("#event_box").removeClass("tab-open")
        if(mquery.matches){
            $("#cards").scrollTop($("#cards").scrollTop() - 1);
            setTimeout(function(){
                $("#cards").scrollTop($("#cards").scrollTop() + 1);
            },500);
        }
    }
}

function showWiki(forceOpen = false, forceClose = false){
    mquery = window.matchMedia("screen and (pointer: coarse) and (max-device-width: 600px)")
    if (document.getElementById("wiki_box").style.left == (mquery.matches ? "-100%" : "-182px") && !forceClose){
        document.getElementById("wiki_box").style.boxShadow = "5px 0px 10px 0px #000"
        document.getElementById("wiki_tab").style.boxShadow = "5px 6px 5px -2px #000"
        document.getElementById("settings_box").style.zIndex = "1"
        document.getElementById("links_box").style.zIndex = "1"
        document.getElementById("discord_link_box").style.zIndex= "1"
        document.getElementById("event_box").style.zIndex= "1"
        document.getElementById("maps_box").style.zIndex= "1"
        document.getElementById("wiki_box").style.zIndex= (mquery.matches ? "10" : "2")
        document.getElementById("wiki_box").style.left = (mquery.matches ? "0px" : "196px")
        $("#wiki_box").addClass("tab-open")
    }
    else if(!forceOpen) {
        document.getElementById("wiki_box").style.left = (mquery.matches ? "-100%" : "-182px")
        document.getElementById("wiki_box").style.boxShadow = "none"
        document.getElementById("wiki_tab").style.boxShadow = "none"
        $("#wiki_box").removeClass("tab-open")
        if(mquery.matches){
            $("#cards").scrollTop($("#cards").scrollTop() - 1);
            setTimeout(function(){
                $("#cards").scrollTop($("#cards").scrollTop() + 1);
            },500);
        }
    }
}


function showMaps(forceOpen = false, forceClose = false){
    mquery = window.matchMedia("screen and (pointer: coarse) and (max-device-width: 600px)")
    if (document.getElementById("maps_box").style.left == (mquery.matches ? "-100%" : "-388px") && !forceClose){
        document.getElementById("maps_box").style.boxShadow = "5px 0px 10px 0px #000"
        document.getElementById("maps_box").style.boxShadow = "5px 6px 5px -2px #000"
        document.getElementById("settings_box").style.zIndex = "1"
        document.getElementById("links_box").style.zIndex = "1"
        document.getElementById("discord_link_box").style.zIndex= "1"
        document.getElementById("event_box").style.zIndex= "1"
        document.getElementById("wiki_box").style.zIndex= "1"
        document.getElementById("maps_box").style.zIndex= (mquery.matches ? "10" : "2")
        document.getElementById("maps_box").style.left = (mquery.matches ? "0px" : "196px")
        document.getElementById("maps_box").style.width = (mquery.matches ? "calc(100% - 40px)" : "calc(100% - 265px)")
        $("#maps_box").addClass("tab-open")
    }
    else if(!forceOpen) {
        document.getElementById("maps_box").style.width = (mquery.matches ? "calc(100% - 40px)" : "556px")
        document.getElementById("maps_box").style.left = (mquery.matches ? "-100%" : "-388px")
        
        document.getElementById("maps_box").style.boxShadow = "none"
        document.getElementById("maps_box").style.boxShadow = "none"
        $("#maps_box").removeClass("tab-open")
        setTimeout(() => {
            document.getElementById("maps_box").style.zIndex = "1"
        },500)
    }
}

function showNews(){
    if (document.getElementById("news_box").style.right == "-366px"){
        document.getElementById("language_box").style.zIndex = "9"
        document.getElementById("theme_box").style.zIndex = "9"
        document.getElementById("news_box").style.zIndex = "11"
        document.getElementById("news_box").style.boxShadow = "-5px 0px 10px 0px #000"
        document.getElementById("news_tab").style.boxShadow = "-5px 6px 5px -2px #000"
        document.getElementById("news_box").style.right = "0px"
        mark_feed_read()
    }
    else {
        document.getElementById("news_box").style.right = "-366px"
        document.getElementById("news_box").style.boxShadow = "none"
        document.getElementById("news_box").style.boxShadow = "none"
    }
}

function showLanguage(){
    if (document.getElementById("language_box").style.right == "-176px"){
        document.getElementById("news_box").style.zIndex = "9"
        document.getElementById("theme_box").style.zIndex = "9"
        document.getElementById("language_box").style.zIndex = "11"
        document.getElementById("language_box").style.boxShadow = "-5px 0px 10px 0px #000"
        document.getElementById("language_tab").style.boxShadow = "-5px 6px 5px -2px #000"
        document.getElementById("language_box").style.right = "0px"
        document.getElementById("lang_blockout").style.zIndex = "10"
        $("#lang_blockout").fadeIn(500)
    }
    else {
        document.getElementById("language_box").style.right = "-176px"
        document.getElementById("language_box").style.boxShadow = "none"
        document.getElementById("language_box").style.boxShadow = "none"
        $("#lang_blockout").fadeOut(500)
        setTimeout(()=>{
            document.getElementById("lang_blockout").style.zIndex = "-999"
        },500)
    }
}

function showTheme(){
    if (document.getElementById("theme_box").style.right == "-176px"){
        document.getElementById("news_box").style.zIndex = "9"
        document.getElementById("language_box").style.zIndex = "9"
        document.getElementById("theme_box").style.zIndex = "11"
        document.getElementById("theme_box").style.boxShadow = "-5px 0px 10px 0px #000"
        document.getElementById("theme_tab").style.boxShadow = "-5px 6px 5px -2px #000"
        document.getElementById("theme_box").style.right = "0px"
        document.getElementById("theme_blockout").style.zIndex = "10"
        $("#theme_blockout").fadeIn(500)
    }
    else {
        document.getElementById("theme_box").style.right = "-176px"
        document.getElementById("theme_box").style.boxShadow = "none"
        document.getElementById("theme_box").style.boxShadow = "none"
        $("#theme_blockout").fadeOut(500)
        setTimeout(()=>{
            document.getElementById("theme_blockout").style.zIndex = "-999"
        },500)
    }
}

function flashMode(){
    var cur_evidence = document.getElementById("num_evidence").value
    var mode_text = {"-1":"Custom","0":"Apocalypse III","1":"Insanity","2":"Nightmare","3":"Professional","3I":"Intermediate","3A":"Amateur"}[cur_evidence]
    document.getElementById("game_mode").innerHTML = `${mode_text}<span>(${parseInt(cur_evidence)} evidence)</span>`.replace("-1",document.getElementById("cust_num_evidence").value)
    $("#game_mode").fadeIn(500,function () {
        $("#game_mode").delay(500).fadeOut(500);
    });
}

function load_default(key, def){
    return user_settings.hasOwnProperty(key) ? ((user_settings[key] == '' || user_settings[key] == null) ? def : user_settings[key]) : def
}

function saveSettings(reset = false){
    user_settings['volume'] = parseInt(document.getElementById("modifier_volume").value)
    user_settings['mute_timer_toggle'] = document.getElementById("mute_timer_toggle").checked ? 1 : 0;
    user_settings['mute_timer_countdown'] = document.getElementById("mute_timer_countdown").checked ? 1 : 0;
    user_settings['timer_count_up'] = document.getElementById("timer_count_up").checked ? 1 : 0;
    user_settings['timer_split'] = document.getElementById("timer_split").checked ? 1 : 0;
    user_settings['adaptive_evidence'] = document.getElementById("adaptive_evidence").checked ? 1 : 0;
    user_settings['hide_descriptions'] = document.getElementById("hide_descriptions").checked ? 1 : 0;
    user_settings['compact_cards'] = document.getElementById("compact_cards").checked ? 1 : 0;
    user_settings['offset'] = parseFloat(document.getElementById("offset_value").innerText.replace(/\d+(?:-\d+)+/g,"")).toFixed(1)
    user_settings['ghost_modifier'] = parseInt(document.getElementById("ghost_modifier_speed").value)
    user_settings['num_evidences'] = document.getElementById("num_evidence").value
    user_settings['cust_num_evidences'] = document.getElementById("cust_num_evidence").value
    user_settings['cust_hunt_length'] = document.getElementById("cust_hunt_length").value
    user_settings['cust_starting_sanity'] = document.getElementById("cust_starting_sanity").value
    user_settings['cust_sanity_pill_rest'] = document.getElementById("cust_sanity_pill_rest").value
    user_settings['cust_sanity_drain'] = document.getElementById("cust_sanity_drain").value
    user_settings['cust_lobby_type'] = document.getElementById("cust_lobby_type").value
    user_settings['sound_type'] = document.getElementById("modifier_sound_type").value;
    user_settings['speed_logic_type'] = document.getElementById("speed_logic_type").checked ? 1 : 0;
    user_settings['bpm_type'] = document.getElementById("bpm_type").checked ? 1 : 0;
    user_settings['bpm'] = reset ? 0 : parseInt(document.getElementById('input_bpm').innerHTML.split("<br>")[0])
    user_settings['domo_side'] = $("#domovoi").hasClass("domovoi-flip") ? 1 : 0;
    user_settings['priority_sort'] = document.getElementById("priority_sort").checked ? 1 : 0;
    user_settings['map'] = $(".selected_map")[0].id
    user_settings['theme'] = $("#theme").val();

    setCookie("settings",JSON.stringify(user_settings),30)
}

function loadSettings(){
    loadThemes()

    try{
        user_settings = JSON.parse(getCookie("settings"))
    } catch (error) {
        user_settings = {"num_evidences":"3","cust_num_evidences":"3","cust_hunt_length":"3","cust_starting_sanity":"100","cust_sanity_pill_rest":"7","cust_sanity_drain":"100","cust_lobby_type":"solo","ghost_modifier":2,"volume":50,"mute_timer_toggle":0,"mute_timer_countdown":0, "timer_count_up":0,"timer_split":1,"adaptive_evidence":0,"hide_descriptions":0,"compact_cards":0,"offset":0.0,"sound_type":0,"speed_logic_type":0,"bpm_type":0,"bpm":0,"domo_side":0,"priority_sort":0,"map":"6 Tanglewood Drive","theme":"Default"}
    }

    user_settings['num_evidences'] = user_settings['num_evidences'] == "" ? "3" : user_settings['num_evidences']
    user_settings['cust_num_evidences'] = user_settings['cust_num_evidences'] == "" ? "3" : user_settings['cust_num_evidences']
    user_settings['cust_hunt_length'] = user_settings['cust_hunt_length'] == "" ? "3" : user_settings['cust_hunt_length']
    user_settings['cust_lobby_type'] = ['solo','multiplayer'].includes(user_settings['cust_lobby_type']) ? user_settings['cust_lobby_type'] : 'solo'


    document.getElementById("modifier_volume").value = load_default('volume',50)
    document.getElementById("mute_timer_toggle").checked = load_default('mute_timer_toggle',0) == 1 
    document.getElementById("mute_timer_countdown").checked = load_default('mute_timer_countdown',0) == 1
    document.getElementById("timer_count_up").checked = load_default('timer_count_up',0) == 1
    document.getElementById("timer_split").checked = load_default('timer_split',0) == 1
    document.getElementById("adaptive_evidence").checked = load_default('adaptive_evidence',0) == 1
    document.getElementById("hide_descriptions").checked = load_default('hide_descriptions',0) == 1
    document.getElementById("compact_cards").checked = load_default('compact_cards',0) == 1
    document.getElementById("offset_value").innerText = ` ${load_default('offset',0.0)}% `
    document.getElementById("ghost_modifier_speed").value = load_default('ghost_modifier',2)
    document.getElementById("num_evidence").value = load_default('num_evidences','3')
    document.getElementById("cust_num_evidence").value = load_default('cust_num_evidences','3')
    document.getElementById("cust_hunt_length").value = load_default('cust_hunt_length','3')
    document.getElementById("cust_starting_sanity").value = load_default('cust_starting_sanity','100')
    document.getElementById("cust_sanity_pill_rest").value = load_default('cust_sanity_pill_rest','7')
    document.getElementById("cust_sanity_drain").value = load_default('cust_sanity_drain','100')
    document.getElementById("cust_lobby_type").value = load_default('cust_lobby_type','solo')
    document.getElementById("modifier_sound_type").value = load_default('sound_type',0)
    document.getElementById("speed_logic_type").checked = load_default('speed_logic_type',0) == 1
    document.getElementById("bpm_type").checked = load_default('bpm_type',0) == 1
    if (load_default('domo_side',0) == 1){
        $("#domovoi").addClass("domovoi-flip")
        $("#domovoi-img").addClass("domovoi-img-flip")
    }
    document.getElementById("priority_sort").checked = load_default('priority_sort',0) == 1;
    
    var room_id = getCookie("room_id")
    if (room_id == ''){
        var map_exists = setInterval(function(){
            if(document.getElementById(user_settings['map']) != null){
                var map_elem = document.getElementById(user_settings['map'])
                changeMap(map_elem,map_elem.onclick.toString().match(/(http.+?)'\)/)[1],true)
                clearInterval(map_exists)
            }
        },500)
    }

    document.getElementById("theme").value = user_settings['theme']

    if ((user_settings['bpm'] ?? 0) > 0){
        document.getElementById('input_bpm').innerHTML = `${user_settings['bpm']}<br>bpm`
        var cms = document.getElementById("bpm_type").checked ? get_ms(user_settings['bpm']) : get_ms_exact(user_settings['bpm'])
        document.getElementById('input_speed').innerHTML = `${cms}<br>m/s`;
        try{
            mark_ghosts(cms)
        } catch(Error){
            // Om nom nom
        }
        try{
            mark_ghost_details(cms)
        } catch(Error){
            // Om nom nom
        }
    }

    setCookie("settings",JSON.stringify(user_settings),30)

    toggleDescriptions()
    toggleCompact()
    changeTheme(user_settings['theme'])
    setVolume()
    mute("toggle")
    mute("countdown")
    toggleCountup()
    adjustOffset(0)
    setTempo()
    setSoundType()
    updateMapDifficulty(user_settings['num_evidences'])
    showCustom()
    flashMode()
}

function resetSettings(){
    user_settings = {"num_evidences":"3","cust_num_evidences":"3","cust_hunt_length":"3","cust_starting_sanity":"100","cust_sanity_pill_rest":"7","cust_sanity_drain":"100","cust_lobby_type":"solo","ghost_modifier":2,"volume":50,"mute_timer_toggle":0,"mute_timer_countdown":0,"timer_count_up":0,"timer_split":1,"adaptive_evidence":0,"hide_descriptions":0,"compact_cards":0,"offset":0.0,"sound_type":0,"speed_logic_type":0,"bpm_type":0,"bpm":0,"domo_side":0,"priority_sort":0,"map":"6 Tanglewood Drive","theme":"Default"}
    document.getElementById("modifier_volume").value = load_default('volume',50)
    document.getElementById("mute_timer_toggle").checked = load_default('mute_timer_toggle',0) == 1 
    document.getElementById("mute_timer_countdown").checked = load_default('mute_timer_countdown',0) == 1
    document.getElementById("timer_count_up").checked = load_default('timer_count_up',0) == 1
    document.getElementById("timer_split").checked = load_default('timer_split',0) == 1
    document.getElementById("adaptive_evidence").checked = load_default('adaptive_evidence',0) == 1
    document.getElementById("hide_descriptions").checked = load_default('hide_descriptions',0) == 1
    document.getElementById("compact_cards").checked = load_default('compact_cards',0) == 1
    document.getElementById("offset_value").innerText = ` ${load_default('offset',0.0)}% `
    document.getElementById("ghost_modifier_speed").value = load_default('ghost_modifier',2)
    document.getElementById("num_evidence").value = load_default('num_evidences','3')
    document.getElementById("cust_num_evidence").value = load_default('cust_num_evidences','3')
    document.getElementById("cust_hunt_length").value = load_default('cust_hunt_length','3')
    document.getElementById("cust_starting_sanity").value = load_default('cust_starting_sanity','100')
    document.getElementById("cust_sanity_pill_rest").value = load_default('cust_sanity_pill_rest','7')
    document.getElementById("cust_sanity_drain").value = load_default('cust_sanity_drain','100')
    document.getElementById("cust_lobby_type").value = load_default('cust_lobby_type','solo')
    document.getElementById("modifier_sound_type").value = load_default('sound_type',0)
    document.getElementById("speed_logic_type").checked = load_default('speed_logic_type',0) == 1
    document.getElementById("bpm_type").checked = load_default('bpm_type',0) == 1
    document.getElementById("tanglewood").click()
    document.getElementById("theme").value = user_settings['theme']
    setCookie("settings",JSON.stringify(user_settings),30)
}

function toggleSanitySettings(){

    if (hasDLLink && document.getElementById("num_evidence").value == "-1"){
        $("#cust_starting_sanity").removeAttr("disabled")
        $("#cust_sanity_pill_rest").removeAttr("disabled")
        $("#cust_sanity_drain").removeAttr("disabled")
        $("#cust_lobby_type").removeAttr("disabled")
        $("#cust_starting_sanity").removeClass("option-disabled")
        $("#cust_sanity_pill_rest").removeClass("option-disabled")
        $("#cust_sanity_drain").removeClass("option-disabled")
        $("#cust_lobby_type").removeClass("option-disabled")

    }
    else if(hasDLLink && document.getElementById("num_evidence").value != "-1"){
        $("#cust_starting_sanity").attr("disabled","disabled")
        $("#cust_sanity_pill_rest").attr("disabled","disabled")
        $("#cust_sanity_drain").attr("disabled","disabled")
        $("#cust_lobby_type").removeAttr("disabled")
        $("#cust_starting_sanity").addClass("option-disabled")
        $("#cust_sanity_pill_rest").addClass("option-disabled")
        $("#cust_sanity_drain").addClass("option-disabled")
        $("#cust_lobby_type").removeClass("option-disabled")
    }
    else{
        $("#cust_starting_sanity").attr("disabled","disabled")
        $("#cust_sanity_pill_rest").attr("disabled","disabled")
        $("#cust_sanity_drain").attr("disabled","disabled")
        $("#cust_lobby_type").attr("disabled","disabled")
        $("#cust_starting_sanity").addClass("option-disabled")
        $("#cust_sanity_pill_rest").addClass("option-disabled")
        $("#cust_sanity_drain").addClass("option-disabled")
        $("#cust_lobby_type").addClass("option-disabled")
    }
}

function showCustom(){
    mquery = window.matchMedia("screen and (pointer: coarse) and (max-device-width: 600px)")
    var is_h = ![null,"","-8px"].includes(document.getElementById("menu").style.marginBottom)
    if(document.getElementById("num_evidence").value == "-1"){
        if(mquery.matches){
            document.getElementById("menu").style.height="675px";
            if(is_h){
                document.getElementById("menu").style.marginBottom = "-640px";
                $("#domovoi").removeClass("domovoi-custom")
                $("#domovoi").addClass("domovoi-menu-hidden")
            }
            else{
                $("#domovoi").addClass("domovoi-custom")
                $("#domovoi").removeClass("domovoi-menu-hidden")
            }
        }
        document.getElementById("evidence").style.marginTop = "56px";
        $("#custom_options").show()
    }
    else{
        $("#custom_options").hide()
        document.getElementById("evidence").style.marginTop = mquery.matches ? "0px" : "28px";
        if(mquery.matches){
            if(is_h){
                document.getElementById("menu").style.marginBottom = "-585px";
                $("#domovoi").removeClass("domovoi-custom")
                $("#domovoi").addClass("domovoi-menu-hidden")
            }
            else{
                $("#domovoi").removeClass(["domovoi-custom","domovoi-menu-hidden"])
            }
        }
    }
    toggleSanitySettings()
}

function changeMap(elem,map,ignore_link=false){

    $(".maps_button").removeClass("selected_map")
    $("#cur_map").html($(elem).html())
    $(elem).addClass("selected_map")
    $(".map_image").css("background-image","url("+map+")")
    var room_id = document.getElementById("room_id").value
    if(room_id != '')
        document.getElementById("map-explorer-link-2").href = `https://zero-network.net/phasmo-cheat-sheet/map-explorer/?jlid=${room_id}&pos=${my_pos}&share=${elem.id}`
    else
        $("#map-explorer-link-2").attr("href",`https://zero-network.net/phasmo-cheat-sheet/map-explorer/?share=${elem.id}`)

    state['map'] = elem.id
    setCookie("state",JSON.stringify(state),1)
    updateMapSize(elem.querySelector(".map_size").innerText)
    if(!ignore_link){
        send_state()
    }
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
    if(e.hasOwnProperty("touches")){
        mpx = (e.touches[0].clientX - $(elem).offset().left) / $(elem).width()
        mpy = (e.touches[0].clientY - $(elem).offset().top) / $(elem).height()
    }
    else{
        mpx = (e.clientX - $(elem).offset().left) / $(elem).width()
        mpy = (e.clientY - $(elem).offset().top) / $(elem).height()
    }

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

function setGhostSpeedFromDifficulty(dif){
    speed = {"-1":2,"0":4,"1":2,"2":2,"3":2,"3I":2,"3A":2}[dif]
    document.getElementById("ghost_modifier_speed").value = speed;
}

function toggleDescriptions(forced = null){

    if (forced == true){
        document.getElementById("hide_descriptions").checked = false
    }
    else if (forced == false){
        document.getElementById("hide_descriptions").checked = true
    }

    $(".ghost_card").removeClass(["ghost_card_hidden","ghost_card_compact"])
    $(".ghost_behavior").removeClass(["ghost_behavior_hidden","ghost_behavior_compact"])
    $(".ghost_clear").removeClass(["ghost_clear_compact"])

    if(document.getElementById("hide_descriptions").checked){
        $(".ghost_card").addClass(["ghost_card_hidden"])
        $(".ghost_behavior").addClass(["ghost_behavior_hidden"])
    }
    else if(document.getElementById("compact_cards").checked){
        $(".ghost_card").addClass(["ghost_card_compact"])
        $(".ghost_behavior").addClass(["ghost_behavior_compact"])
        $(".ghost_clear").addClass(["ghost_clear_compact"])
    }
}

function toggleCompact(){
    if(!document.getElementById("hide_descriptions").checked){
        if(document.getElementById("compact_cards").checked){
            $(".ghost_card").addClass(["ghost_card_compact"])
            $(".ghost_behavior").addClass(["ghost_behavior_compact"])
            $(".ghost_clear").addClass(["ghost_clear_compact"])
        }
        else{
            $(".ghost_card").removeClass(["ghost_card_compact"])
            $(".ghost_behavior").removeClass(["ghost_behavior_compact"])
            $(".ghost_clear").removeClass(["ghost_clear_compact"])
        }
    }
}

function showResetMenu(event){

    if(Object.keys(discord_user).length > 0){
        event.preventDefault()
        event.stopPropagation() //important!!

        let resetMenu = $("#resetMenu");
        resetMenu.css({top: event.y - resetMenu.height(), left: event.x, position:'absolute'})
        resetMenu.show()
    }
}

function hideResetMenu(event) {
    if(event.target.id !== 'resetMenu'){
        let resetMenu = $("#resetMenu");
        resetMenu.hide()
      }
}

function resetGhosts(skip_filter=false){
    var ghosts = document.getElementsByClassName("ghost_card")
    for (var i = 0; i < ghosts.length; i++){
        state['ghosts'][ghosts[i].id] = 1
        $(ghosts[i]).removeClass(['permhidden',"selected","guessed","died","faded"])
        $(ghosts[i].querySelector(".ghost_name")).removeClass(["strike"])
    }

    if(!skip_filter){
        setCookie("state",JSON.stringify(state),1)
        filter()
    }
}

function resetFilters(skip_filter=false){
    for(var i = 0; i < all_evidence.length; i++){
        let e = document.getElementById(all_evidence[i])
        $(e).removeClass(["block"])
        e.querySelector("#checkbox").className = "neutral"
        $(e.querySelector(".label")).removeClass(["strike","disabled-text"]);
        $(e).siblings(".monkey-paw-select").removeClass(["monkey-paw-selected"]);
        $(e).siblings(".monkey-smudge").hide()

        state['evidence'][all_evidence[i]] = 0
    }

    for(var i = 0; i < all_speed.length; i++){
        let e = document.getElementById(all_speed[i])
        $(e).removeClass(["block"])
        e.querySelector("#checkbox").className = "neutral"
        $(e.querySelector(".label")).removeClass(["strike","disabled-text"]);

        state['speed'][all_evidence[i]] = 0
    }

    for(var i = 0; i < all_sanity.length; i++){
        let e = document.getElementById(all_sanity[i])
        $(e).removeClass(["block"])
        e.querySelector("#checkbox").className = "neutral"
        $(e.querySelector(".label")).removeClass(["strike","disabled-text"]);

        state['sanity'][all_evidence[i]] = 0
    }

    let e = document.getElementById("LOS")
    $(e).removeClass(["block"])
    e.querySelector("#checkbox").className = "neutral"
    $(e.querySelector(".label")).removeClass(["strike","disabled-text"]);

    state['los'] = -1

    if(!skip_filter){
        setCookie("state",JSON.stringify(state),1)
        filter()
    }
}

function resetNoSave(){
    resetGhosts(true)
    resetFilters(true)
    setCookie("state",JSON.stringify(state),1)
    filter()
}

function reset(skip_continue_session=false){

    var ready = true
    if(!skip_continue_session){
        ready = continue_session()
    }

    if(ready){
        send_reset_link()
        state['settings'] = JSON.stringify(user_settings)
        saveSettings(true)

        fetch("https://zero-network.net/zn/"+znid+"/end",{method:"POST",body:JSON.stringify(state),signal: AbortSignal.timeout(2000)})
        .then((response) => {
            setCookie("znid",znid,-1)
            setCookie("state",JSON.stringify(state),-1)
            location.reload()
        })
        .catch((response) => {
            setCookie("znid",znid,-1)
            setCookie("state",JSON.stringify(state),-1)
            location.reload()
        });
    }
}