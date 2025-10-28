
let data_user = {}
let custom_difficulties = {}

function getLink(){
    return new Promise((resolve, reject) => {
        try{
            znid = getCookie("znid")

            let legacy = getCookie("discord_link")
            if (legacy != ''){
                legacy = JSON.parse(legacy)
                legacy['type'] = 'discord'
                setCookie("data_link", JSON.stringify(legacy), 30)
                setCookie("discord_link","",-1)
            }

            data_user = JSON.parse(getCookie("data_link"))
            if(data_user.type == 'discord'){
                document.getElementById("data_avatar").src = `https://cdn.discordapp.com/avatars/${data_user['id']}/${data_user['avatar']}`
                $("#login_type_icon").attr("src","https://cdn.simpleicons.org/discord/white")
            }
            else{
                document.getElementById("data_avatar").src = `${data_user['avatar']}`
                $("#login_type_icon").attr("src","https://cdn.simpleicons.org/twitch/white")
            }

            document.getElementById("data_link_tab_label").innerText = lang_data['{{data_link}}']
            $("#login_type_icon").show()
            $("#data_pre_login").hide()
            $("#data_avatar").addClass("avatar")
            document.getElementById("data_name").innerText = data_user['username']
            document.getElementById("data_link_date").innerText = `${lang_data['{{data_link_h2}}']} ${data_user['last_linked']}`
            $("#data_link_date").removeClass("hidden")
            $("#data_instructions").removeClass("hidden")
            document.getElementById("data_note").innerHTML = `${lang_data['{{data_link_h9}}']}<br><br>${lang_data['{{data_link_p7}}']}`
            $("#data_unlink_button").removeClass("hidden")
            document.getElementById("reset").innerHTML = `${lang_data['{{save_and_reset}}']}<div class='reset_note'>(${lang_data['{{right_click_for_more}}']})</div>`
            fetch(`https://zero-network.net/zn/${znid}/${data_user['id']}`, {signal: AbortSignal.timeout(6000)})
            .then(data => data.json())
            .then(data => {
                var stats_info = `<strong>${lang_data['{{data_link_h3}}']}</strong> ${data.total_games}<hr><div class="data-breakdown" style="display:grid; grid-template-columns: auto;">`

                stats_info += `<div class="data-entry">${lang_data['{{amateur}}']}: <span class="data-num" style="float:right;">${data.hasOwnProperty('game_evidence') ? data['game_evidence']['3A'] || '0' : '0'}</span></div>`
                stats_info += `<div class="data-entry">${lang_data['{{intermediate}}']}: <span class="data-num" style="float:right;">${data.hasOwnProperty('game_evidence') ? data['game_evidence']['3I'] || '0' : '0'}</span></div>`
                stats_info += `<div class="data-entry">${lang_data['{{professional}}']}: <span class="data-num" style="float:right;">${data.hasOwnProperty('game_evidence') ? data['game_evidence']['3'] || '0' : '0'}</span></div>`
                stats_info += `<div class="data-entry">${lang_data['{{nightmare}}']}: <span class="data-num" style="float:right;">${data.hasOwnProperty('game_evidence') ? data['game_evidence']['2'] || '0' : '0'}</span></div>`
                stats_info += `<div class="data-entry">${lang_data['{{insanity}}']}: <span class="data-num" style="float:right;">${data.hasOwnProperty('game_evidence') ? data['game_evidence']['1'] || '0' : '0'}</span></div>`
                stats_info += `<div class="data-entry">${lang_data['{{apocalypse_iii}}']}: <span class="data-num" style="float:right;">${data.hasOwnProperty('game_evidence') ? data['game_evidence']['0'] || '0' : '0'}</span></div>`
                stats_info += `<div class="data-entry">${lang_data['{{custom}}']}: <span class="data-num" style="float:right;">${data.hasOwnProperty('game_evidence') ? data['game_evidence']['-1'] || '0' : '0'}</span></div>`
                stats_info += `<div class="data-entry">${lang_data['{{weekly_challenge}}']}: <span class="data-num" style="float:right;">${data.hasOwnProperty('game_evidence') ? data['game_evidence']['-5'] || '0' : '0'}</span></div>`


                stats_info += `</div><br><strong>${lang_data['{{data_link_h4}}']}</strong><hr><div class="data-ghost-breakdown" style="display:grid; grid-template-columns: 50% 50%;">`
                for (const g in data['ghost_stats']){
                    stats_info += `<div class="data-entry" style="${g == 'Unknown'?'color:#555;':''}">${all_ghosts[g]}: <span class="data-num" style="float:right;">${data['ghost_stats'][g]}</span></div>`
                }
                stats_info += '</div>'

                document.getElementById("data_stats").innerHTML = stats_info
                document.getElementById("data-stats-link").href = `https://zero-network.net/phasmo-stats/?data-id=${data_user['id']}&avatar=${data_user['type'] == 'discord' ? ('https://cdn.discordapp.com/avatars/'+data_user['id']+'/'+data_user['avatar']) : data_user['avatar']}&username=${data_user['username']}`
                document.getElementById("data_link_status").className = "connected"

                if($("#num_evidence option[value='sep3']").length === 0){
                    var cust_settings = JSON.parse(getCookie("settings"))

                    fetch(`https://zero-network.net/zn/difficulties/${data_user['id']}?cheatsheet=true`, {signal: AbortSignal.timeout(6000)})
                    .then(data => data.json())
                    .then(data => {
                        custom_difficulties = data

                        $(`#num_evidence option[value='-10']`).remove();
                        $(`#num_evidence option[value='sep2']`).remove();

                        let presets = document.getElementById("num_evidence")
                        var opt = document.createElement('option');
                        opt.value = "sep2";
                        opt.innerHTML = "---My Customs---"
                        opt.disabled = true
                        presets.appendChild(opt)
                        Object.entries(data).forEach(([id,value]) => {
                            opt = document.createElement('option');
                            opt.value = id;
                            opt.innerHTML = value.name;
                            presets.appendChild(opt);
                        })
                        opt = document.createElement('option');
                        opt.value = "sep3";
                        opt.innerHTML = "----------------"
                        opt.disabled = true
                        presets.appendChild(opt)
                        opt = document.createElement('option');
                        opt.value = "-10";
                        opt.innerHTML = "Go to Difficulty Builder >>";
                        presets.appendChild(opt);

                        document.getElementById("num_evidence").value = cust_settings.num_evidences
                    })
                    .then(data => {
                        checkDifficulty();
                        showCustom();
                        updateMapDifficulty(cust_settings.num_evidences);
                        filter();
                        flashMode();
                        resolve("User logged in")
                    })
                }
                else{
                    resolve("User already logged in")
                }
            })
            
        } catch(Error){
            resolve("User not logged in")
        }
    })
}

function applyPerms(){
    return new Promise((resolve, reject) => {
        if(Object.keys(data_user).length > 0){
            $('.card_icon_guess').show()
            $('.card_icon_died').show()
            $('.data_voice_commands').show()
        }
        resolve("Data Link Permissions Applied")
    })
}

function data_unlink(){
    data_user = {}
    setCookie("data_link","",-1)
    window.location.href = window.location.href.split("?")[0]
}