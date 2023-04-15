
discord_user = {}

function checkLink(){
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
        fetch(`https://zero-network.net/zn/${znid}/attach/${discord_link['id']}`, {method:"POST",signal: AbortSignal.timeout(2000)})
        window.location.href = window.location.href.split("?")[0]
    }

}

function getLink(){

    try{
        znid = getCookie("znid")

        discord_user = JSON.parse(getCookie("discord_link"))
        document.getElementById("discord_avatar").src = `https://cdn.discordapp.com/avatars/${discord_user['id']}/${discord_user['avatar']}`
        $("#discord_avatar").addClass("avatar")
        document.getElementById("discord_name").innerText = discord_user['username']
        document.getElementById("discord_link_date").innerText = `Last Linked: ${discord_user['last_linked']}`
        $("#discord_link_date").removeClass("hidden")
        document.getElementById("discord_note").innerText = "You have successfully linked your Discord account! In order for your stats to be most accurate, be sure to select the correct number of evidences and mark the correct ghost before hitting 'Save & Reset'"
        document.getElementById("discord_login_button").innerText = "Relink"
        $("#discord_unlink_button").removeClass("hidden")
        document.getElementById("reset").innerText = "Save & Reset"
        fetch(`https://zero-network.net/zn/${znid}/${discord_user['id']}`, {signal: AbortSignal.timeout(2000)})
        .then(data => data.json())
        .then(data => {
            var stats_info = `<strong>Total Games</strong>: ${data.total_games}<hr><div style="display:grid; grid-template-columns: 60%;">`

            stats_info += `<div style="padding:0px 5px;">Professional: <span style="float:right;">${data['game_evidence']['3']}</span></div>`
            stats_info += `<div style="padding:0px 5px;">Nightmare: <span style="float:right;">${data['game_evidence']['2']}</span></div>`
            stats_info += `<div style="padding:0px 5px;">Insanity: <span style="float:right;">${data['game_evidence']['1']}</span></div>`
            stats_info += `<div style="padding:0px 5px;">Apocalypse: <span style="float:right;">${data['game_evidence']['0']}</span></div>`


            stats_info += '</div><br><strong>Ghosts</strong><hr><div style="display:grid; grid-template-columns: 50% 50%;">'
            for (const g in data['ghost_stats']){
                stats_info += `<div style="padding:0px 5px;${g == 'Unknown'?'color:#555;':''}">${g}: <span style="float:right;">${data['ghost_stats'][g]}</span></div>`
            }
            stats_info += '</div>'

            document.getElementById("discord_stats").innerHTML = stats_info
            document.getElementById("discord_link_status").className = "connected"
        })
        
    } catch(Error){
        // Om nom nom
    }
}

function discord_unlink(){
    discord_user = {}
    setCookie("discord_link",JSON.stringify(discord_link),-1)
    window.location.href = window.location.href.split("?")[0]
}