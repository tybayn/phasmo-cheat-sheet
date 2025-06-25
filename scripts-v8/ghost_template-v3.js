function titleCase(str) {
    return str.toLowerCase().split(' ').map(function (word) {
        return (word.charAt(0).toUpperCase() + word.slice(1));
    }).join(' ');
}

evi_color = {
    "EMF 5": "#db4d48",
    "DOTs": "#2ccc29",
    "Ultraviolet": "#ad8ce7",
    "Freezing": "#9ae0f7",
    "Ghost Orbs": "#dbd993",
    "Writing": "#4d8ce3",
    "Spirit Box": "#d18c5e", 
}

evi_icons = {
    "EMF 5": "imgs/emf5-icon.png",
    "DOTs": "imgs/dots-icon.png",
    "Ultraviolet": "imgs/fingerprints-icon.png",
    "Freezing": "imgs/freezing-icon.png",
    "Ghost Orbs": "imgs/orbs-icon.png",
    "Writing": "imgs/writing-icon.png",
    "Spirit Box": "imgs/spirit-box-icon.png", 
}

has_los_guide = [
    "The Twins",
    "Raiju",
    "Revenant",
    "Hantu",
    "Moroi",
    "Thaye",
    "The Mimic",
    "Deogen"
]

class Ghost {
    constructor(data,evidence){

        this.ghostTemplate = `
        <div class="ghost_card" id="${data.ghost}">
            <div class="ghost_name">${data.name}</div>
            <div class="ghost_hunt_info">
                <div class="ghost_hunt ${parseInt(data.hunt_sanity_high) > 50 ?'high':parseInt(data.hunt_sanity_high) < 50 ? 'low':'average'}">
                    <img src="imgs/sanity.png">
                    <div class="ghost_hunt_values">
                        ${parseInt(data.hunt_sanity_low) < parseInt(data.hunt_sanity) ? ('<div class="ghost_hunt_alt">' + data.hunt_sanity_low + '</div>') : ''}
                        <div>${data.hunt_sanity}</div>
                        ${parseInt(data.hunt_sanity_high) > parseInt(data.hunt_sanity) ? ('<div class="ghost_hunt_alt">' + data.hunt_sanity_high + '</div>') : ''}
                    </div>
                </div>
                <div class="ghost_speed">
                    <div class="footstep_los" onclick="openWikiPath('hunts.los.los-${has_los_guide.includes(data.ghost) ? data.ghost.toLowerCase().replace(' ','-') : 'std' }')">
                        <img src="imgs/${(+data.has_los) || data.ghost == 'The Mimic' ? 'los' : 'nlos'}.png" title="${(+data.has_los) || data.ghost == 'The Mimic' ? '{{has_los}}' : '{{not_los}}'}">
                        <img src="imgs/footsteps.png" style="filter: invert(1);">
                    </div>
                    <div class="ghost_speed_values">
                        ${this.toNumStr(data.min_speed)} <span class="ms">m/s</span> <span class="sound" onclick="toggleSound(${data.min_speed},'${data.ghost}0')">&#128266;</span>${data.max_speed == null ? '' : (+data.speed_is_range)?' - ':' | '}${data.max_speed == null ? '' : this.toNumStr(data.max_speed)+' <span class="ms">m/s</span> <span class="sound" onclick="toggleSound('+data.max_speed+',\''+data.ghost+'1\')">&#128266;</span>'}${data.alt_speed == null ? '' : '<br>('+this.toNumStr(data.alt_speed)+' <span class="ms">m/s</span> <span class="sound" onclick="toggleSound('+data.alt_speed+',\''+data.ghost+'2\')">&#128266;</span>)'}
                    </div>
                </div>
            </div>
            <div class="ghost_evidence">
                ${this.build_evidence_item(data.evidence[0],evidence[data.evidence[0]])}
                ${this.build_evidence_item(data.evidence[1],evidence[data.evidence[1]])}
                ${this.build_evidence_item(data.evidence[2],evidence[data.evidence[2]])}
                ${data.ghost == "The Mimic" ? this.build_evidence_item('Ghost Orbs',evidence['Ghost Orbs']) : ''}
            </div>
            <div class="ghost_nightmare_evidence">${data.nightmare_evidence?data.nightmare_evidence:''}</div>
            <div class="ghost_hunt_high">${data.hunt_sanity_high}</div>
            <div class="ghost_hunt_low">${data.hunt_sanity_low}</div>
            <div class="ghost_has_los">${+data.has_los}</div>

            <div class="ghost_behavior">
                <div class="ghost_tests_button" onClick="openGhostInfo('${data.ghost}')">{{0_evidence_tests}} >></div>
                ${this.behavior(data.wiki)}
            </div>
            <div class="ghost_clear">
                <img class="card_icon card_icon_select" title="{{select_ghost}}" src="imgs/select.png" onclick="select(this.parentElement.parentElement)">
                <img class="card_icon card_icon_guess" title="{{guess_ghost}}" style="display:none;" src="imgs/guess.png" onclick="guess(this.parentElement.parentElement)">
                <img class="card_icon card_icon_not" title="{{not_ghost}}" src="imgs/not.png" onclick="fade(this.parentElement.parentElement)" ondblclick="remove(this.parentElement.parentElement)">
                <img class="card_icon card_icon_died" title="{{died_to_ghost}}" style="display:none;" src="imgs/died.png" onclick="died(this.parentElement.parentElement)">
            </div>
            <div class="ghost_guesses"></div>
        </div>
        `

        this.wikiTemplate = `
        <div id="wiki-0-evidence-${data.ghost.replace(" ","-").toLowerCase()}" class="wiki_title accordian" onclick="accordian(this)"><div class="wiki_subtitle"><div class="wiki_crumb">&#9500;</div> ${data.name}</div></div>
        <div class="wiki_details" style="height: 0px;">
            <div class="text">
                <p><b>{{abilities_behaviors_tells}}</b></p>
                ${Object.keys(data.wiki).length > 0 ? this.build_tells(data.wiki["tells"],data.wiki["behaviors"],data.wiki["abilities"]) : ""}
                <p><b>{{confirmation_tests}}</b> †</p>
                ${Object.keys(data.wiki).length > 0 ? this.build_confirmation_tests(data.ghost,data.name,data.wiki["confirmation_tests"]) : ""}
                <p><b>{{elimination_tests}}</b></p>
                ${Object.keys(data.wiki).length > 0 ? this.build_elimination_tests(data.ghost,data.name,data.wiki["elimination_tests"]) : ""}
                <div class="wiki_details_note">
                    <i>{{use_bpm_finder}}</i>
                    <i>{{use_map_explorer}}</i>
                    <i style="opacity: 0.4; margin-top: 3px;">† {{mimic_disclaimer}}</i>
                </div>
            </div>
            <div onclick="generateWikiShareLink(this);" class="wiki-share">{{copy_share_link}} <img loading="lazy" src="imgs/share.png"></div>
        </div>
        `
    }

    build_evidence_item(evidence,evidence_name){
        return `<div class="ghost_evidence_item" ${evidence in evi_color ? 'style=\"color:' + evi_color[evidence] + ' !important;\"' : ''} name="${evidence}"><img src="${evi_icons[evidence]}">${evidence_name}</div>`
    }

    build_tells(tells,behavior,abilities){
        var data = "<ul>"

        for(var i in tells){
            if(tells[i]["is_0_evi"]){
                data += `<li><b>{{tell}}</b>: ${tells[i]["data"]}`
                if(tells[i].hasOwnProperty("note"))
                    data += `<br><i>{{note}}: ${tells[i]["note"]}</i>`
                data += "</li>"
            }
        }

        for(var i in behavior){
            if(behavior[i]["is_0_evi"]){
                data += `<li><b>{{behavior}}</b>: ${behavior[i]["data"]}</li>`
                if(behavior[i].hasOwnProperty("note"))
                    data += `<br><i>{{note}}: ${behavior[i]["note"]}</i>`
                data += "</li>"
            }
        }

        for(var i in abilities){
            if(abilities[i]["is_0_evi"]){
                data += `<li><b>{{ability}}</b>: ${abilities[i]["data"]}</li>`
                if(abilities[i].hasOwnProperty("note"))
                    data += `<br><i>{{note}}: ${abilities[i]["note"]}</i>`
                data += "</li>"
            }
        }

        data += "</ul>"
        return data
    }

    build_confirmation_tests(ghost,ghost_name,value){
        var data = "<ul>"

        if(value.length == 0){
            data += `<li class="non-definitive"><i>({{no_confirmation_tests,${ghost_name}}})</i></li>`
        }

        for(var i in value){
            data += `<li${value[i]["definitive"] ? "" : " class=\"non-definitive\""}><b>{{${value[i]["type"].toLowerCase().replace(' ','_')}}} (${value[i]["definitive"] ? "{{definitive}}" : "{{non_definitive}}"})</b>: ${value[i]["data"]}`

            if(value[i]["image"] != null){
                if(Array.isArray(value[i]["image"])){
                    value[i]["image"].forEach(img => {
                        data += `<br><img loading="lazy" class="zoomable" src="${img}" onclick="zoomImage(this)">`
                    });
                }
                else{
                    data += `<br><img loading="lazy" class="zoomable" src="${value[i]["image"]}" onclick="zoomImage(this${value[i].hasOwnProperty("subtitle") ? ",'"+value[i]['subtitle']+"'" : ""})">`
                }
            }

            if(value[i]["definitive"])
                data += `<div class="wiki_mark_ghost" onclick='select(document.getElementById("${ghost}"))'>&#x2714; {{mark_ghost}}</div>`
            
            data += `</li>`
        }

        data += "</ul>"
        return data
    }

    build_elimination_tests(ghost,ghost_name,value){
        var data = "<ul>"

        if(value.length == 0){
            data += `<li class="non-definitive"><i>({{no_elimination_tests,${ghost_name}}})</i></li>`
        }

        for(var i in value){
            data += `<li><b>{{${value[i]["type"].toLowerCase().replace(' ','_')}}}</b>: ${value[i]["data"]}`

            if(value[i]["image"] != null){
                if(Array.isArray(value[i]["image"])){
                    value[i]["image"].forEach(img => {
                        data += `<br><img loading="lazy" class="zoomable" src="${img}" onclick="zoomImage(this)">`
                    })
                }
                else{
                    data += `<br><img loading="lazy" class="zoomable" src="${value[i]["image"]}" onclick="zoomImage(this)">`
                }
            }

            data += `<div class="wiki_mark_ghost" onclick='fade(document.getElementById("${ghost}"))'>&#x2717; {{mark_ghost}}</div></li>`
        }

        data += "</ul>"
        return data
    }

    behavior(value){
        var msg = "<div class='ghost_behavior_item'>"
        var opened = false

        // Load Tells
        for(var s of ["tells","behaviors","abilities","hunt_sanity","hunt_speed","evidence"]){
            if(value[s] != null){
                opened = false
                for(var i = 0; i < value[s].length;i++){
                    if(value[s][i]["include_on_card"]){
                        if(i == 0){
                            opened = true
                            msg += `<div class='dtitle'><i>{{${(s)}}}</i><div class='ddash'></div></div><ul>`
                        }
                        msg += `<li>${value[s][i]["data"]}</li>`
                    }
                }
                if(opened)
                msg += "</ul>"
            }
        }

        msg += "</div>"
        return msg
    }

    toNumStr(num) { 
        let new_num = num
        if (Number.isInteger(new_num)) { 
          new_num += ".0"
        } else {
          new_num = new_num.toString(); 
        }

        return lang_currency.includes(lang) ? new_num.replace(".",",") : new_num
      }
}