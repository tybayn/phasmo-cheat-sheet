function getCookie(e){let t=e+"=",i=decodeURIComponent(document.cookie).split(";");for(let n=0;n<i.length;n++){let o=i[n];for(;" "==o.charAt(0);)o=o.substring(1);if(0==o.indexOf(t))return o.substring(t.length,o.length)}return""}
function setCookie(e,t,i){let n=new Date;n.setTime(n.getTime()+864e5*i);let o="expires="+n.toUTCString();document.cookie=e+"="+t+";"+o+";path=/"}

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
            loadSettings()
    
            var cards = document.getElementById('cards')
            var cur_version = document.getElementById('current-version-label')
            var evidence_list = document.getElementById('evidence')
    
            evidence_list.innerHTML = "";
            for(var i = 0; i < data.evidence.length; i++){
                evidence_list.innerHTML += `
                <div class="evidence-row">
                    <img class="monkey-smudge" style="display:none;" src="imgs/smudge.png">
                    <button id="${data.evidence[i]}" class="tricheck white" name="evidence" onclick="tristate(this);autoSelect()" value="${data.evidence[i]}">
                        <div id="checkbox" class="neutral"><span class="icon"></span></div>
                        <div class="label">${data.evidence[i]}</div>
                    </button>
                    <img class="monkey-paw-select" src="imgs/paw-icon.png" onclick="monkeyPawFilter(this);autoSelect()">
                </div>
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
                    fade(document.getElementById(key), true, true);
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
            }
            for (const [key, value] of Object.entries(start_state["evidence"])){ 
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
            for (const [key, value] of Object.entries(start_state["speed"])){ 
                if (value == 1){
                    $("#"+key)[0].click();
                }
            }
            for (const [key, value] of Object.entries(start_state["sanity"])){ 
                if (value == 1){
                    $("#"+key)[0].click();
                }
            }
            
            loadSettings()
            filter()
    
        })
        .then(data => {
            resolve("Ghost data loaded")
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
                    <div class="evidence-row">
                        <img class="monkey-smudge" style="display:none;" src="imgs/smudge.png">
                        <button id="${data.evidence[i]}" class="tricheck white" name="evidence" onclick="tristate(this);autoSelect()" value="${data.evidence[i]}">
                            <div id="checkbox" class="neutral"><span class="icon"></span></div>
                            <div class="label">${data.evidence[i]}</div>
                        </button>
                        <img class="monkey-paw-select" src="imgs/paw-icon.png" onclick="monkeyPawFilter(this);autoSelect()">
                    </div>
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
            .then(data => {
                resolve("Backup ghost data loaded")
            })
        })
    })

    
    Promise.all([loadZN,loadData])
    .then(x => {
        applyPerms()
        auto_link()
    })
}


