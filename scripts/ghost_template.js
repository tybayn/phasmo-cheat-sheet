class Ghost {
    constructor(data){

        for (var i = 0; i < data.behavior.length; i++){
            var assets = [...data.behavior[i].matchAll("\{[a-zA-Z0-9:/_.-]+\}")];
            for (var j = 0; j < assets.length; j++){
                var type = assets[j].toString().replace('{','').replace('}','').split(':')[0]
                var resource_path = assets[j].toString().replace('{','').replace('}','').split(':')[1]
                if (type == 'audio') {
                    data.behavior[i] = data.behavior[i].replace(assets[j],` <span class="sound" onClick="playSound('${resource_path}')">&#128266;</span>`)
                }
            }
        }

        this.ghostTemplate = `
        <div class="ghost_card" id="${data.ghost}">
                <div class="ghost_name">${data.ghost}</div>
                <div class="ghost_speed">${this.toNumStr(data.min_speed)} m/s <span class="sound" onclick="toggleSound(${data.min_speed},'${data.ghost}0')">&#128266;</span>${data.max_speed == null ? '' : data.speed_is_range?' - ':' | '}${data.max_speed == null ? '' : this.toNumStr(data.max_speed)+' m/s <span class="sound" onclick="toggleSound('+data.max_speed+',\''+data.ghost+'1\')">&#128266;</span>'}${data.alt_speed == null ? '' : '<br>('+this.toNumStr(data.alt_speed)+' m/s <span class="sound" onclick="toggleSound('+data.alt_speed+',\''+data.ghost+'2\')">&#128266;</span>)'}</div>
                <div class="ghost_hunt ${parseInt(data.hunt_sanity) > 50 ?'high':parseInt(data.hunt_sanity) < 50 ? 'low':'average'}">${data.hunt_sanity}</div>
                <div class="ghost_evidence">${data.evidence[0]} | ${data.evidence[1]} | ${data.evidence[2]}</div>
                <div class="ghost_behavior">
                   ${data.behavior.map(this.behavior).join('<hr>')}
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
        return '<div class="ghost_behavior_item">' + value + '</div>'
    }

    toNumStr(num) { 
        if (Number.isInteger(num)) { 
          return num + ".0"
        } else {
          return num.toString(); 
        }
      }
}