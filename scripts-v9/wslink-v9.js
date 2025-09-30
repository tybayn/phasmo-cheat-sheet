let ws = null
let dlws = null

let reconn_id = null
let kill_gracefully = false
let reconnecting = false
let relink_interval = null
let relink_timeout = null
let relink_live = false

var ws_ping;
var dlws_ping;
var await_dlws_pong = false

var state_received = false
var map_loaded = false

let broadcast_interval = null
let broadcast_closing = false
var muteBroadcast = false
let broadcast_audio = new Audio("assets/broadcast-alert.mp3")
broadcast_audio.preload = 'auto';
broadcast_audio.load();

var my_pos = 0
var pos_colors = {
    1:"ff0000",
    2:"00ff00",
    3:"0000ff",
    4:"ca36dd"
}

// --------------- Override WS send

const wssend = WebSocket.prototype.send

WebSocket.prototype.send = function(message){
    if(this.readyState == WebSocket.OPEN){
        wssend.call(this, message)
    }

    else if(this.readyState == WebSocket.CONNECTING){
        const timeout = setTimeout(() => {
            if(this.readyState != WebSocket.OPEN){
                console.error("Socket did not open in time, message not sent")
            }
        },5000)

        const interval = setInterval(() => {
            if(this.readyState === WebSocket.OPEN){
                clearTimeout(timeout)
                clearInterval(interval)
                wssend.call(this,message)
            }
        },250)
    }

    else{
        console.warn("Socket not open or connecting. Failed to send message")
    }

}

// --------------------------------

function mute_broadcast(){
    muteBroadcast = document.getElementById("mute_broadcast").checked
}

function close_broadcast(){
    broadcast_closing = true
    clearInterval(broadcast_interval);
    $("#broadcast").fadeOut(500)
    document.getElementById("broadcast-timer-bar").style.width = "100%";
}

function broadcast(message, remain=10000, play_sound = true){
    broadcast_closing = false
    clearInterval(broadcast_interval);
    document.getElementById("broadcast-message").innerText = message;

    if(play_sound && !muteBroadcast){
        broadcast_audio.volume = volume
        broadcast_audio.play()
    }

    $("#broadcast").fadeIn(500)
    let timerBar = document.getElementById("broadcast-timer-bar");
    let duration = 10000
    let timeLeft = remain
    
    broadcast_interval = setInterval(() => {
        timeLeft -= 100;
        const widthPercent = (timeLeft / duration) * 100;
        timerBar.style.width = `${widthPercent}%`;
        if (timeLeft <= 0) {
            clearInterval(broadcast_interval);
            $("#broadcast").fadeOut(500)
        }
    }, 100);
}

function pause_broadcast(){
    clearInterval(broadcast_interval);
}

function resume_broadcast(){
    if (!broadcast_closing){
        broadcast(
            document.getElementById("broadcast-message").innerText,
            parseFloat(document.getElementById("broadcast-timer-bar").style.width)/100 * 10000,
            false
        )
    }
}

function isUUIDv4(str) {
    const uuidv4Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidv4Regex.test(str);
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
        console.log(`Found previous link_id: ${link_id}`)
        if(isUUIDv4(link_id)){
            console.log("Detected reconnect link, attempting reconnect")
            reconn_id = link_id
            reconnecting = true
            document.getElementById("dllink_status").className = "pending"
            document.getElementById("link_id_note").innerText = `${lang_data['{{status}}']}: ${lang_data['{{awaiting_link}}']}`
            reconnect_link()
        }
        else{
            var l = document.getElementById("link_id")
            setTimeout(function(){
                l.value = link_id
                link_link()
            },1)
        }
    }
    else{
        params = new URL(window.location.href).searchParams
        if(params.get("autolink") == 'true'){
            setTimeout(function(){
                create_link(true)
            },1)
        }
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
    navigator.clipboard.writeText(`${window.location.href.split("?")[0]}?journal=${copyText}`)
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
            "dif_name":document.getElementById("num_evidence").options[document.getElementById("num_evidence").selectedIndex].text,
            "cust_num_evidences":document.getElementById("cust_num_evidence").value,
            "cust_hunt_length":document.getElementById("cust_hunt_length").value,
            "cust_starting_sanity": document.getElementById("cust_starting_sanity").value,
            "cust_sanity_pill_rest": document.getElementById("cust_sanity_pill_rest").value,
            "cust_sanity_drain": document.getElementById("cust_sanity_drain").value,
            "cust_lobby_type": document.getElementById("cust_lobby_type").value,
            "ghost_modifier":parseInt(document.getElementById("ghost_modifier_speed").value)
        }
    }
    fetch(`https://zero-network.net/znlink/create-room/${znid}`,{method:"POST",Accept:"application/json",body:JSON.stringify(outgoing_state),signal: AbortSignal.timeout(6000)})
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
    clearInterval(relink_interval)
    clearTimeout(relink_timeout)
    reconnecting = false
    kill_gracefully = false
    relink_live = false
    relink_interval = null
    relink_timeout = null
    fetch(`https://zero-network.net/znlink/create-link/${znid}`,{method:"POST",Accept:"application/json",signal: AbortSignal.timeout(6000)})
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
    var load_pos = getCookie("link-position")
    ws = new WebSocket(`wss://zero-network.net/phasmolink/link/${znid}/${room_id}${load_pos ? '?pos='+load_pos : ''}`);
    setCookie("room_id",room_id,1)

    ws.onopen = function(event){
        hasLink = true;
        $("#room_id_create").hide()
        $("#room_id_link").hide()
        $("#room_id_disconnect").show()
        $('.card_icon_guess').show()
        document.getElementById("room_id_note").innerText = `${lang_data['{{status}}']}: ${lang_data['{{connected}}']}`
        document.getElementById("settings_status").className = "connected"
        sync_sjl_dl()
        ws_ping = setInterval(function(){
            send_ping()
        }, 30000)
    }
    ws.onerror = function(event){
        document.getElementById("room_id_note").innerText = `${lang_data['{{error}}']}: ${lang_data['{{could_not_connect}}']}`
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
                    broadcast(incoming_state['message'])
                }
                if (incoming_state['action'].toUpperCase() == "UNLINK"){
                    document.getElementById("room_id_note").innerText = `${lang_data['{{status}}']}: ${lang_data['{{timeout}}']}`
                    document.getElementById("settings_status").className = "pending"
                    document.getElementById("room_id").value = ""
                    disconnect_room(false, true)
                    return
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
                if (incoming_state['action'].toUpperCase() == "SOUNDTIMER"){
                    if(incoming_state.hasOwnProperty("force_start") && incoming_state.hasOwnProperty("force_stop")){
                        toggle_sound_timer(incoming_state["force_start"], incoming_state["force_stop"])
                    }
                    else{
                        toggle_sound_timer()
                    }
                }
                if (incoming_state['action'].toUpperCase() == "CHANGE"){
                    document.getElementById("room_id_note").innerText = `STATUS: Connected (${incoming_state['players']})`
                    send_ml_state()
                }
                if (incoming_state['action'].toUpperCase() == "EVIDENCE"){
                    if(!$(document.getElementById(incoming_state['evidence']).querySelector("#checkbox")).hasClass("block")){
                        tristate(document.getElementById(incoming_state['evidence']))
                    }
                }
                if (incoming_state['action'].toUpperCase() == "POLL"){
                    polled = true
                    if(Object.keys(discord_user).length > 0){
                        if (hasSelected()){
                            ws.send('{"action":"READY"}')
                            $("#reset").html(lang_data['{{waiting_for_others}}'])
                        }
                        else{
                            $("#reset").removeClass("standard_reset")
                            $("#reset").addClass("reset_pulse")
                            $("#reset").html(`${lang_data['{{no_ghost_selected}}']}<div class='reset_note'>(${lang_data['{{double_click_to_reset']})</div>`)
                            $("#reset").attr("onclick",null)
                            $("#reset").attr("ondblclick","reset()")
                        }
                    }
                    else{
                        ws.send('{"action":"READY"}')
                        $("#reset").html(lang_data['{{waiting_for_others}}'])
                    }
                }
                return
            }

            else if (incoming_state.hasOwnProperty("error")){
                console.log(incoming_state)
                document.getElementById("room_id_note").innerText = `${lang_data['{{error}}']}: ${incoming_state['error']}!`
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
                    if(incoming_state['settings']['num_evidences'] != document.getElementById("num_evidence").value){
                        $("#cust_num_evidence").removeAttr("disabled")
                        $("#cust_hunt_length").removeAttr("disabled")
                        $("#ghost_modifier_speed").removeAttr("disabled")
                        $("#ghost_modifier_speed").removeClass("prevent")
                        document.getElementById("num_evidence").style.width = "100%"
                        $("#weekly_icon").hide()
                    }
                    if(incoming_state['settings']['num_evidences'] != "")
                        document.getElementById("num_evidence").value = incoming_state['settings']['num_evidences']
                    if(incoming_state['settings']['cust_lobby_type'] != "")
                        document.getElementById("cust_lobby_type").value = incoming_state['settings']['cust_lobby_type']
                    if (["-5","-1"].includes(incoming_state['settings']['num_evidences']) || incoming_state['settings']['num_evidences'].match(/[0-9]{4}-[0-9]{4}-[0-9]{4}/g)){
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

                        if(incoming_state['settings']['num_evidences'] === "-5"){
                            $("#cust_num_evidence").attr("disabled","disabled")
                            $("#cust_hunt_length").attr("disabled","disabled")
                            $("#ghost_modifier_speed").attr("disabled","disabled")
                            $("#ghost_modifier_speed").addClass("prevent")
                            document.getElementById("num_evidence").style.width = "calc(100% - 28px)"
                            $("#weekly_icon").show()
                        }

                        if(incoming_state['settings']['num_evidences'].match(/[0-9]{4}-[0-9]{4}-[0-9]{4}/g)){
                            $("#cust_num_evidence").attr("disabled","disabled")
                            $("#cust_hunt_length").attr("disabled","disabled")
                            $("#ghost_modifier_speed").attr("disabled","disabled")
                            $("#ghost_modifier_speed").addClass("prevent")

                            if($("#num_evidence option[value='"+incoming_state['settings']['num_evidences']+"']").length === 0){
                                let presets = document.getElementById("num_evidence")

                                if($("#num_evidence option[value='sep4']").length === 0){
                                    var opt = document.createElement('option');
                                    opt.value = "sep4";
                                    opt.innerHTML = "----Shared----"
                                    opt.disabled = true
                                    presets.appendChild(opt)
                                }

                                var opt = document.createElement('option');
                                opt.value = incoming_state['settings']['num_evidences'];
                                opt.innerHTML = incoming_state['settings']['dif_name'];
                                opt.disabled = true
                                presets.appendChild(opt);

                                document.getElementById("num_evidence").value = incoming_state['settings']['num_evidences']
                            }
                        }
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

                prev_monkey_state = incoming_state["prev_monkey_state"] ?? 0

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

                if(incoming_state.hasOwnProperty("forest_minion")){
                    if(incoming_state["forest_minion"]){
                        toggleForestMinion(true,false,true)
                    }
                    else{
                        toggleForestMinion(false,true,true)
                    }
                }

                if(incoming_state.hasOwnProperty("blood_moon")){
                    if(incoming_state["blood_moon"]){
                        toggleBloodMoon(true,false,true)
                    }
                    else{
                        toggleBloodMoon(false,true,true)
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

function reconnect_link(reconnect=true){
    relink_interval = setInterval(() =>{
        try{
            if(!relink_live){
            console.log(`Attempting to reconnect...`)
                relink_live = true
                link_link(reconnect)
            }
        }catch(e){
            console.error(e)
            //Om nom nom
        }
    },5000)

    relink_timeout = setTimeout(() => {
        console.warn("Unable to reconnect to server!")
        clearInterval(relink_interval)
        disconnect_link(false,false,1005,"Cheat Sheet unable to reconnect")
        document.getElementById("link_id_note").innerText = `${lang_data['{{error}}']}: ${lang_data['{{could_not_connect}}']}`
        document.getElementById("dllink_status").className = "error"
        setCookie("link_id","",-1)
    },5 * 60 * 1000)
}

function link_link(reconnect = false){
    var link_id = reconnect ? reconn_id : document.getElementById("link_id").value 

    try{
        dlws = new WebSocket(`wss://zero-network.net/phasmolink/link/${link_id}?me=ZNCS${reconnect ? '&reconnect=true' : ''}`);
    }
    catch(e){
        relink_live = false
        return
    }
    
    setCookie("link_id",link_id,1)

    dlws.onopen = function(event){
        hasDLLink = true;
        $("#link_id_create").hide()
        $("#link_id_create_launch").hide()
        $("#link_id_disconnect").show()
        toggleSanitySettings()
        document.getElementById("link_id_note").innerText = `${lang_data['{{status}}']}: ${lang_data['{{awaiting_link}}']}`
        document.getElementById("dllink_status").className = "pending"
        sync_sjl_dl()
    }
    dlws.onerror = function(event){
        if(!reconnecting){
            document.getElementById("link_id_note").innerText = `${lang_data['{{error}}']}: ${lang_data['{{could_not_connect}}']}`
            document.getElementById("dllink_status").className = "error"
            setCookie("link_id",reconn_id,1)
        }
    }
    dlws.onclose = function(event){
        console.log(event)
        hasDLLink = false
        relink_live = false
        setTimeout(() => {
            if(!kill_gracefully){
                if(!reconnecting){
                    reconnecting = true
                    document.getElementById("dllink_status").className = "pending"
                    document.getElementById("link_id_note").innerText = `${lang_data['{{status}}']}: ${lang_data['{{awaiting_link}}']}`
                    setCookie("link_id","",-1)
                    reconnect_link(event.reason != "keepalive ping timeout")
                }
            }
        },500)
        
    }
    dlws.onmessage = function(event) {
        try {
            clearInterval(relink_interval)
            clearTimeout(relink_timeout)
            reconnecting = false
            kill_gracefully = false
            relink_live = false
            relink_interval = null
            relink_timeout = null

            var incoming_state = JSON.parse(event.data)

            if (incoming_state.hasOwnProperty("action")){
                if (incoming_state['action'] == "?"){
                    dlws.send('{"action":"!"}')
                }
                if (incoming_state['action'].toUpperCase() == "PONG"){
                    await_dlws_pong = false
                }
                if (incoming_state['action'].toUpperCase() == "BROADCAST"){
                    broadcast(incoming_state['message'])
                }
                if (incoming_state['action'].toUpperCase() == "NEXTMAP"){
                    let cur_map_elem = document.getElementById("maps_list").querySelector(".selected_map").nextSibling
                    if (cur_map_elem === undefined || cur_map_elem === null)
                        cur_map_elem = document.getElementById("maps_list").children[0]
                    changeMap(cur_map_elem,cur_map_elem.onclick.toString().match(/(http.+?)'\)/)[1],true)
                    saveSettings()
                    send_cur_map_link()
                    send_state()
                }
                if (incoming_state['action'].toUpperCase() == "PREVMAP"){
                    let cur_map_elem = document.getElementById("maps_list").querySelector(".selected_map").previousSibling
                    if (cur_map_elem === undefined || cur_map_elem === null)
                        cur_map_elem = document.getElementById("maps_list").children[document.getElementById("maps_list").children.length-1]
                    changeMap(cur_map_elem,cur_map_elem.onclick.toString().match(/(http.+?)'\)/)[1],true)
                    saveSettings()
                    send_cur_map_link()
                    send_state()
                }
                if (incoming_state['action'].toUpperCase() == "NEXTMAPTYPE"){
                    switchMapType(true,false)
                    saveSettings()
                    send_cur_map_link()
                }
                if (incoming_state['action'].toUpperCase() == "PREVMAPTYPE"){
                    switchMapType(false,true)
                    saveSettings()
                    send_cur_map_link()
                }
                if (incoming_state['action'].toUpperCase() == "EVENTMAP"){
                    document.getElementById("map_event_check_box").checked = !document.getElementById("map_event_check_box").checked
                    changeMap(document.getElementById('maps_list').querySelector('.selected_map'),all_maps[document.getElementById('maps_list').querySelector('.selected_map').id])
                    saveSettings()
                    send_cur_map_link()
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
                if (incoming_state['action'].toUpperCase() == "GHOSTNOT"){
                    fade(document.getElementById(incoming_state['ghost']))
                }
                if (incoming_state['action'].toUpperCase() == "GHOSTDIED"){
                    died(document.getElementById(incoming_state['ghost']))
                }
                if (incoming_state['action'].toUpperCase() == "GHOSTCYCLE"){
                    if($(document.getElementById(incoming_state['ghost'])).hasClass(["selected","died"])){
                        died(document.getElementById(incoming_state['ghost']))
                    }
                    else{
                        select(document.getElementById(incoming_state['ghost']))
                    }
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
                if (incoming_state['action'].toUpperCase() == "SOUNDTIMER"){
                    let force_start = incoming_state.hasOwnProperty("reset") && incoming_state["reset"] ? true : false;
                    toggle_sound_timer(force_start)
                    send_sound_timer(force_start)
                }
                if(incoming_state['action'].toUpperCase() == "RECONN"){
                    reconn_id = incoming_state.message
                }
                if (incoming_state['action'].toUpperCase() == "LINKED"){

                    document.getElementById("link_id_note").innerText = `${lang_data['{{status}}']}: ${lang_data['{{linked}}']}`
                    document.getElementById("dllink_status").className = "connected"
                    if(incoming_state.hasOwnProperty("message")){
                        console.log(`Relinked with new link_id: ${incoming_state.message}`)
                        document.getElementById("link_id").value = incoming_state.message
                        setCookie("link_id",incoming_state.message,1)
                    }
                    dlws.send('{"action":"LINK"}')
                    send_discord_link()
                    send_map_preload_link()
                    send_sanity_link(Math.round(sanity),sanity_color())
                    send_timer_link("TIMER_VAL","0:00")
                    send_timer_link("COOLDOWN_VAL","0:00")
                    send_timer_link("HUNT_VAL","0:00")
                    send_timer_link("SOUND_VAL","0:00")
                    send_bpm_link("-","-",["50%","75%","100%","125%","150%"][parseInt($("#ghost_modifier_speed").val())])
                    send_blood_moon_link($("#blood-moon-icon").hasClass("blood-moon-active"))
                    send_forest_minion_link($("#forest-minion-icon").hasClass("forest-minion-active"))
                    filter()
                    await_dlws_pong = false
                    dlws_ping = setInterval(function(){
                        if (await_dlws_pong){
                            clearInterval(dlws_ping)
                            dlws.send('{"action":"PINGKILL"}')
                            $("#link_id_create").show()
                            mquery = window.matchMedia("screen and (pointer: coarse) and (max-device-width: 600px)")
                            if (!mquery.matches && navigator.platform.toLowerCase().includes('win'))
                                $("#link_id_create_launch").show()
                            $("#link_id_disconnect").hide()
                            document.getElementById("link_id_note").innerText = `${lang_data['{{error}}']}: ${lang_data['{{link_lost}}']}`
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
                    kill_gracefully = true
                    disconnect_link(false,false,1000,"Server or Desktop Link requested Cheat Sheet to disconnect")
                }
                if (incoming_state['action'].toUpperCase() == "DL_STEP"){
                    if (incoming_state.hasOwnProperty("timestamp")){
                        bpm_tap(incoming_state["timestamp"])
                    }
                    else{
                        bpm_tap()
                    }
                }
                if (incoming_state['action'].toUpperCase() == "BLOODMOON"){
                    toggleBloodMoon(true,false)
                    toggleForestMinion(false,true)
                }
                if (incoming_state['action'].toUpperCase() == "FORESTMINION"){
                    toggleBloodMoon(false,true)
                    toggleForestMinion(true,false)
                }
                if (incoming_state['action'].toUpperCase() == "BLOODMINION"){
                    toggleBloodMoon(true,false)
                    toggleForestMinion(true,false)
                }
                if (incoming_state['action'].toUpperCase() == "NOMODIFER"){
                    toggleBloodMoon(false,true)
                    toggleForestMinion(false,true)
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
                            $("#reset").html(`${lang_data['{{no_ghost_selected}}']}<div class='reset_note'>${lang_data['{{say_force_reset}}']}</div>`)
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
                document.getElementById("link_id_note").innerText = `${lang_data['{{error}}']}: ${incoming_state['error']}!`
                document.getElementById("dllink_status").className = "error"
            }

            if (incoming_state.hasOwnProperty("disconnect") && incoming_state['disconnect']){
                kill_gracefully = true
                disconnect_link(false,true,1000,"Server or Desktop Link requested Cheat Sheet to disconnect")
            }

        } catch (error){
            console.log(event.data)
            console.error(error)
        }
    }
}

function continue_session(){
    if(hasLink){
        ws.send('{"action":"REQUEST_RESET"}')
        polled = true
        $("#reset").html(lang_data['{{waiting_for_others}}'])
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
            document.getElementById("room_id_note").innerText = `${lang_data['{{status}}']}: ${lang_data['{{not_connected}}']}`
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
        data += document.getElementById(ghost).querySelector(".ghost_evidence").innerText.trim().replaceAll("\n",", ") + (ghost == "The Mimic" ? (", *" + all_evidence["Ghost Orbs"]) : "") + "\n"
        data += document.getElementById(ghost).querySelector(".ghost_behavior").innerText.replace(`${lang_data['{{0_evidence_tests}}']} >>`,"").trim()
        data = data.replace(`${lang_data['{{tells}}']}`,`\n<b>${lang_data['{{tells}}']}:<b>\n`)
        data = data.replace(`${lang_data['{{behaviors}}']}`,`\n<b>${lang_data['{{behaviors}}']}:<b>\n`)
        data = data.replace(`${lang_data['{{hunt_sanity}}']}`,`\n<b>${lang_data['{{hunt_sanity}}']}:<b>\n`)
        data = data.replace(`${lang_data['{{hunt_speed}}']}`,`\n<b>${lang_data['{{hunt_speed}}']}:<b>\n`)
        data = data.replace(`${lang_data['{{evidence}}']}`,`\n<b>${lang_data['{{evidence}}']}:<b>\n`)
        data = data.replace(`Tests >>\n`,"")
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
        data = data.replace(`${lang_data['{{abilities_behaviors_tells}}']}`,`<b>${lang_data['{{abilities_behaviors_tells}}']}:<b>`)
        data = data.replace(`${lang_data['{{confirmation_tests}}']}`,`\n<b>${lang_data['{{confirmation_tests}}']}:<b>`)
        data = data.replace(`${lang_data['{{elimination_tests}}']}`,`\n<b>${lang_data['{{elimination_tests}}']}:<b>`)
        data = data.replaceAll(/-.+?-/g,"")
        data = data.replace(/[ ]+/g,' ')
        data = data.replaceAll("\n ","\n")
        data = data.replaceAll(`✔ ${lang_data['{{mark_ghost}}']}`,"")
        data = data.replaceAll(`✗ ${lang_data['{{mark_ghost}}']}`,"")
        data = data.replaceAll(`\n\n${lang_data['{{tells}}'][0]}`,`\n${lang_data['{{tells}}'][0]}`)
        data = data.replaceAll(`\n\n${lang_data['{{behaviors}}'][0]}`,`\n${lang_data['{{behaviors}}'][0]}`)
        data = data.replaceAll(`\n\n${lang_data['{{abilities}}'][0]}`,`\n${lang_data['{{abilities}}'][0]}`)
        data = data.replaceAll("<b>\n\n","<b>\n").trim()
        

        dlws.send(JSON.stringify({"action":"GHOSTDATA","ghost":`${ghost}|${data}`}))
    }
}

function send_empty_data_link(){
    if(hasDLLink){
        dlws.send(JSON.stringify({"action":"GHOSTDATA","ghost":`None|<i>${lang_data['{{empty_data_link}}']}<i>`}))
    }
}

function send_evidence_link(reset = false){
    if(hasDLLink){
        var evi_list = [];
        for (const [key, value] of Object.entries(state['evidence'])){ 
            evi_list.push(`${key}:${reset ? 0 : $(document.getElementById(key)).hasClass("block") ? -2 : $(document.getElementById(key).querySelector("#checkbox")).hasClass("faded") ? -1 : value}`)
        }
        var cur_num_evi = document.getElementById("num_evidence").value
        cur_num_evi = ["-5","-1"].includes(cur_num_evi) || cur_num_evi.match(/[0-9]{4}-[0-9]{4}-[0-9]{4}/g) ? document.getElementById("cust_num_evidence").value : cur_num_evi
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

function send_blood_moon_link(value){
    if(hasDLLink){
        if (($("#forest-minion-icon").css("display") != "none") && $("#forest-minion-icon").hasClass("forest-minion-active")){
            if(value)
                dlws.send(`{"action":"BLOODMINION","value":1}`)
            else
                dlws.send(`{"action":"FORESTMINION","value":1}`)
        }
        else
            dlws.send(`{"action":"BLOODMOON","value":${value ? 1 : 0}}`)
    }
}

function send_forest_minion_link(value){
    if(hasDLLink){
        if($("#blood-moon-icon").hasClass("blood-moon-active")){
            if(value)
                dlws.send(`{"action":"BLOODMINION","value":1}`)
            else
                dlws.send(`{"action":"BLOODMOON","value":1}`)
        }
        else
            dlws.send(`{"action":"FORESTMINION","value":${value ? 1 : 0}}`)
    }
}


function send_sanity_link(value, color){
    if(hasDLLink){
        dlws.send(`{"action":"SANITY","value":${value},"color":"${color}"}`)
    }
}

function send_map_preload_link(){
    if(hasDLLink){
        cur_map_link = document.getElementById("map_image").style.backgroundImage.slice(4,-1).replace(/"/g,"")
        dlws.send(`{"action":"MAPPRELOAD","message":"${cur_map_link}","list":["${Object.values(all_maps).join('","')}","${Object.values(all_maps).join('","').replaceAll(".png","_ghost.png").replaceAll(".webp","_ghost.webp")}","${Object.values(all_maps).join('","').replaceAll(".png","_sanity.png").replaceAll(".webp","_sanity.webp")}","${Object.values(all_maps).join('","').replaceAll(".png","_temperature.png").replaceAll(".webp","_temperature.webp")}"]}`)
    }
}

function send_cur_map_link(){
    if(hasDLLink){
        cur_map_link = document.getElementById("map_image").style.backgroundImage.slice(4,-1).replace(/"/g,"")
        dlws.send(`{"action":"MAP","message":"${cur_map_link}"}`)
    }
}

function send_ping_link(){
    if(hasDLLink){
        dlws.send('{"action":"PING"}')
    }
}

function send_discord_link(){
    if(hasDLLink && Object.keys(discord_user).length > 0){
        dlws.send(`{"action":"DISCORD","username":"${discord_user.username}"}`)
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
        send_timer_link("SOUND_VAL","0:00")
        send_empty_data_link()
        dlws.send('{"action":"REQUESTRESET"}')
        dlws.send('{"action":"UNLINK"}')
    }
}

function disconnect_link(reset=false,has_status=false,code=1005,reason=null){
    clearInterval(relink_interval)
    clearTimeout(relink_timeout)
    clearInterval(dlws_ping)
    reconnecting = false
    kill_gracefully = false
    relink_live = false
    relink_interval = null
    relink_timeout = null
    if(!reset){
        if(hasDLLink){
            dlws.send('{"action":"KILL"}')
        }
        $("#link_id_create").show()
        mquery = window.matchMedia("screen and (pointer: coarse) and (max-device-width: 600px)")
        if (!mquery.matches && navigator.platform.toLowerCase().includes('win'))
            $("#link_id_create_launch").show()
        $("#link_id_disconnect").hide()
        if(!has_status){
            document.getElementById("link_id_note").innerText = `${lang_data['{{status}}']}: ${lang_data['{{not_linked}}']}`
            document.getElementById("dllink_status").className = null
            document.getElementById("link_id").value = ""
        }
        setCookie("link_id","",-1)
        hasDLLink=false
        toggleSanitySettings()
    }
    kill_gracefully = true
    dlws.close(code,reason)
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

function send_sound_timer(force_start = false, force_stop = false){
    if(hasLink){
        ws.send(`{"action":"SOUNDTIMER","force_start":${force_start},"force_stop":${force_stop}}`)
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

function sync_sjl_dl(){
    if(hasDLLink && hasLink){
        ws.send(`{"action":"SJLDLLINK","value":"${document.getElementById("link_id").value}"}`)
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
            "map_size": state['map_size'],
            "prev_monkey_state": state['prev_monkey_state'],
            "forest_minion": document.getElementById("forest-minion-icon").classList.contains("forest-minion-active") ? 1 : 0,
            "blood_moon": document.getElementById("blood-moon-icon").classList.contains("blood-moon-active") ? 1 : 0,
            'settings': {
                "num_evidences":document.getElementById("num_evidence").value,
                "dif_name":document.getElementById("num_evidence").options[document.getElementById("num_evidence").selectedIndex].text,
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
        send_ml_state()
    }
}

function send_ml_state(){
    if (hasLink){
        var ghost_list = [];
        for (const [key, value] of Object.entries(state['ghosts'])){ 
            if($(document.getElementById(key)).hasClass("hidden")){
                ghost_list.push(`${key}:-1:${bpm_list.includes(key)? 1 : bpm_los_list.includes(key) ? 2 : 0}`)
            }
            else{
                ghost_list.push(`${key}:${value}:${bpm_list.includes(key) ? 1 : bpm_los_list.includes(key) ? 2 : 0}`)
            }
        }
        ws.send(`{"action":"ML-GHOSTS","ghost":"${ghost_list}"}`)

        var evi_list = [];
        for (const [key, value] of Object.entries(state['evidence'])){ 
            evi_list.push(`${key}:${$(document.getElementById(key)).hasClass("block") ? -2 : $(document.getElementById(key).querySelector("#checkbox")).hasClass("faded") ? -1 : value}`)
        }
        ws.send(`{"action":"ML-EVIDENCE","evidences":"${evi_list}"}`)
    }   
}