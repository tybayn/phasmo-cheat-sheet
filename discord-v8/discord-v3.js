
let discord_user = {}

function getLink(){
    try{
        znid = getCookie("znid")

        discord_user = JSON.parse(getCookie("discord_link"))
        document.getElementById("discord_avatar").src = `https://cdn.discordapp.com/avatars/${discord_user['id']}/${discord_user['avatar']}`
        $("#discord_avatar").addClass("avatar")
        document.getElementById("discord_name").innerText = discord_user['username']
        document.getElementById("discord_link_date").innerText = `${lang_data['{{discord_link_h2}}']} ${discord_user['last_linked']}`
        $("#discord_link_date").removeClass("hidden")
        $("#discord_instructions").removeClass("hidden")
        document.getElementById("discord_note").innerHTML = `${lang_data['{{discord_link_h9}}']}<br><br>${lang_data['{{discord_link_p7}}']}`
        document.getElementById("discord_login_button").innerText = lang_data['{{discord_link_b3}}']
        $("#discord_unlink_button").removeClass("hidden")
        document.getElementById("reset").innerHTML = `${lang_data['{{save_and_reset}}']}<div class='reset_note'>(${lang_data['{{right_click_for_more}}']})</div>`
        fetch(`https://zero-network.net/zn/${znid}/${discord_user['id']}`, {signal: AbortSignal.timeout(6000)})
        .then(data => data.json())
        .then(data => {
            var stats_info = `<strong>${lang_data['{{discord_link_h3}}']}</strong> ${data.total_games}<hr><div class="discord-breakdown" style="display:grid; grid-template-columns: auto;">`

            stats_info += `<div class="discord-entry">${lang_data['{{amateur}}']}: <span class="discord-num" style="float:right;">${data.hasOwnProperty('game_evidence') ? data['game_evidence']['3A'] || '0' : '0'}</span></div>`
            stats_info += `<div class="discord-entry">${lang_data['{{intermediate}}']}: <span class="discord-num" style="float:right;">${data.hasOwnProperty('game_evidence') ? data['game_evidence']['3I'] || '0' : '0'}</span></div>`
            stats_info += `<div class="discord-entry">${lang_data['{{professional}}']}: <span class="discord-num" style="float:right;">${data.hasOwnProperty('game_evidence') ? data['game_evidence']['3'] || '0' : '0'}</span></div>`
            stats_info += `<div class="discord-entry">${lang_data['{{nightmare}}']}: <span class="discord-num" style="float:right;">${data.hasOwnProperty('game_evidence') ? data['game_evidence']['2'] || '0' : '0'}</span></div>`
            stats_info += `<div class="discord-entry">${lang_data['{{insanity}}']}: <span class="discord-num" style="float:right;">${data.hasOwnProperty('game_evidence') ? data['game_evidence']['1'] || '0' : '0'}</span></div>`
            stats_info += `<div class="discord-entry">${lang_data['{{apocalypse_iii}}']}: <span class="discord-num" style="float:right;">${data.hasOwnProperty('game_evidence') ? data['game_evidence']['0'] || '0' : '0'}</span></div>`
            stats_info += `<div class="discord-entry">${lang_data['{{custom}}']}: <span class="discord-num" style="float:right;">${data.hasOwnProperty('game_evidence') ? data['game_evidence']['-1'] || '0' : '0'}</span></div>`
            stats_info += `<div class="discord-entry">${lang_data['{{weekly_challenge}}']}: <span class="discord-num" style="float:right;">${data.hasOwnProperty('game_evidence') ? data['game_evidence']['-5'] || '0' : '0'}</span></div>`


            stats_info += `</div><br><strong>${lang_data['{{discord_link_h4}}']}</strong><hr><div class="discord-ghost-breakdown" style="display:grid; grid-template-columns: 50% 50%;">`
            for (const g in data['ghost_stats']){
                stats_info += `<div class="discord-entry" style="${g == 'Unknown'?'color:#555;':''}">${all_ghosts[g]}: <span class="discord-num" style="float:right;">${data['ghost_stats'][g]}</span></div>`
            }
            stats_info += '</div>'

            document.getElementById("discord_stats").innerHTML = stats_info
            document.getElementById("discord-stats-link").href = `https://zero-network.net/phasmo-stats/?discord-id=${discord_user['id']}-${discord_user['avatar']}&username=${discord_user['username']}`
            document.getElementById("discord_link_status").className = "connected"
        })
        
    } catch(Error){
        
    }
}

function applyPerms(){
    return new Promise((resolve, reject) => {
        if(Object.keys(discord_user).length > 0){
            $('.card_icon_guess').show()
            $('.card_icon_died').show()
            $('.discord_voice_commands').show()
        }
        resolve("Discord Link Permissions Applied")
    })
}

function discord_unlink(){
    discord_user = {}
    setCookie("discord_link",JSON.stringify(discord_link),-1)
    window.location.href = window.location.href.split("?")[0]
}