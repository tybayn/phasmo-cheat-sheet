let ws = null
let dlws = null

function auto_link(){
    var room_id = getCookie("room_id")
    var link_id = getCookie("link_id")
    if(room_id){
        document.getElementById("room_id").value = room_id
        link_room()
    }
    if(link_id){
        document.getElementById("link_id").value = link_id
        link_link()
    }
}

function create_room(){
    var uuid = getCookie("znid")
    var outgoing_state = {
        'evidence': state['evidence'],
        'speed': state['speed'],
        'ghosts': state['ghosts'],
        'settings': {
            "num_evidences":parseInt(document.getElementById("num_evidence").value),
            "ghost_modifier":parseInt(document.getElementById("ghost_modifier_speed").value)
        }
    }
    fetch(`https://zero-network.net/phasmophobia/create-room/${uuid}`,{method:"POST",Accept:"application/json",body:JSON.stringify(outgoing_state),signal: AbortSignal.timeout(6000)})
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
    var uuid = getCookie("znid")
    fetch(`https://zero-network.net/phasmophobia/create-link/${uuid}`,{method:"POST",Accept:"application/json",signal: AbortSignal.timeout(6000)})
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
    var uuid = getCookie("znid")

    ws = new WebSocket(`wss://zero-network.net/phasmolink/link/${uuid}/${room_id}`);
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
            var incoming_state = JSON.parse(event.data)

            if (incoming_state.hasOwnProperty("action")){
                if (incoming_state['action'].toUpperCase() == "RESET"){
                    reset(true)
                }
                if (incoming_state['action'].toUpperCase() == "TIMER"){
                    toggle_timer()
                }
                if (incoming_state['action'].toUpperCase() == "CHANGE"){
                    document.getElementById("room_id_note").innerText = `STATUS: Connected (${incoming_state['players']})`
                }
                return
            }

            if (incoming_state.hasOwnProperty("error")){
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
                document.getElementById(key).className = "ghost_card"
                document.getElementById(key).querySelector(".ghost_name").className = "ghost_name"
                state['ghosts'][key] = value
                if (value == 0){
                    fade(document.getElementById(key),true);
                }
                else if (value == -1){
                    remove(document.getElementById(key),true);
                }
                else if (value == 2){
                    select(document.getElementById(key),true);
                }
            }
            for (const [key, value] of Object.entries(incoming_state["evidence"])){ 
                while (value != {"good":1,"bad":-1,"neutral":0}[document.getElementById(key).querySelector("#checkbox").classList[0]]){
                    tristate(document.getElementById(key),true);
                }
            }
            for (const [key, value] of Object.entries(incoming_state["speed"])){ 
                while (value != {"good":1,"neutral":0}[document.getElementById(key).querySelector("#checkbox").classList[0]]){
                    dualstate(document.getElementById(key),true);
                }
            }
            
            filter(true)

        } catch (error){
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
        ws.send('{"action":"RESET"}')
    }
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

function send_state() {
    if (hasLink){
        var outgoing_state = JSON.stringify({
            'evidence': state['evidence'],
            'speed': state['speed'],
            'ghosts': state['ghosts'],
            'settings': {
                "num_evidences":parseInt(document.getElementById("num_evidence").value),
                "ghost_modifier":parseInt(document.getElementById("ghost_modifier_speed").value)
            }
        })
        ws.send(outgoing_state)
    }
}