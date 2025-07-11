var lang = 'en'
var lang_data = null

// ----------------------------------

const lang_currency = [
    "de", "es", "fr", "pt-br", "tr"
]

const lang_menu_widths = {
    "en":{
        "left":"196px",
        "width":"168px",
        "maps":"calc(100% - 265px)",
        "menu_bottom":"-715px",
        "menu_bottom_custom":"-770px",
        "menu_height":"750px",
        "menu_height_custom":"805px"
    },
    "de":{
        "left":"240px",
        "width":"219px",
        "maps":"calc(100% - 309px)",
        "menu_bottom":"-660px",
        "menu_bottom_custom":"-715px",
        "menu_height":"695px",
        "menu_height_custom":"750px"
    },
    "fr":{
        "left":"230px",
        "width":"209px",
        "maps":"calc(100% - 299px)",
        "menu_bottom":"-660px",
        "menu_bottom_custom":"-715px",
        "menu_height":"695px",
        "menu_height_custom":"750px"
    },
    "es":{
        "left":"230px",
        "width":"209px",
        "maps":"calc(100% - 299px)",
        "menu_bottom":"-660px",
        "menu_bottom_custom":"-715px",
        "menu_height":"695px",
        "menu_height_custom":"750px"
    },
    "ko":{
        "left":"221px",
        "width":"193px",
        "maps":"calc(100% - 290px)",
        "menu_bottom":"-680px",
        "menu_bottom_custom":"-735px",
        "menu_height":"715px",
        "menu_height_custom":"770px"
    },
    "pt-br":{
        "left":"196px",
        "width":"168px",
        "maps":"calc(100% - 265px)",
        "menu_bottom":"-660px",
        "menu_bottom_custom":"-715px",
        "menu_height":"695px",
        "menu_height_custom":"750px"
    },
    "tr":{
        "left":"236px",
        "width":"208px",
        "maps":"calc(100% - 305px)",
        "menu_bottom":"-705px",
        "menu_bottom_custom":"-760px",
        "menu_height":"740px",
        "menu_height_custom":"795px"
    },
    "zh-cn":{
        "left":"221px",
        "width":"193px",
        "maps":"calc(100% - 290px)",
        "menu_bottom":"-695px",
        "menu_bottom_custom":"-745px",
        "menu_height":"725px",
        "menu_height_custom":"750px"
    }
}

// ----------------------------------

function loadCSS(filename) {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.type = "text/css";
    link.href = filename;
    link.onerror = () => console.error(`Failed to load CSS file: ${filename}`);
    document.head.appendChild(link);
}

function loadLanguage(){
    var new_lang = document.getElementById("language").value

    if(new_lang.includes("http")){
        window.location.href = new_lang
    }
    else{
        setTimeout(() => {
            window.location.href = `${window.location.href.split("?")[0]}?lang=${new_lang}`
        },100)
    }
}

function load_voice(){
    timer_snd = [
        new Audio(`assets/finish.mp3`),
        new Audio(`lang-v9/${lang}/assets/1.mp3`),
        new Audio(`lang-v9/${lang}/assets/2.mp3`),
        new Audio(`lang-v9/${lang}/assets/3.mp3`),
        new Audio(`lang-v9/${lang}/assets/4.mp3`),
        new Audio(`lang-v9/${lang}/assets/5.mp3`),
        new Audio(`lang-v9/${lang}/assets/spirit_smudge.mp3`),
        new Audio(`lang-v9/${lang}/assets/standard_smudge.mp3`),
        new Audio(`lang-v9/${lang}/assets/demon_smudge.mp3`),
        new Audio(`lang-v9/${lang}/assets/demon_cooldown.mp3`),
        new Audio(`lang-v9/${lang}/assets/standard_cooldown.mp3`),
        new Audio(`lang-v9/${lang}/assets/standard_hunt.mp3`),
        new Audio(`lang-v9/${lang}/assets/cursed_hunt.mp3`),
        new Audio('assets/start.mp3'),
        new Audio('assets/stop.mp3'),
        new Audio(`lang-v9/${lang}/assets/sound_cooldown.mp3`),
        new Audio(`lang-v9/${lang}/assets/myling_cooldown.mp3`)];
    timer_snd[0].preload = 'auto';
    timer_snd[1].preload = 'auto';
    timer_snd[2].preload = 'auto';
    timer_snd[3].preload = 'auto';
    timer_snd[4].preload = 'auto';
    timer_snd[5].preload = 'auto';
    timer_snd[6].preload = 'auto';
    timer_snd[7].preload = 'auto';
    timer_snd[8].preload = 'auto';
    timer_snd[9].preload = 'auto';
    timer_snd[10].preload = 'auto';
    timer_snd[11].preload = 'auto';
    timer_snd[12].preload = 'auto';
    timer_snd[13].preload = 'auto';
    timer_snd[14].preload = 'auto';
    timer_snd[15].preload = 'auto';
    timer_snd[16].preload = 'auto';
    timer_snd[0].load();
    timer_snd[1].load();
    timer_snd[2].load();
    timer_snd[3].load();
    timer_snd[4].load();
    timer_snd[5].load();
    timer_snd[6].load();
    timer_snd[7].load();
    timer_snd[8].load();
    timer_snd[9].load();
    timer_snd[10].load();
    timer_snd[11].load();
    timer_snd[12].load();
    timer_snd[13].load();
    timer_snd[14].load();
    timer_snd[15].load();
    timer_snd[16].load();
}

function load_translation(){
    return new Promise((resolve, reject) => {
        lang = getCookie("lang")
        if(!lang){
            lang = 'en'
        }
        fetch(`lang-v9/${lang}/data.json`)
        .then(data => data.json())
        .then(data => {
            lang_data = data
            loadCSS(`lang-v9/${lang}/override.css`)
            load_voice()
            resolve("Translation loaded")
        })
        .catch(err => {
            console.error(err)
            console.log(`${lang} is not yet supported!`)
            fetch(`lang-v9/en/data.json`)
            .then(data => data.json())
            .then(data => {
                lang = 'en'
                lang_data = data
                loadCSS(`lang-v9/en/override.css`)
                load_voice()
                resolve("Translation loaded")
            })
            .catch(err => {
                reject("Could not read translation")
            })
        })
    })
}

function convert_currency(content) {
    return content.replace(/\b(\d+)\.(\d+)\b/g, (match, p1, p2, offset, string) => {
        const before = string.slice(0, offset);
        const after = string.slice(offset + match.length);

        // Skip function call arguments or chained decimals
        if (/\b\w+\($/.test(before) || /\d\.\d*$/.test(before)) {
            return match;
        }

        if (/^\.\d/.test(after)) {
            return match;
        }

        // Skip if match is within a CSS style attribute or CSS block
        const styleAttrStart = string.lastIndexOf('style="', offset);
        const styleAttrEnd = string.indexOf('"', styleAttrStart + 7);
        if (styleAttrStart !== -1 && styleAttrEnd !== -1 && offset > styleAttrStart && offset < styleAttrEnd) {
            return match;
        }

        const styleAttrStart2 = string.lastIndexOf("style='", offset);
        const styleAttrEnd2 = string.indexOf("'", styleAttrStart2 + 7);
        if (styleAttrStart2 !== -1 && styleAttrEnd2 !== -1 && offset > styleAttrStart2 && offset < styleAttrEnd2) {
            return match;
        }

        return `${p1},${p2}`;
    });
}

function translate(to_lang){
    return new Promise((resolve, reject) => {
        let body = document.body.innerHTML
        fetch(`lang-v9/${to_lang}/data.json`)
        .then(data => data.json())
        .then(data => {
            body = body.replace(/{{([^{}]+)}}/g, (match,inner) => {
                let parts = inner.split(',')
                let baseKey = `{{${parts[0]}}}`
                let args = parts.slice(1)

                if(!(baseKey in data)) return match

                let value = data[baseKey]
                args.forEach((arg,i) => {
                    value = value.replace(new RegExp(`\\{${i}\\}`,'g'),arg)
                })
                return value
            })
            Object.entries(all_ghosts).forEach(([key,value]) => {
                body = body.replaceAll(`{{${key}}}`,value)
            })
            Object.entries(all_evidence).forEach(([key,value]) => {
                body = body.replaceAll(`{{${key}}}`,value)
            })
            document.body.innerHTML = body
            if(to_lang != "en")
                $(".vcs").hide()
            $("#page-loading").hide()
            lang = to_lang
            setCookie("lang",lang,90)
            lang_data = data
            resolve("Translation complete")
        })
    })
}

function translate_wiki(to_lang){
    return new Promise((resolve, reject) => {
        let body = document.body.innerHTML
        fetch(`lang-v9/${to_lang}/wiki.json`)
        .then(data => data.json())
        .then(data => {
            body = body.replace(/{{([^{}]+)}}/g, (match,inner) => {
                let parts = inner.split(',')
                let baseKey = `{{${parts[0]}}}`
                let args = parts.slice(1)

                if(!(baseKey in data)) return match

                let value = data[baseKey]
                args.forEach((arg,i) => {
                    value = value.replace(new RegExp(`\\{${i}\\}`,'g'),arg)
                })
                return value
            })
            document.body.innerHTML = lang_currency.includes(to_lang) ? convert_currency(body) : body
            resolve("Translation complete")
        })
        .catch(err => {
            console.log(err)
            reject("Could not translate")
        })
    })
}