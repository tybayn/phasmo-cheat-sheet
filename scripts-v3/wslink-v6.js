let ws = null
let dlws = null

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
        'sanity': state['sanity'],
        'ghosts': state['ghosts'],
        'settings': {
            "num_evidences":parseInt(document.getElementById("num_evidence").value),
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

function create_link(){
    fetch(`https://zero-network.net/phasmophobia/create-link/${znid}`,{method:"POST",Accept:"application/json",signal: AbortSignal.timeout(6000)})
    .then(response => response.json())
    .then(data => {
        var link_id = data['link_id']
        document.getElementById("link_id").value = link_id
        link_link()
    })
    .catch(response => {
        console.error(response)
    });
}

function link_room(){
    var room_id = document.getElementById("room_id").value
    ws = new WebSocket(`wss://zero-network.net/phasmolink/link/${znid}/${room_id}`);
    setCookie("room_id",room_id,1)

    ws.onopen = function(event){
        hasLink = true;
        $("#room_id_create").hide()
        $("#room_id_link").hide()
        $("#room_id_disconnect").show()
        document.getElementById("room_id_note").innerText = "STATUS: Connected"
        document.getElementById("settings_status").className = "connected"
    }
    ws.onerror = function(event){
        document.getElementById("room_id_note").innerText = "ERROR: Could not connect!"
        document.getElementById("settings_status").className = "error"
        setCookie("room_id","",-1)
    }
    ws.onmessage = function(event) {
        try {
            
            document.getElementById("settings_status").className = "connected"
            if(event.data == "-"){
                return
            }
            var incoming_state = JSON.parse(event.data)

            if (incoming_state.hasOwnProperty("action")){
                if (incoming_state['action'].toUpperCase() == "RESET"){
                    reset(true)
                }
                if (incoming_state['action'].toUpperCase() == "TIMER"){
                    toggle_timer()
                }
                if (incoming_state['action'].toUpperCase() == "COOLDOWNTIMER"){
                    toggle_cooldown_timer()
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

            if (incoming_state.hasOwnProperty("error")){
                console.log(incoming_state)
                document.getElementById("room_id_note").innerText = `ERROR: ${incoming_state['error']}!`
                document.getElementById("settings_status").className = "error"
                if (incoming_state.hasOwnProperty("disconnect") && incoming_state['disconnect']){
                    disconnect_room(false,true)
                } 
                return
            }


            if (document.getElementById("num_evidence").value != incoming_state['settings']['num_evidences']){
                document.getElementById("num_evidence").value = incoming_state['settings']['num_evidences']
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
                            autoSelect()
                        }
                    }
                }
                else if (value == -1){
                    remove(document.getElementById(key),true);
                    autoSelect()
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
                    while (value != {"good":1,"bad":-1,"neutral":0}[document.getElementById(key).querySelector("#checkbox").classList[0]]){
                        tristate(document.getElementById(key),true);
                    }
                }
            }
            for (const [key, value] of Object.entries(incoming_state["speed"])){ 
                while (value != {"good":1,"neutral":0}[document.getElementById(key).querySelector("#checkbox").classList[0]]){
                    dualstate(document.getElementById(key),true);
                }
            }
            for (const [key, value] of Object.entries(incoming_state["sanity"])){ 
                while (value != {"good":1,"neutral":0}[document.getElementById(key).querySelector("#checkbox").classList[0]]){
                    dualstate(document.getElementById(key),true,true);
                }
            }
            
            filter(true)
            autoSelect()

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
                if (incoming_state['action'].toUpperCase() == "TIMER"){
                    toggle_timer()
                    send_timer()
                }
                if (incoming_state['action'].toUpperCase() == "COOLDOWNTIMER"){
                    toggle_cooldown_timer()
                    send_cooldown_timer()
                }
                if (incoming_state['action'].toUpperCase() == "LINKED"){
                    document.getElementById("link_id_note").innerText = `STATUS: Linked`
                    document.getElementById("dllink_status").className = "connected"
                }
                if (incoming_state['action'].toUpperCase() == "UNLINKED"){
                    disconnect_link()
                }
                if (incoming_state['action'].toUpperCase() == "DL_STEP"){
                    bpm_tap()
                }
                if (incoming_state['action'].toUpperCase() == "DL_RESET"){
                    bpm_clear()
                    saveSettings()
                }
                if (incoming_state['action'].toUpperCase() == "MENUFLIP"){
                    toggleFilterTools()
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
        ws.send('{"action":"READY"}')
        polled = true
        $("#reset").html("Waiting for others...")
        return false
    }
    return true
}

function disconnect_room(reset=false,has_status=false){
    ws.close()
    if (!reset){
        $("#room_id_create").show()
        $("#room_id_link").show()
        $("#room_id_disconnect").hide()
        if(!has_status){
            document.getElementById("room_id_note").innerText = "STATUS: Not connected"
            document.getElementById("settings_status").className = null
        }
        setCookie("room_id","",-1)
        hasLink=false
    }
}

function disconnect_link(reset=false,has_status=false){
    if(!reset){
        if(hasDLLink){
            dlws.send('{"action":"KILL"}')
        }
        $("#link_id_create").show()
        $("#link_id_disconnect").hide()
        if(!has_status){
            document.getElementById("link_id_note").innerText = "STATUS: Not linked"
            document.getElementById("dllink_status").className = null
        }
        setCookie("link_id","",-1)
        hasDLLink=false
    }
    dlws.close()
}

function send_timer(){
    if(hasLink){
        ws.send('{"action":"TIMER"}')
    }
}

function send_cooldown_timer(){
    if(hasLink){
        ws.send('{"action":"COOLDOWNTIMER"}')
    }
}

function send_state() {
    if (hasLink){
        var outgoing_state = JSON.stringify({
            'evidence': state['evidence'],
            'speed': state['speed'],
            'sanity': state['sanity'],
            'ghosts': state['ghosts'],
            'settings': {
                "num_evidences":parseInt(document.getElementById("num_evidence").value),
                "ghost_modifier":parseInt(document.getElementById("ghost_modifier_speed").value)
            }
        })
        ws.send(outgoing_state)
    }
}