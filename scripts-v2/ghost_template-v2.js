evi_color = {
    "EMF 5": "#db4d48",
    "DOTs": "#2ccc29",
    "Fingerprints": "#ad8ce7",
    "Freezing": "#9ae0f7",
    "Ghost Orbs": "#dbd993",
    "Writing": "#4d8ce3",
    "Spirit Box": "#d18c5e", 
}

evi_icons = {
    "EMF 5": "imgs/emf5-icon.png",
    "DOTs": "imgs/dots-icon.png",
    "Fingerprints": "imgs/fingerprints-icon.png",
    "Freezing": "imgs/freezing-icon.png",
    "Ghost Orbs": "imgs/orbs-icon.png",
    "Writing": "imgs/writing-icon.png",
    "Spirit Box": "imgs/spirit-box-icon.png", 
}

behavior_titles = {
    "<Tells>":"<div class='dtitle'><i>Tells</i><div class='ddash'></div></div>",
    "<Behaviors>":"<div class='dtitle'><i>Behaviors</i><div class='ddash'></div></div>",
    "<Hunt Sanity>":"<div class='dtitle'><i>Hunt Sanity</i><div class='ddash'></div></div>",
    "<Hunt Speed>":"<div class='dtitle'><i>Hunt Speed</i><div class='ddash'></div></div>",
    "<Evidence>":"<div class='dtitle'><i>Evidence</i><div class='ddash'></div></div>"
}

class Ghost {
    constructor(data){

        for (var i = 0; i < data.behavior.length; i++){
            var assets = [...data.behavior[i].matchAll("\{[a-zA-Z0-9:/_.-]+\}")];
            for (var j = 0; j < assets.length; j++){
                var type = assets[j].toString().replace('{','').replace('}','').split(':')[0]
                var resource_path = assets[j].toString().replace('{','').replace('}','').split(':')[1]
                if (type == 'audio') {
                    data.behavior[i] = data.behavior[i].replace(assets[j],` <span class="sound" onClick="playSound('https://zero-network.net/phasmophobia/static/${resource_path}')">&#128266;</span>`)
                }
            }
        }

        this.ghostTemplate = `
        <div class="ghost_card" id="${data.ghost}">
                <div class="ghost_name">${data.ghost}</div>
                <div class="ghost_hunt_info">
                    <div class="ghost_hunt ${parseInt(data.hunt_sanity) > 50 ?'high':parseInt(data.hunt_sanity) < 50 ? 'low':'average'}"><img src="imgs/sanity.png">${data.hunt_sanity}</div>
                    <div class="ghost_speed">
                        <img src="imgs/footsteps.png">
                        <div class="ghost_speed_values">
                            ${this.toNumStr(data.min_speed)} <span class="ms">m/s</span> <span class="sound" onclick="toggleSound(${data.min_speed},'${data.ghost}0')">&#128266;</span>${data.max_speed == null ? '' : data.speed_is_range?' - ':' | '}${data.max_speed == null ? '' : this.toNumStr(data.max_speed)+' <span class="ms">m/s</span> <span class="sound" onclick="toggleSound('+data.max_speed+',\''+data.ghost+'1\')">&#128266;</span>'}${data.alt_speed == null ? '' : '<br>('+this.toNumStr(data.alt_speed)+' <span class="ms">m/s</span> <span class="sound" onclick="toggleSound('+data.alt_speed+',\''+data.ghost+'2\')">&#128266;</span>)'}
                        </div>
                    </div>
                </div>
                <div class="ghost_evidence">
                    <div class="ghost_evidence_item" ${data.evidence[0] in evi_color ? 'style=\"color:' + evi_color[data.evidence[0]] + ' !important;\"' : ''}><img src="${evi_icons[data.evidence[0]]}">${data.evidence[0]}</div>
                    <div class="ghost_evidence_item" ${data.evidence[1] in evi_color ? 'style=\"color:' + evi_color[data.evidence[1]] + ' !important;\"' : ''}><img src="${evi_icons[data.evidence[1]]}">${data.evidence[1]}</div>
                    <div class="ghost_evidence_item" ${data.evidence[2] in evi_color ? 'style=\"color:' + evi_color[data.evidence[2]] + ' !important;\"' : ''}><img src="${evi_icons[data.evidence[2]]}">${data.evidence[2]}</div>
                </div>
                <div class="ghost_nightmare_evidence">${data.nightmare_evidence?data.nightmare_evidence:''}</div>
                <div class="ghost_behavior">
                   ${this.behavior(data.behavior)}
                </div>
                <div class="ghost_clear">
                    <span class="check" onclick="select(this.parentElement.parentElement)"></span>
                    <span class="space"></span>
                    <span class="icon" onclick="fade(this.parentElement.parentElement)" ondblclick="remove(this.parentElement.parentElement)"></span>
                </div>
            </div>
        `
    }

    behavior(value){
        var opened = false
        var msg = "<div class='ghost_behavior_item'>"

        for (var i = 0; i < value.length; i++){
            if (behavior_titles.hasOwnProperty(value[i])){
                if(opened){
                    msg += `</ul>${behavior_titles[value[i]]}<ul>`
                }
                else {
                    msg += `${behavior_titles[value[i]]}<ul>`
                    opened = true
                }
            }
            else{
                msg += `<li>${value[i]}</li>`
            }
        }
        msg += "</ul></div>"
        return msg
    }

    toNumStr(num) { 
        if (Number.isInteger(num)) { 
          return num + ".0"
        } else {
          return num.toString(); 
        }
      }
}