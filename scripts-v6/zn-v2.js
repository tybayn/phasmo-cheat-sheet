function getCookie(e){let t=e+"=",i=decodeURIComponent(document.cookie).split(";");for(let n=0;n<i.length;n++){let o=i[n];for(;" "==o.charAt(0);)o=o.substring(1);if(0==o.indexOf(t))return o.substring(t.length,o.length)}return""}
function setCookie(e,t,i){let n=new Date;n.setTime(n.getTime()+864e5*i);let o="expires="+n.toUTCString();document.cookie=e+"="+t+";"+o+";path=/"}

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
            window.location.href = window.location.href.split("?")[0]
        }

        if (params.get('journal')){
            setCookie("room_id",params.get('journal'),1)
            window.location.href = window.location.href.split("?")[0]
        }

        if (params.get('lang')){
            lang = params.get('lang').toLowerCase()
            if (["tr","fr","ru","de","pl"].includes(lang)){
                window.location.href = `https://tybayn.github.io/phasmo-cheat-sheet-${lang}/`
            }
            else{
                console.log("Hey! That language is not yet officially supported by the Zero-Network. If you would like to help translate the website, find me (SeverelyZero) on the Zero-Network Discord: https://discord.gg/afpvC7Bf7Y")
            }
        }

        if (params.get("debug") == "true"){
            startDebugMode()
            $("#debug_tab").show()
        }

        resolve("URL parsed")
    })
}

function loadLanguage(){
    var lang_url = document.getElementById("language").value
    window.location.href = lang_url
}

function heartbeat(){
    if(znid != "no-connection-to-server"){
        state['settings'] = JSON.stringify(user_settings)
        fetch("https://zero-network.net/zn/"+znid,{method:"POST",Accept:"application/json",body:JSON.stringify(state),signal: AbortSignal.timeout(10000)})
        .then(response => response.json())
        .then(data => {
            $("#active-users-label").text("Active Users: " + data['active_num_users'])
        })
        .catch(response => {
            $("#active-users-label").text("Active Users: -")
        });
    }
    else {
        $("#active-users-label").text("Active Users: -")
    }
}

function loadAllAndConnect(){
    let loadZN = new Promise((resolve, reject) => {
        znid = getCookie("znid")
        if(znid && znid!="no-connection-to-server"){
            getLink()
            .then(x => {
                $("#session").text(znid)
                try {
                    heartbeat()
                } catch (error){
                    console.warn("Possible latency issues!")
                }
                if(znid!="no-connection-to-server"){
                    $('#room_id').val("")
                    $('#room_id').css('color',"#CCC")
                    $('#room_id').prop('disabled',false)
                    $('#room_id_create').show()
                    $('#room_id_link').show()
                    $('#link_id_create').show()
                    mquery = window.matchMedia("screen and (pointer: coarse) and (max-device-width: 600px)")
                    if(!mquery.matches)
                        $('#link_id_create_launch').show()
                }
                else{
                    $('#room_id').val("Can't Connect!")
                    $('#link_id').val("Can't Connect!")
                }
                resolve("Loaded existing session")
            })
        }
        else{
            var id;
            try{
                id = JSON.parse(getCookie("discord_link"))['id'];
            } catch(Error) {
                id = false;
            }
            fetch(`https://zero-network.net/zn/${id ? '?discord_id='+id : ''}`,{headers:{Accept:"application/json"},signal: AbortSignal.timeout(10000)})
            .then(e=>e.json())
            .then(e => {
                znid = e.znid
                setCookie("znid",e.znid,1)
                getLink()
                $("#session").text(e.znid)
                try {
                    heartbeat()
                } catch (error){
                    console.warn("Possible latency issues!")
                }
                $('#room_id').val("")
                $('#room_id').css('color',"#CCC")
                $('#room_id').prop('disabled',false)
                $('#room_id_create').show()
                $('#room_id_link').show()
                $('#link_id_create').show()
                mquery = window.matchMedia("screen and (pointer: coarse) and (max-device-width: 600px)")
                if(!mquery.matches)
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
                reject("Unable to connect")
            })
        }
    })

    let loadData = new Promise((resolve, reject) => {
        fetch("https://zero-network.net/phasmophobia/data/ghosts.json", {signal: AbortSignal.timeout(6000)})
        .then(data => data.json())
        .then(data => {

            all_ghosts = data.ghosts.map(a => a.ghost)
            all_evidence = data.evidence

            var cards = document.getElementById('cards')
            var wiki = document.getElementById('wiki-0-evidence-data')
            var cur_version = document.getElementById('current-version-label')
            var evidence_list = document.getElementById('evidence')

    
            evidence_list.innerHTML = "";
            for(var i = 0; i < data.evidence.length; i++){
                evidence_list.innerHTML += `
                <div class="evidence-row">
                    <img class="monkey-smudge" style="display:none;" src="imgs/smudge.png">
                    <button id="${data.evidence[i]}" class="tricheck white" name="evidence" onclick="tristate(this)" value="${data.evidence[i]}">
                        <div id="checkbox" class="neutral"><span class="icon"></span></div>
                        <div class="label">${data.evidence[i]}</div>
                    </button>
                    <img class="monkey-paw-select" src="imgs/paw-icon.png" onclick="monkeyPawFilter(this)">
                </div>
                `
            }
    
            cards.innerHTML = "";
            wiki.innerHTML = "";
            for(var i = 0; i < data.ghosts.length; i++){
                bpm_speeds.add(data.ghosts[i].min_speed)
                if(data.ghosts[i].max_speed != null){bpm_speeds.add(data.ghosts[i].max_speed)}
                if(data.ghosts[i].alt_speed != null){bpm_speeds.add(data.ghosts[i].alt_speed)}
                var ghost = new Ghost(data.ghosts[i]);
                cards.innerHTML += `${ghost.ghostTemplate}`
                wiki.innerHTML += (i == data.ghosts.length-1 ? `${ghost.wikiTemplate.replace("&#9500;","&#9492;")}` : `${ghost.wikiTemplate}`)
            }
            cur_version.innerHTML = `${data.version}`
            
        })
        .then(data => {
            var raw_state = getCookie("state")

            if (!raw_state || raw_state == '' || raw_state == null){
                console.log("No State found")
                for (var i = 0; i < all_evidence.length; i++){
                    state["evidence"][all_evidence[i]] = 0
                }
                for (var i = 0; i < all_ghosts.length; i++){
                    state["ghosts"][all_ghosts[i]] = 1
                }

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

            if (state['los'] == 1){
                tristate(document.getElementById("LOS"));
            }
            else if (state['los'] == 0){
                tristate(document.getElementById("LOS"));
                tristate(document.getElementById("LOS"));
            }

            filter(true)

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
            loadSettings()
            filter(true)
        })
        .then(data => {
            resolve("Ghost data loaded")
        })
        .catch(error => {
            console.error(error)
    
            fetch("backup-data/ghosts_backup.json")
            .then(data => data.json())
            .then(data => {

                all_ghosts = data.ghosts.map(a => a.ghost)
                all_evidence = data.evidence
            
                var cards = document.getElementById('cards')
                var wiki = document.getElementById('wiki-0-evidence-data')
                var cur_version = document.getElementById('current-version-label')
                var evidence_list = document.getElementById('evidence')
    
                evidence_list.innerHTML = "";
                for(var i = 0; i < data.evidence.length; i++){
                    evidence_list.innerHTML += `
                    <div class="evidence-row">
                        <img class="monkey-smudge" style="display:none;" src="imgs/smudge.png">
                        <button id="${data.evidence[i]}" class="tricheck white" name="evidence" onclick="tristate(this)" value="${data.evidence[i]}">
                            <div id="checkbox" class="neutral"><span class="icon"></span></div>
                            <div class="label">${data.evidence[i]}</div>
                        </button>
                        <img class="monkey-paw-select" src="imgs/paw-icon.png" onclick="monkeyPawFilter(this)">
                    </div>
                    `
                }
                cards.innerHTML = "";
                wiki.innerHTML = "";
                for(var i = 0; i < data.ghosts.length; i++){
                    var ghost = new Ghost(data.ghosts[i]);
                    cards.innerHTML += `${ghost.ghostTemplate}`
                    wiki.innerHTML += (i == data.ghosts.length-1 ? `${ghost.wikiTemplate.replace("&#9500;","&#9492;")}` : `${ghost.wikiTemplate}`)
                }
                cur_version.innerHTML = `${data.version}`
                loadSettings()
                filter()
            })
            .then(data => {
                resolve("Backup ghost data loaded")
            })
        })
    })

    let loadMaps = new Promise((resolve, reject) => {
        fetch("https://zero-network.net/phasmophobia/data/maps", {signal: AbortSignal.timeout(6000)})
        .then(data => data.json())
        .then(data => {
            var map_html = ""
            var first = true
            for(var i = 0; i < data.length; i++) {
                all_maps[data[i]['div_id']] = data[i]['file_url']
                map_html += `<button class="maps_button${first ? " selected_map" : ""}" id="${data[i]['div_id']}" onclick="changeMap(this,'${data[i]['file_url']}');saveSettings();"><div class="map_size ${data[i]['size'].toLowerCase()}">${data[i]['size']}</div>${data[i]['name']}</button>`
                first = false
            }
            $("#maps_list").html(map_html)

            resolve("Map data loaded")
        })
        .catch(error => {
            reject("Failed to load map data")
        })

    })

    let loadLanguages = new Promise((resolve, reject) => {
        fetch("https://zero-network.net/phasmophobia/languages", {signal: AbortSignal.timeout(6000)})
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
            reject("Failed to load language data")
        })

    })
    
    Promise.all([loadZN,loadData,loadMaps,loadLanguages])
    .then(x => {
        applyPerms()
        auto_link()
        openWikiFromURL()
    })
}


