function getCookie(e){let t=e+"=",i=decodeURIComponent(document.cookie).split(";");for(let n=0;n<i.length;n++){let o=i[n];for(;" "==o.charAt(0);)o=o.substring(1);if(0==o.indexOf(t))return o.substring(t.length,o.length)}return""}
function setCookie(e,t,i){let n=new Date;n.setTime(n.getTime()+864e5*i);let o="expires="+n.toUTCString();document.cookie=e+"="+t+";"+o+";path=/"}

let openSearchTab = false

function startDebugMode(){

    if(typeof console != 'undefined')
        if(typeof console.log != 'undefined')
            console.olog = console.log
        else
            console.olog = function() {}

    console.log = function(message){
        console.olog(message)
        document.getElementById("debug-console").value += `${message}\n`
    }
    console.error = console.debug = console.info = console.log

    window.onerror = function(event){
        console.log(event)
        return false
    }
}

function checkLink(){
    return new Promise((resolve, reject) => {
        params = new URL(window.location.href).searchParams

        if (params.get("id")){
            discord_link = {
                "id":params.get("id"),
                "username":params.get("username"),
                "avatar":params.get("avatar"),
                "last_linked":params.get("last_linked")
            }

            znid = getCookie("znid")

            setCookie("discord_link",JSON.stringify(discord_link),30)
            fetch(`https://zero-network.net/zn/${znid}/attach/${discord_link['id']}`, {method:"POST",signal: AbortSignal.timeout(6000)})
            .then(data => {
                window.location.href = window.location.href.split("?")[0]
            })
            
        }

        if (params.get('journal')){
            setCookie("room_id",params.get('journal'),1)
            window.location.href = window.location.href.split("?")[0]
        }

        if (params.get('lang')){
            lang = params.get('lang').toLowerCase()
            setCookie("lang",lang,90)
        }

        if (params.get("debug") == "true" || params.get("debug") == "True"){
            startDebugMode()
            $("#debug_tab").show()
        }

        if (params.get("search")){
            openSearchTab = true
        }

        resolve("URL parsed")
    })
}

function heartbeat(){
    if(znid != "no-connection-to-server"){
        state['settings'] = JSON.stringify(user_settings)
        fetch("https://zero-network.net/zn/"+znid,{method:"POST",Accept:"application/json",body:JSON.stringify(state),signal: AbortSignal.timeout(10000)})
        .then(response => response.json())
        .then(data => {
            $("#active-users-label").text(lang_data['{{active_users}}']+ ": " + data['active_num_users'])
        })
        .catch(response => {
            console.error(response)
            $("#active-users-label").text(lang_data['{{active_users}}']+ ": -")
        });
    }
    else {
        $("#active-users-label").text(lang_data['{{active_users}}']+ ": -")
    }
}

function loadAllAndConnect(){
    let loadZN = new Promise((resolve, reject) => {
        znid = getCookie("znid")
        pznid = getCookie("prev-znid")
        if(znid && znid!="no-connection-to-server"){
            $("#session").text(`C: ${znid}`)
            $("#prev-session").text(`P: ${pznid == '' ? '-' : pznid}`)

            if(znid!="no-connection-to-server"){
                $('#room_id').val("")
                $('#room_id').css('color',"#CCC")
                $('#room_id').prop('disabled',false)
                $('#room_id_create').show()
                $('#room_id_link').show()
                $('#link_id_create').show()
                mquery = window.matchMedia("screen and (pointer: coarse) and (max-device-width: 600px)")
                if(!mquery.matches && navigator.platform.toLowerCase().includes('win'))
                    $('#link_id_create_launch').show()
            }
            else{
                $('#room_id').val("Can't Connect!")
                $('#link_id').val("Can't Connect!")
            }
            resolve("Loaded existing session")
        }
        else{
            var id;
            try{
                id = JSON.parse(getCookie("discord_link"))['id'];
            } catch(Error) {
                id = false;
            }
            fetch(`https://zero-network.net/zn/?lang=${lang}${id ? '&discord_id='+id : ''}`,{headers:{Accept:"application/json"}, signal: AbortSignal.timeout(10000)})
            .then(e=>e.json())
            .then(e => {
                znid = e.znid
                setCookie("znid",e.znid,1)

                $("#session").text(`C: ${e.znid}`)
                $("#prev-session").text(`P: ${pznid == '' ? '-' : pznid}`)

                $('#room_id').val("")
                $('#room_id').css('color',"#CCC")
                $('#room_id').prop('disabled',false)
                $('#room_id_create').show()
                $('#room_id_link').show()
                $('#link_id_create').show()
                mquery = window.matchMedia("screen and (pointer: coarse) and (max-device-width: 600px)")
                if(!mquery.matches && navigator.platform.toLowerCase().includes('win'))
                    $('#link_id_create_launch').show()
            })
            .then(x =>{
                resolve("New session created")
            })
            .catch(response => {
                znid = 'no-connection-to-server'
                console.log(response)
                console.warn("Possible latency issues!")
                setCookie("znid","no-connection-to-server",1)
                $('#room_id').val("Can't Connect!")
                $('#link_id').val("Can't Connect!")
                $("#session").text("no-connection-to-server")
                $("#prev-session").text(`P: ${pznid == '' ? '-' : pznid}`)
                reject("Unable to connect")
            })
        }
    })

    let loadData = new Promise((resolve, reject) => {

        lang = getCookie("lang")
        if(!lang){
            lang = 'en'
        }
        try{
            fetch(`https://zero-network.net/phasmophobia/data/ghosts.json?lang=${lang}`, {cache: 'default', signal: AbortSignal.timeout(10000)})
            .then(data => data.json())
            .then(data => {

                all_ghosts = Object.fromEntries(data.ghosts.map(a => [a.ghost,a.name]))
                all_evidence = data.evidence

                var cards = document.getElementById('cards')
                var wiki = document.getElementById('wiki-0-evidence-data')
                var cur_version = document.getElementById('current-version-label')
                var evidence_list = document.getElementById('evidence')
        
                evidence_list.innerHTML = "";
                Object.entries(data.evidence).forEach(([key,value]) => {
                    evidence_list.innerHTML += `
                    <div class="evidence-row">
                        <img class="monkey-smudge" style="display:none;" src="imgs/smudge.png">
                        <button id="${key}" class="tricheck white" name="evidence" onclick="tristate(this)" value="${key}">
                            <div id="checkbox" class="neutral"><span class="icon"></span></div>
                            <div class="label">${value}</div>
                        </button>
                        <img class="monkey-paw-select" src="imgs/paw-icon.png" onclick="monkeyPawFilter(this)">
                    </div>
                    `
                })
        
                cards.innerHTML = "";
                wiki.innerHTML = "";
                for(var i = 0; i < data.ghosts.length; i++){
                    bpm_speeds.add(data.ghosts[i].min_speed)
                    if(data.ghosts[i].max_speed != null){bpm_speeds.add(data.ghosts[i].max_speed)}
                    if(data.ghosts[i].alt_speed != null){bpm_speeds.add(data.ghosts[i].alt_speed)}
                    var ghost = new Ghost(data.ghosts[i],data.evidence);
                    cards.innerHTML += `${ghost.ghostTemplate}`
                    wiki.innerHTML += (i == data.ghosts.length-1 ? `${ghost.wikiTemplate.replace("&#9500;","&#9492;")}` : `${ghost.wikiTemplate}`)
                }
                cur_version.innerHTML = `${data.version}`
                
            })
            .then(data => {
                var raw_state = getCookie("state")

                if (!raw_state || raw_state == '' || raw_state == null){
                    console.log("No State found")
                    for (var i = 0; i < Object.keys(all_evidence).length; i++){
                        state["evidence"][Object.keys(all_evidence)[i]] = 0
                    }
                    for (var i = 0; i < Object.keys(all_ghosts).length; i++){
                        state["ghosts"][Object.keys(all_ghosts)[i]] = 1
                    }
                    state["prev_monkey_state"] = 0

                    var read_state = JSON.parse(JSON.stringify(state))
                }
                else{
                    var read_state = JSON.parse(raw_state)
                }

                for (const [key, value] of Object.entries(read_state["evidence"])){ 
                    if($(document.getElementById(key)).parent().find(".monkey-paw-select").hasClass("monkey-paw-selected"))
                        monkeyPawFilter($(document.getElementById(key)).parent().find(".monkey-paw-select"))

                    if (value == 1){
                        tristate(document.getElementById(key));
                    }
                    else if (value == -1){
                        tristate(document.getElementById(key));
                        tristate(document.getElementById(key));
                    }
                    else if (value == -2){
                        monkeyPawFilter($(document.getElementById(key)).parent().find(".monkey-paw-select"))
                    }
                }
                for (const [key, value] of Object.entries(read_state["speed"])){ 
                    if (value == 1){
                        $("#"+key)[0].click();
                    }
                }
                for (const [key, value] of Object.entries(read_state["sanity"])){ 
                    if (value == 1){
                        $("#"+key)[0].click();
                    }
                }
                prev_monkey_state = read_state["prev_monkey_state"] ?? 0

                if (state['los'] == 1){
                    tristate(document.getElementById("LOS"));
                }
                else if (state['los'] == 0){
                    tristate(document.getElementById("LOS"));
                    tristate(document.getElementById("LOS"));
                }

                for (const [key, value] of Object.entries(read_state['ghosts'])){ 
                    if (value == 0){
                        fade(document.getElementById(key), true);
                    }
                    else if (value == -2){
                        died(document.getElementById(key), true, true);
                    }
                    else if (value == -1){
                        remove(document.getElementById(key), true, true);
                    }
                    else if (value == 2){
                        select(document.getElementById(key), true, true);
                    }
                    else if (value == 3){
                        guess(document.getElementById(key), true, true);
                    }
                    else{
                        state['ghosts'][key] = value
                    }
                }
            })
            .then(() => {
                resolve("Ghost data loaded")
            })
            .catch(error => {
                console.error(error)
                document.getElementById("page-loading-status").innerText = "failed to load ghost data!"
                reject("Could not load ghost data")
            })
        }
        catch{
            document.getElementById("page-loading-status").innerText = "failed to load ghost data!"
            reject("Could not load ghost data")
        }
    })

    let loadMaps = new Promise((resolve, reject) => {
        fetch("https://zero-network.net/phasmophobia/data/maps", {cache: 'default', signal: AbortSignal.timeout(12000)})
        .then(data => data.json())
        .then(data => {
            var map_html = ""
            var usr_set = {}
            try{
                let cur_settings = getCookie("settings")
                usr_set = JSON.parse(cur_settings)
            }
            catch(e){
                console.warn(`Error loading settings! Loading defaults...`)
                usr_set = user_settings
            }
            
            var usr_map = usr_set.hasOwnProperty('map') ? usr_set['map'] == "6 Tanglewood Drive" ? "tanglewood" : usr_set['map']: "tanglewood"

            for(var i = 0; i < data.length; i++) {
                all_maps[data[i]['div_id']] = data[i]['file_url']
                if(data[i]['extra'] !== '')
                    all_maps[`${data[i]['div_id']}-e`] = data[i]['extra']
                map_html += `<button class="maps_button${data[i]['div_id'] == usr_map ? " selected_map" : ""}" id="${data[i]['div_id']}" onclick="changeMap(this,'${data[i]['file_url']}');send_cur_map_link();saveSettings();"><div class="map_size ${data[i]['size'].toLowerCase()}">${data[i]['size']}</div>${data[i]['name']}${data[i]['extra'] !== '' ? '<div class="event_map">★</div>' : ''}</button>`
            }
            $("#maps_list").html(map_html)

            resolve("Map data loaded")
        })
        .catch(error => {
            console.error(error)
            document.getElementById("page-loading-status").innerText = "failed to load map data!"
            reject("Failed to load map data")
        })

    })

    let loadWeekly = new Promise((resolve, reject) => {
        fetch("https://zero-network.net/phasmophobia/data/weekly.json", {cache: 'default', signal: AbortSignal.timeout(10000)})
        .then(data => data.json())
        .then(data => {
            weekly_data = {
                "title": data.challenge,
                "description": data.description,
                "map": data.map,
                "map_id": data.map_id,
                "player_speed": data.details.player_speed,
                "ghost_speed": data.details.ghost_speed,
                "num_evidence": data.details.num_evidence,
                "hunt_duration": data.details.cssettings.hunt_duration,
                "sanity_drain_speed": data.details.cssettings.sanity_drain_speed,
                "sanity_pill_restoration": data.details.cssettings.sanity_pill_restoration,
                "starting_sanity": data.details.cssettings.starting_sanity,
                "equipment_url": data.equipment_url,
                "cursed_objects": data.details.cursed_objects,
                "friendly_ghost": data.details.friendly_ghost,
                "difficulty_id": data.difficulty_id
            }

            let image_str = weekly_data.equipment_url !== null ?  `<img class="weekly-image" loading="lazy" src="${weekly_data.equipment_url}">` : "<h4>{{weekly_missing_image}}</h4>"

            let weekly_html = `
                <h1>${weekly_data.title}</h1>
                <h4 style="margin-top:0px;"><i>${weekly_data.description}</i></h4>
                <hr>
                <div class="weekly-modifiers">
                    <div class="weekly-mod"><b>{{weekly_map}}</b>${weekly_data.map}</div>
                    <div class="weekly-mod"><b>{{weekly_player_speed}}</b>${weekly_data.player_speed}%</div>
                    <div class="weekly-mod"><b>{{weekly_ghost_speed}}</b>${weekly_data.ghost_speed}%</div>   
                    <div class="weekly-mod"><b>{{weekly_num_evidence}}</b>${weekly_data.num_evidence}</div>
                    <div class="weekly-mod"><b>{{weekly_cursed_possessions}}</b>${weekly_data.cursed_objects.join(', ')}</div>
                    <div class="weekly-mod"><b>{{weekly_friendly_ghost}}</b>${weekly_data.friendly_ghost}</div>
                </div>
                ${image_str}
            `

            document.getElementById("weekly_title").innerText += ` (${getCurrentWeekUTC()})`
            document.getElementById("weekly_info_box").innerHTML = weekly_html
            document.getElementById("weekly_footer").innerHTML = `<b>{{weekly_difficulty_settings}}</b>: <a href="https://zero-network.net/phasmo-cheat-sheet/difficulty-builder/?share=${weekly_data.difficulty_id}" target="_blank">${weekly_data.difficulty_id}</a>`

            resolve("Weekly data loaded")
        })
        .catch(error => {
            console.error(error)
            reject("Failed to load weekly data")
        })
    })

    let loadLanguages = new Promise((resolve, reject) => {
        fetch("https://zero-network.net/phasmophobia/languages", {cache: 'default', signal: AbortSignal.timeout(10000)})
        .then(data => data.json())
        .then(data => {
            var lang_html = ""
            for(let i = 0; i < data.length; i++){
                lang_html += `<option value=${data[i]['url']} ${data[i]['lang'] == lang ? "selected" : ""}>${data[i]['lang_option']}</option>`
            }
            $("#language").html(lang_html)

            resolve("Language data loaded")
        })
        .catch(error => {
            console.error(error)
            reject("Failed to load language data")
        })
    })
    
    document.getElementById("page-loading-status").innerText = "loading language data..."
    Promise.all([load_translation()])
    .then(() => {
        document.getElementById("page-loading-status").innerText = "loading ghost & map data..."
        Promise.all([loadZN,loadData,loadMaps,loadWeekly,loadLanguages])
        .then(() => {
            document.getElementById("page-loading-status").innerText = "translating page..."
            Promise.all([translate(lang)])
            .then(() => {
                document.getElementById("page-loading-status").innerText = "translating wiki..."
                Promise.all([translate_wiki(lang)])
                .then(() => {
                    document.getElementById("page-loading-status").innerText = "loading user settings..."
                    Promise.all([getLink()])
                    .then(() => {
                        loadSettings()
                        filter(true)
                        applyPerms()
                        auto_link()
                        openWikiFromURL()
                        loadSearch()

                        try{heartbeat()} catch(Error){console.warn("Possible latency issues!")}
                        setInterval(function(){
                            if(!document.hidden){
                                try{heartbeat()} catch(Error){console.error("Heartbeat failed!")}
                            }
                        }, 300000)
                    })
                })
            })
        })
    })
}

function loadSearch(){
    mquery = window.matchMedia("screen and (pointer: coarse) and (max-device-width: 600px)")
    params = new URL(window.location.href).searchParams
    if(!mquery.matches && openSearchTab){
        document.getElementById("search_bar").value = params.get("search")
        showSearch()
        search()
        let url = new URL(window.location.href)
        url.searchParams.delete("search")
        history.replaceState(history.state,"",url.href)
    }
}


function copy_user_settings(){
    var copyText = JSON.stringify(user_settings)
    navigator.clipboard.writeText(copyText)
    document.getElementById("debug-console").value += "User Settings copied to clipboard\n"
}


