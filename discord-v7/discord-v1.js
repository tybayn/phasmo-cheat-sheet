
let discord_user = {}

function getLink(){
    return new Promise((resolve, reject) => {
        try{
            znid = getCookie("znid")

            discord_user = JSON.parse(getCookie("discord_link"))
            document.getElementById("discord_avatar").src = `https://cdn.discordapp.com/avatars/${discord_user['id']}/${discord_user['avatar']}`
            $("#discord_avatar").addClass("avatar")
            document.getElementById("discord_name").innerText = discord_user['username']
            document.getElementById("discord_link_date").innerText = `Last Linked: ${discord_user['last_linked']}`
            $("#discord_link_date").removeClass("hidden")
            $("#discord_instructions").removeClass("hidden")
            document.getElementById("discord_note").innerText = "You have successfully linked your Discord account! In order for your stats to be most accurate, be sure to select the correct number of evidences and mark the correct ghost before hitting 'Save & Reset'"
            document.getElementById("discord_login_button").innerText = "Relink"
            $("#discord_unlink_button").removeClass("hidden")
            document.getElementById("reset").innerHTML = "Save & Reset<div class='reset_note'>(right click for more options)</div>"
            fetch(`https://zero-network.net/zn/${znid}/${discord_user['id']}`, {signal: AbortSignal.timeout(6000)})
            .then(data => data.json())
            .then(data => {
                var stats_info = `<strong>Total Games</strong>: ${data.total_games}<hr><div style="display:grid; grid-template-columns: 60%;">`

                stats_info += `<div class="discord-entry">Amateur: <span class="discord-num" style="float:right;">${data.hasOwnProperty('game_evidence') ? data['game_evidence']['3A'] || '0' : '0'}</span></div>`
                stats_info += `<div class="discord-entry">Intermediate: <span class="discord-num" style="float:right;">${data.hasOwnProperty('game_evidence') ? data['game_evidence']['3I'] || '0' : '0'}</span></div>`
                stats_info += `<div class="discord-entry">Professional: <span class="discord-num" style="float:right;">${data.hasOwnProperty('game_evidence') ? data['game_evidence']['3'] || '0' : '0'}</span></div>`
                stats_info += `<div class="discord-entry">Nightmare: <span class="discord-num" style="float:right;">${data.hasOwnProperty('game_evidence') ? data['game_evidence']['2'] || '0' : '0'}</span></div>`
                stats_info += `<div class="discord-entry">Insanity: <span class="discord-num" style="float:right;">${data.hasOwnProperty('game_evidence') ? data['game_evidence']['1'] || '0' : '0'}</span></div>`
                stats_info += `<div class="discord-entry">Apocalypse: <span class="discord-num" style="float:right;">${data.hasOwnProperty('game_evidence') ? data['game_evidence']['0'] || '0' : '0'}</span></div>`
                stats_info += `<div class="discord-entry">Custom: <span class="discord-num" style="float:right;">${data.hasOwnProperty('game_evidence') ? data['game_evidence']['-1'] || '0' : '0'}</span></div>`


                stats_info += '</div><br><strong>Ghosts</strong><hr><div style="display:grid; grid-template-columns: 50% 50%;">'
                for (const g in data['ghost_stats']){
                    stats_info += `<div class="discord-entry" style="${g == 'Unknown'?'color:#555;':''}">${g}: <span class="discord-num" style="float:right;">${data['ghost_stats'][g]}</span></div>`
                }
                stats_info += '</div>'

                document.getElementById("discord_stats").innerHTML = stats_info
                document.getElementById("discord-stats-link").href = `https://zero-network.net/phasmo-stats/?discord-id=${discord_user['id']}-${discord_user['avatar']}&username=${discord_user['username']}`
                document.getElementById("discord_link_status").className = "connected"
                
            })
            resolve("Discord Link Loaded")
            
        } catch(Error){
            resolve("Unable to Discord Link")
        }
    })
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