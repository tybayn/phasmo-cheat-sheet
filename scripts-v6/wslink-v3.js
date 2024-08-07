let ws = null
let dlws = null

var ws_ping;
var dlws_ping;
var await_dlws_pong = false

var state_received = false
var map_loaded = false
const lang = "en"

var my_pos = 0
var pos_colors = {
    1:"ff0000",
    2:"00ff00",
    3:"0000ff",
    4:"ca36dd"
}

function auto_link(){
    var room_id = getCookie("room_id")
    var link_id = getCookie("link_id")
    if(room_id){
        var r = document.getElementById("room_id")
        setTimeout(function(){
            r.value = room_id
            link_room()
        },1)
    }
    if(link_id){
        var l = document.getElementById("link_id")
        setTimeout(function(){
            l.value = link_id
            link_link()
        },1)
    }
}

function copy_code(){
    var copyText = document.getElementById("link_id").value
    navigator.clipboard.writeText(copyText)
    $("#link_id_cover").fadeIn(150)
    setTimeout(function(){
        $("#link_id_cover").fadeOut(150)
    },1000)
}

function copy_url_code(){
    var copyText = document.getElementById("room_id").value
    navigator.clipboard.writeText(`${window.location.href}?journal=${copyText}`)
    $("#room_id_cover").fadeIn(150)
    setTimeout(function(){
        $("#room_id_cover").fadeOut(150)
    },1000)
}

function create_room(){
    var outgoing_state = {
        'evidence': state['evidence'],
        'speed': state['speed'],
        'los': state['los'],
        'sanity': state['sanity'],
        'ghosts': state['ghosts'],
        "map": state['map'],
        'settings': {
            "num_evidences":document.getElementById("num_evidence").value,
            "cust_num_evidences":document.getElementById("cust_num_evidence").value,
            "cust_hunt_length":document.getElementById("cust_hunt_length").value,
            "ghost_modifier":parseInt(document.getElementById("ghost_modifier_speed").value)
        }
    }
    fetch(`https://zero-network.net/phasmophobia/create-room/${znid}`,{method:"POST",Accept:"application/json",body:JSON.stringify(outgoing_state),signal: AbortSignal.timeout(6000)})
    .then(response => response.json())
    .then(data => {
        var room_id = data['room_id']
        document.getElementById("room_id").value = room_id
        link_room()
    })
    .catch(response => {
        console.error(response)
    });
}

function create_link(auto_link = false){
    fetch(`https://zero-network.net/phasmophobia/create-link/${znid}`,{method:"POST",Accept:"application/json",signal: AbortSignal.timeout(6000)})
    .then(response => response.json())
    .then(data => {
        var link_id = data['link_id']
        document.getElementById("link_id").value = link_id
        link_link()
        if(auto_link){
            var url = `zndl:${link_id}`
            $('<iframe src="' + url + '" width="1px" height="1px" style="display:none;">').appendTo('body');
        }
    })
    .catch(response => {
        console.error(response)
    });
}

function link_room(){
    var room_id = document.getElementById("room_id").value
    console.log(room_id)
    var load_pos = getCookie("link-position")
    ws = new WebSocket(`wss://zero-network.net/phasmolink/link/${znid}/${room_id}${load_pos ? '?pos='+load_pos : ''}`);
    setCookie("room_id",room_id,1)

    ws.onopen = function(event){
        hasLink = true;
        $("#room_id_create").hide()
        $("#room_id_link").hide()
        $("#room_id_disconnect").show()
        $('.card_icon_guess').show()
        document.getElementById("room_id_note").innerText = "STATUS: Connected"
        document.getElementById("settings_status").className = "connected"
        ws_ping = setInterval(function(){
            send_ping()
        }, 30000)
    }
    ws.onerror = function(event){
        document.getElementById("room_id_note").innerText = "ERROR: Could not connect!"
        document.getElementById("settings_status").className = "error"
        setCookie("room_id","",-1)
        document.getElementById("map-explorer-link-2").href = `https://zero-network.net/phasmo-cheat-sheet/map-explorer/`
    }
    ws.onmessage = function(event) {
        try {
            
            document.getElementById("settings_status").className = "connected"
            if(event.data == "-"){
                state_received = true
                return
            }
            var incoming_state = JSON.parse(event.data)

            if (incoming_state.hasOwnProperty("setpos")){
                my_pos = incoming_state["setpos"]
                setCookie("link-position",my_pos,1)
                pos_elem = document.getElementById("link_pos")
                pos_elem.innerText = my_pos
                pos_elem.style.border = `2px solid #${pos_colors[my_pos]}`
                pos_elem.style.backgroundColor = `#${pos_colors[my_pos]}44`
                $(pos_elem).show()
                var lmap = document.getElementsByClassName("selected_map")[0].id
                document.getElementById("map-explorer-link-2").href = `https://zero-network.net/phasmo-cheat-sheet/map-explorer/?jlid=${room_id}&pos=${my_pos}&share=${lmap}`
                if($(".guessed").length > 0){
                    send_guess($(".guessed")[0].id)
                }
                request_guess()
            }
            else if (incoming_state.hasOwnProperty("action")){
                if (incoming_state['action'].toUpperCase() == "RESET"){
                    reset(true)
                }
                if(incoming_state['action'].toUpperCase() == "BROADCAST"){
                    document.getElementById("room_id_note").innerText = incoming_state['message']
                }
                if (incoming_state['action'].toUpperCase() == "GUESS"){
                    try { document.getElementById(`guess_pos_${incoming_state['pos']}`).remove()} catch (error) {} 
                    if(incoming_state['ghost']){
                        document.getElementById(incoming_state['ghost']).querySelector(".ghost_guesses").innerHTML += `
                        <div id="guess_pos_${incoming_state['pos']}" class="ghost_guess" title="${incoming_state['ds_image'] ? incoming_state['ds_name'] : ('Player ' + incoming_state['pos'])}" style="${incoming_state['ds_image'] ? 'background-image: url('+incoming_state['ds_image']+');' : 'background-color: #'+pos_colors[incoming_state['pos']]+'44;'} border: 2px solid #${pos_colors[incoming_state['pos']]};">
                            ${incoming_state['ds_image'] ? "" : incoming_state['pos']}
                        </div>
                        `
                    }
                }
                if (incoming_state['action'].toUpperCase() == "GUESSSTATE"){
                    if($(".guessed").length > 0){
                        send_guess($(".guessed")[0].id)
                    }
                }
                if (incoming_state['action'].toUpperCase() == "TIMER"){
                    if(incoming_state.hasOwnProperty("force_start") && incoming_state.hasOwnProperty("force_stop")){
                        toggle_timer(incoming_state["force_start"], incoming_state["force_stop"])
                    }
                    else{
                        toggle_timer()
                    }
                }
                if (incoming_state['action'].toUpperCase() == "COOLDOWNTIMER"){
                    if(incoming_state.hasOwnProperty("force_start") && incoming_state.hasOwnProperty("force_stop")){
                        toggle_cooldown_timer(incoming_state["force_start"], incoming_state["force_stop"])
                    }
                    else{
                        toggle_cooldown_timer()
                    }
                }
                if (incoming_state['action'].toUpperCase() == "HUNTTIMER"){
                    if(incoming_state.hasOwnProperty("force_start") && incoming_state.hasOwnProperty("force_stop")){
                        toggle_hunt_timer(incoming_state["force_start"], incoming_state["force_stop"])
                    }
                    else{
                        toggle_hunt_timer()
                    }
                }
                if (incoming_state['action'].toUpperCase() == "CHANGE"){
                    document.getElementById("room_id_note").innerText = `STATUS: Connected (${incoming_state['players']})`
                }
                if (incoming_state['action'].toUpperCase() == "POLL"){
                    polled = true
                    if(Object.keys(discord_user).length > 0){
                        if (hasSelected()){
                            ws.send('{"action":"READY"}')
                            $("#reset").html("Waiting for others...")
                        }
                        else{
                            $("#reset").removeClass("standard_reset")
                            $("#reset").addClass("reset_pulse")
                            $("#reset").html("No ghost selected!<div class='reset_note'>(double click to save & reset)</div>")
                            $("#reset").attr("onclick",null)
                            $("#reset").attr("ondblclick","reset()")
                        }
                    }
                    else{
                        ws.send('{"action":"READY"}')
                        $("#reset").html("Waiting for others...")
                    }
                }
                return
            }

            else if (incoming_state.hasOwnProperty("error")){
                console.log(incoming_state)
                document.getElementById("room_id_note").innerText = `ERROR: ${incoming_state['error']}!`
                document.getElementById("settings_status").className = "error"
                if (incoming_state.hasOwnProperty("disconnect") && incoming_state['disconnect']){
                    disconnect_room(false,true)
                } 
                return
            }

            else{
                if (
                    document.getElementById("num_evidence").value != incoming_state['settings']['num_evidences'] ||
                    document.getElementById("cust_num_evidence").value != incoming_state['settings']['cust_num_evidences'] ||
                    document.getElementById("cust_hunt_length").value != incoming_state['settings']['cust_hunt_length'] ||
                    document.getElementById("cust_starting_sanity").value != incoming_state['settings']['cust_starting_sanity'] ||
                    document.getElementById("cust_sanity_pill_rest").value != incoming_state['settings']['cust_sanity_pill_rest'] ||
                    document.getElementById("cust_sanity_drain").value != incoming_state['settings']['cust_sanity_drain'] ||
                    document.getElementById("cust_lobby_type").value != incoming_state['settings']['cust_lobby_type']
                ){
                    if(incoming_state['settings']['num_evidences'] != "")
                        document.getElementById("num_evidence").value = incoming_state['settings']['num_evidences']
                    if(incoming_state['settings']['cust_lobby_type'] != "")
                        document.getElementById("cust_lobby_type").value = incoming_state['settings']['cust_lobby_type']
                    if (incoming_state['settings']['num_evidences'] == "-1"){
                        if(incoming_state['settings']['cust_num_evidences'] != "")
                            document.getElementById("cust_num_evidence").value = incoming_state['settings']['cust_num_evidences']
                        if(incoming_state['settings']['cust_hunt_length'] != "")
                            document.getElementById("cust_hunt_length").value = incoming_state['settings']['cust_hunt_length']
                        if(incoming_state['settings']['cust_starting_sanity'] != "")
                            document.getElementById("cust_starting_sanity").value = incoming_state['settings']['cust_starting_sanity']
                        if(incoming_state['settings']['cust_sanity_pill_rest'] != "")
                            document.getElementById("cust_sanity_pill_rest").value = incoming_state['settings']['cust_sanity_pill_rest']
                        if(incoming_state['settings']['cust_sanity_drain'] != "")
                            document.getElementById("cust_sanity_drain").value = incoming_state['settings']['cust_sanity_drain']
                    }
                    else{
                        set_sanity_settings()
                    }
                    updateMapDifficulty(incoming_state['settings']['num_evidences'])
                    showCustom()
                    flashMode()
                }
                if(document.getElementById("ghost_modifier_speed").value != incoming_state['settings']['ghost_modifier']){
                    document.getElementById("ghost_modifier_speed").value = incoming_state['settings']['ghost_modifier']
                }

                saveSettings()

                for (const [key, value] of Object.entries(incoming_state["ghosts"])){ 
                    if (value == 0 || value == 1){
                        if(state['ghosts'][key] == 2){
                            select(document.getElementById(key),true);
                            if(value == 0)
                                fade(document.getElementById(key),true);
                        }
                        else if(state['ghosts'][key] == -2){
                            died(document.getElementById(key),true);
                            if(value == 0)
                                fade(document.getElementById(key),true);
                        }
                        else if(state['ghosts'][key] == -1){
                            revive()
                        }
                        else if(state['ghosts'][key] != 3){
                            if((value == 0 && state['ghosts'][key] != 0) || (value == 1 && state['ghosts'][key] != 1)){
                                fade(document.getElementById(key),true);
                            }
                        }
                    }
                    else if (value == -1){
                        remove(document.getElementById(key),true);
                    }
                    else if(value == 2 || value == -2){
                        if(markedDead){
                            if(state['ghosts'][key] != -2){
                                died(document.getElementById(key),true);
                            }
                        }
                        else{
                            if(state['ghosts'][key] != 2){
                                select(document.getElementById(key),true);
                            }
                        }
                    }
                }

                if(incoming_state.hasOwnProperty("map")){
                    var map_exists = setInterval(function(){
                        if(document.getElementById(incoming_state['map']) != null){
                            state['map'] = incoming_state['map'];
                            var map_elem = document.getElementById(incoming_state["map"])
                            changeMap(map_elem,map_elem.onclick.toString().match(/(http.+?)'\)/)[1],true)
                            saveSettings()
                            clearInterval(map_exists)
                            map_loaded = true
                        }
                    },500)
                }

                var prev_evidence = state['evidence']
                var new_mp = false
                for (const [key, value] of Object.entries(incoming_state["evidence"])){ 

                    if(value == -2){
                        if(prev_evidence[key] != -2){
                            monkeyPawFilter($(document.getElementById(key)).parent().find(".monkey-paw-select"),true)
                            new_mp = true
                        }
                    }
                    else{
                        if(prev_evidence[key] == -2 && !new_mp){
                            monkeyPawFilter($(document.getElementById(key)).parent().find(".monkey-paw-select"),true)
                        }
                        while (!$(document.getElementById(key).querySelector("#checkbox")).hasClass(["bad","neutral","good"][value + 1])){
                            tristate(document.getElementById(key),true);
                        }
                    }
                }
                for (const [key, value] of Object.entries(incoming_state["speed"])){ 
                    while (!$(document.getElementById(key).querySelector("#checkbox")).hasClass(["neutral","good"][value])){
                        dualstate(document.getElementById(key),true);
                    }
                }
                for (const [key, value] of Object.entries(incoming_state["sanity"])){ 
                    while (!$(document.getElementById(key).querySelector("#checkbox")).hasClass(["neutral","good"][value])){
                        dualstate(document.getElementById(key),true,true);
                    }
                }

                if(incoming_state.hasOwnProperty("los")){
                    while (!$(document.getElementById("LOS").querySelector("#checkbox")).hasClass(["neutral","bad","good"][incoming_state["los"]+1])){
                        tristate(document.getElementById("LOS"),true,true);
                    }
                }
                
                filter(true)
                state_received = true
            }

        } catch (error){
            console.log(error)
            console.log(event.data)
        }
    }
}

function link_link(){
    var link_id = document.getElementById("link_id").value

    dlws = new WebSocket(`wss://zero-network.net/phasmolink/link/${link_id}`);
    setCookie("link_id",link_id,1)

    dlws.onopen = function(event){
        hasDLLink = true;
        $("#link_id_create").hide()
        $("#link_id_create_launch").hide()
        $("#link_id_disconnect").show()
        document.getElementById("link_id_note").innerText = "STATUS: Awaiting Desktop Link"
        document.getElementById("dllink_status").className = "pending"
    }
    dlws.onerror = function(event){
        document.getElementById("link_id_note").innerText = "ERROR: Could not connect!"
        document.getElementById("dllink_status").className = "error"
        setCookie("link_id","",-1)
    }
    dlws.onmessage = function(event) {
        try {
            var incoming_state = JSON.parse(event.data)

            if (incoming_state.hasOwnProperty("action")){
                if (incoming_state['action'].toUpperCase() == "PONG"){
                    await_dlws_pong = false
                }
                if (incoming_state['action'].toUpperCase() == "GHOSTDATA"){
                    send_ghost_data_link(incoming_state['ghost'])
                }
                if (incoming_state['action'].toUpperCase() == "GHOSTTESTS"){
                    send_ghost_tests_link(incoming_state['ghost'])
                }
                if (incoming_state['action'].toUpperCase() == "GHOSTSELECT"){
                    select(document.getElementById(incoming_state['ghost']))
                }
                if (incoming_state['action'].toUpperCase() == "TIMER"){
                    let force_start = incoming_state.hasOwnProperty("reset") && incoming_state["reset"] ? true : false;
                    toggle_timer(force_start)
                    send_timer(force_start)
                }
                if (incoming_state['action'].toUpperCase() == "COOLDOWNTIMER"){
                    let force_start = incoming_state.hasOwnProperty("reset") && incoming_state["reset"] ? true : false;
                    toggle_cooldown_timer(force_start)
                    send_cooldown_timer(force_start)
                }
                if (incoming_state['action'].toUpperCase() == "HUNTTIMER"){
                    let force_start = incoming_state.hasOwnProperty("reset") && incoming_state["reset"] ? true : false;
                    toggle_hunt_timer(force_start)
                    send_hunt_timer(force_start)
                }
                if (incoming_state['action'].toUpperCase() == "LINKED"){
                    document.getElementById("link_id_note").innerText = `STATUS: Linked`
                    document.getElementById("dllink_status").className = "connected"
                    dlws.send('{"action":"LINK"}')
                    send_sanity_link(Math.round(sanity),sanity_color())
                    send_timer_link("TIMER_VAL","0:00")
                    send_timer_link("COOLDOWN_VAL","0:00")
                    send_timer_link("HUNT_VAL","0:00")
                    send_bpm_link("-","-",["50%","75%","100%","125%","150%"][parseInt($("#ghost_modifier_speed").val())])
                    filter()
                    toggleSanitySettings()
                    await_dlws_pong = false
                    dlws_ping = setInterval(function(){
                        if (await_dlws_pong){
                            clearInterval(dlws_ping)
                            dlws.send('{"action":"PINGKILL"}')
                            $("#link_id_create").show()
                            mquery = window.matchMedia("screen and (pointer: coarse) and (max-device-width: 600px)")
                            if(!mquery.matches)
                                $("#link_id_create_launch").show()
                            $("#link_id_disconnect").hide()
                            document.getElementById("link_id_note").innerText = "ERROR: Link Lost Connection!"
                            document.getElementById("dllink_status").className = "error"
                            document.getElementById("link_id").value = ""
                            setCookie("link_id","",-1)
                            hasDLLink=false
                            dlws.close()
                        }
                        else{
                            send_ping_link()
                            await_dlws_pong = true
                        }
                    }, 30000)
                }
                if (incoming_state['action'].toUpperCase() == "UNLINK"){
                    disconnect_link()
                }
                if (incoming_state['action'].toUpperCase() == "DL_STEP"){
                    if (incoming_state.hasOwnProperty("timestamp")){
                        bpm_tap(incoming_state["timestamp"])
                    }
                    else{
                        bpm_tap()
                    }
                }
                if (incoming_state['action'].toUpperCase() == "SANITY"){
                    if(incoming_state['value'].toUpperCase() == "TOGGLE"){
                        toggle_sanity_drain()
                    }
                    else if(incoming_state['value'].toUpperCase() == "RESTORE"){
                        restore_sanity()
                    }
                    else if(incoming_state['value'].toUpperCase() == "RESET"){
                        reset_sanity()
                    }
                    else{
                        adjust_sanity(parseInt(incoming_state['value']))
                    }
                }
                if (incoming_state['action'].toUpperCase() == "DL_RESET"){
                    bpm_clear()
                    saveSettings()
                }
                if (incoming_state['action'].toUpperCase() == "MENUFLIP"){
                    toggleFilterTools()
                }
                if(incoming_state['action'].toUpperCase() == "SAVERESET"){
                    if(Object.keys(discord_user).length > 0){
                        if(!hasSelected()){
                            send_ghost_link("None Selected!",-1)
                            $("#reset").removeClass("standard_reset")
                            $("#reset").addClass("reset_pulse")
                            $("#reset").html("No ghost selected!<div class='reset_note'>(say 'force reset' to save & reset)</div>")
                            $("#reset").prop("onclick",null)
                            $("#reset").prop("ondblclick","reset()")
                            reset_voice_status()
                        }
                        else{
                            reset()
                        }
                    }
                    else{
                        reset()
                    }
                }
                if(incoming_state['action'].toUpperCase() == "FORCERESET"){
                    reset()
                }

                if (incoming_state['action'].toUpperCase() == "EVIDENCE"){
                    if(!$(document.getElementById(incoming_state['evidence']).querySelector("#checkbox")).hasClass("block")){
                        tristate(document.getElementById(incoming_state['evidence']))
                    }
                }
                return
            }

            if (incoming_state.hasOwnProperty("error")){
                document.getElementById("link_id_note").innerText = `ERROR: ${incoming_state['error']}!`
                document.getElementById("dllink_status").className = "error"
            }

            if (incoming_state.hasOwnProperty("disconnect") && incoming_state['disconnect']){
                disconnect_link(false,true)
            }

        } catch (error){
            console.log(event.data)
        }
    }
}

function continue_session(){
    if(hasLink){
        ws.send('{"action":"REQUEST_RESET"}')
        polled = true
        $("#reset").html("Waiting for others...")
        return false
    }
    return true
}

function disconnect_room(reset=false,has_status=false){
    ws.close()
    $(document.getElementById("link_pos")).hide()
    try { document.getElementById(`guess_pos_1`).remove()} catch (error) {} 
    try { document.getElementById(`guess_pos_2`).remove()} catch (error) {} 
    try { document.getElementById(`guess_pos_3`).remove()} catch (error) {} 
    try { document.getElementById(`guess_pos_4`).remove()} catch (error) {} 
    var lmap = document.getElementsByClassName("selected_map")[0].id
    document.getElementById("map-explorer-link-2").href = `https://zero-network.net/phasmo-cheat-sheet/map-explorer/?share=${lmap}`
    if (Object.keys(discord_user).length == 0)
        $('.card_icon_guess').hide()
    clearInterval(ws_ping)
    if (!reset){
        $("#room_id_create").show()
        $("#room_id_link").show()
        $("#room_id_disconnect").hide()
        if(!has_status){
            document.getElementById("room_id_note").innerText = "STATUS: Not connected"
            document.getElementById("settings_status").className = null
            document.getElementById("room_id").value = ""
        }
        setCookie("room_id","",-1)
        setCookie("link-position","",1)
        hasLink=false
    }
}

function send_bpm_link(bpm,speed,modifer){
    if(hasDLLink){
        dlws.send(`{"action":"BPM","bpm":"${bpm}","speed":"${speed}","modifier":"${modifer}"}`)
    }
}

function send_timer_link(timer,value,alt_color = 0){
    if(hasDLLink){
        dlws.send(`{"action":"${timer}","timer_val":"${value}","status":${alt_color}}`)
    }
}

function send_ghost_link(ghost,value){
    if(hasDLLink){
        dlws.send(`{"action":"GHOST","ghost":"${ghost}","status":${value}}`)
    }
}

function send_ghost_data_link(ghost){
    if(hasDLLink){
        var readd_classes = []
        if($(document.getElementById(ghost)).hasClass("hidden"))
            readd_classes.push("hidden")
        if($(document.getElementById(ghost)).hasClass("permhidden"))
            readd_classes.push("permhidden")

        $(document.getElementById(ghost)).removeClass(readd_classes)
        data = `<b>${ghost}:<b>\n`
        data += document.getElementById(ghost).querySelector(".ghost_evidence").innerText.trim().replaceAll("\n",", ") + (ghost == "The Mimic" ? ", *Ghost Orbs" : "") + "\n"
        data += document.getElementById(ghost).querySelector(".ghost_behavior").innerText.replace("0 Evidence Tests >>","").trim()
        data = data.replace("Tells","\n<b>Tells:<b>\n")
        data = data.replace("Behaviors","\n<b>Behaviors:<b>\n")
        data = data.replace("Hunt Sanity","\n<b>Hunt Sanity:<b>\n")
        data = data.replace("Hunt Speed","\n<b>Hunt Speed:<b>\n")
        data = data.replace("Evidence","\n<b>Evidence:<b>\n")
        data = data.replace("Tests >>\n","")
        data = data.replace("🔊","")
        data = data.replaceAll("<b>\n\n","<b>\n")
        data = data.replace(/[ ]+/g,' ').trim()
        $(document.getElementById(ghost)).addClass(readd_classes)
        
        dlws.send(JSON.stringify({"action":"GHOSTDATA","ghost":`${ghost}|${data}`}))
    }
}

function send_ghost_tests_link(ghost){
    if(hasDLLink){
        data = `<b>${ghost} Tests:<b>\n`
        data += document.getElementById(`wiki-0-evidence-${ghost.toLowerCase().replace(" ","-")}`).nextElementSibling.innerText.replace("† The Mimic can copy abilities and behaviors of other ghosts, meaning that any confirmation test could also be a Mimic","").replace("Copy Share Link","").replace("†","").trim()
        data = data.replace("Abilities, Behaviors, & Tells","<b>Abilities, Behaviors, & Tells:<b>")
        data = data.replace("Confirmation Test(s)","\n<b>Confirmation Test(s):<b>")
        data = data.replace("Elimination Test(s)","\n<b>Elimination Test(s):<b>")
        data = data.replaceAll(/-.+?-/g,"")
        data = data.replace(/[ ]+/g,' ')
        data = data.replaceAll("\n ","\n")
        data = data.replaceAll("✔ Mark Ghost","")
        data = data.replaceAll("✗ Mark Ghost","")
        data = data.replaceAll("\n\nT","\nT")
        data = data.replaceAll("\n\nB","\nB")
        data = data.replaceAll("\n\nA","\nA")
        data = data.replaceAll("<b>\n\n","<b>\n").trim()
        

        dlws.send(JSON.stringify({"action":"GHOSTDATA","ghost":`${ghost}|${data}`}))
    }
}

function send_empty_data_link(){
    if(hasDLLink){
        dlws.send(JSON.stringify({"action":"GHOSTDATA","ghost":`None|<i>Click a ghost to see its tells and behaviors\n(Use ' [ ' and ' ] ' to cycle through ghosts)<i>`}))
    }
}

function send_evidence_link(reset = false){
    if(hasDLLink){
        var evi_list = [];
        for (const [key, value] of Object.entries(state['evidence'])){ 
            evi_list.push(`${key}:${reset ? 0 : $(document.getElementById(key)).hasClass("block")? -2 : value}`)
        }
        var cur_num_evi = document.getElementById("num_evidence").value
        cur_num_evi = cur_num_evi == "-1" ? document.getElementById("cust_num_evidence").value : cur_num_evi
        dlws.send(`{"action":"EVIDENCE","evidences":"${evi_list}","num_evidence":"${cur_num_evi}"}`)
    }
}

function send_ghosts_link(reset = false){
    if(hasDLLink){
        var ghost_list = [];
        for (const [key, value] of Object.entries(state['ghosts'])){ 
            if($(document.getElementById(key)).hasClass("hidden")){
                ghost_list.push(`${key}:${reset ? 1 : -1}:${bpm_list.includes(key) && !reset ? 1 : bpm_los_list.includes(key) ? 2 : 0}`)
            }
            else{
                ghost_list.push(`${key}:${reset ? 1 :value}:${bpm_list.includes(key) && !reset  ? 1 : bpm_los_list.includes(key) ? 2 : 0}`)
            }
        }
        dlws.send(`{"action":"GHOSTS","ghost":"${ghost_list}"}`)
    }
}


function send_sanity_link(value, color){
    if(hasDLLink){
        dlws.send(`{"action":"SANITY","value":${value},"color":"${color}"}`)
    }
}

function send_ping_link(){
    if(hasDLLink){
        dlws.send('{"action":"PING"}')
    }
}

function send_reset_link(){
    if(hasDLLink){
        send_ghost_link("",0)
        send_ghosts_link(true)
        send_evidence_link(true)
        send_bpm_link("-","-",["50%","75%","100%","125%","150%"][parseInt($("#ghost_modifier_speed").val())])
        send_timer_link("TIMER_VAL","0:00")
        send_timer_link("COOLDOWN_VAL","0:00")
        send_timer_link("HUNT_VAL","0:00")
        send_empty_data_link()
        dlws.send('{"action":"UNLINK"}')
    }
}

function disconnect_link(reset=false,has_status=false){
    clearInterval(dlws_ping)
    if(!reset){
        if(hasDLLink){
            dlws.send('{"action":"KILL"}')
        }
        $("#link_id_create").show()
        $("#link_id_create_launch").show()
        $("#link_id_disconnect").hide()
        toggleSanitySettings()
        if(!has_status){
            document.getElementById("link_id_note").innerText = "STATUS: Not linked"
            document.getElementById("dllink_status").className = null
            document.getElementById("link_id").value = ""
        }
        setCookie("link_id","",-1)
        hasDLLink=false
    }
    dlws.close()
}

function send_timer(force_start = false, force_stop = false){
    if(hasLink){
        ws.send(`{"action":"TIMER","force_start":${force_start},"force_stop":${force_stop}}`)
    }
}

function send_cooldown_timer(force_start = false, force_stop = false){
    if(hasLink){
        ws.send(`{"action":"COOLDOWNTIMER","force_start":${force_start},"force_stop":${force_stop}}`)
    }
}

function send_hunt_timer(force_start = false, force_stop = false){
    if(hasLink){
        ws.send(`{"action":"HUNTTIMER","force_start":${force_start},"force_stop":${force_stop}}`)
    }
}

function send_guess(ghost){
    if(hasLink){
        ds_name = Object.keys(discord_user).length > 0 ? discord_user['username'] : ""
        ds_image = Object.keys(discord_user).length > 0 ? `https://cdn.discordapp.com/avatars/${discord_user['id']}/${discord_user['avatar']}`: ""
        ws.send(`{"action":"GUESS","pos":${my_pos},"ghost":"${ghost}","ds_name":"${ds_name}","ds_image":"${ds_image}"}`)
    }
}

function request_guess(){
    if(hasLink){
        ws.send(`{"action":"GUESSSTATE"}`)
    }
}

function send_ping(){
    if(hasLink){
        ws.send('{"action":"PING"}')
    }
}

function send_state() {
    if (hasLink && state_received && map_loaded){
        var outgoing_state = JSON.stringify({
            'evidence': state['evidence'],
            'speed': state['speed'],
            'los': state['los'],
            'sanity': state['sanity'],
            'ghosts': state['ghosts'],
            "map": state['map'],
            'settings': {
                "num_evidences":document.getElementById("num_evidence").value,
                "cust_num_evidences":document.getElementById("cust_num_evidence").value,
                "cust_hunt_length":document.getElementById("cust_hunt_length").value,
                "cust_starting_sanity": document.getElementById("cust_starting_sanity").value,
                "cust_sanity_pill_rest": document.getElementById("cust_sanity_pill_rest").value,
                "cust_sanity_drain": document.getElementById("cust_sanity_drain").value,
                "cust_lobby_type": document.getElementById("cust_lobby_type").value,
                "ghost_modifier":parseInt(document.getElementById("ghost_modifier_speed").value)
            }
        })
        ws.send(outgoing_state)
    }
}