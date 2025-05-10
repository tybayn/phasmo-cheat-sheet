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
        "menu_bottom":"-585px",
        "menu_bottom_custom":"-640px",
        "menu_height":"620px",
        "menu_height_custom":"675px"
    },
    "de":{
        "left":"240px",
        "width":"219px",
        "maps":"calc(100% - 309px)",
        "menu_bottom":"-610px",
        "menu_bottom_custom":"-665px",
        "menu_height":"645px",
        "menu_height_custom":"700px"
    },
    "fr":{
        "left":"230px",
        "width":"209px",
        "maps":"calc(100% - 299px)",
        "menu_bottom":"-585px",
        "menu_bottom_custom":"-640px",
        "menu_height":"620px",
        "menu_height_custom":"675px"
    },
    "es":{
        "left":"230px",
        "width":"209px",
        "maps":"calc(100% - 299px)",
        "menu_bottom":"-585px",
        "menu_bottom_custom":"-640px",
        "menu_height":"620px",
        "menu_height_custom":"675px"
    },
    "ko":{
        "left":"221px",
        "width":"193px",
        "maps":"calc(100% - 290px)",
        "menu_bottom":"-635px",
        "menu_bottom_custom":"-690px",
        "menu_height":"670px",
        "menu_height_custom":"725px"
    },
    "pt-br":{
        "left":"196px",
        "width":"168px",
        "maps":"calc(100% - 265px)",
        "menu_bottom":"-625px",
        "menu_bottom_custom":"-680px",
        "menu_height":"660px",
        "menu_height_custom":"715px"
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
        new Audio(`lang-v8/${lang}/assets/1.mp3`),
        new Audio(`lang-v8/${lang}/assets/2.mp3`),
        new Audio(`lang-v8/${lang}/assets/3.mp3`),
        new Audio(`lang-v8/${lang}/assets/4.mp3`),
        new Audio(`lang-v8/${lang}/assets/5.mp3`),
        new Audio(`lang-v8/${lang}/assets/spirit_smudge.mp3`),
        new Audio(`lang-v8/${lang}/assets/standard_smudge.mp3`),
        new Audio(`lang-v8/${lang}/assets/demon_smudge.mp3`),
        new Audio(`lang-v8/${lang}/assets/demon_cooldown.mp3`),
        new Audio(`lang-v8/${lang}/assets/standard_cooldown.mp3`),
        new Audio(`lang-v8/${lang}/assets/standard_hunt.mp3`),
        new Audio(`lang-v8/${lang}/assets/cursed_hunt.mp3`),
        new Audio('assets/start.mp3'),
        new Audio('assets/stop.mp3')];
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
}

function load_translation(){
    return new Promise((resolve, reject) => {
        lang = getCookie("lang")
        if(!lang){
            lang = 'en'
        }
        fetch(`lang-v8/${lang}/data.json`)
        .then(data => data.json())
        .then(data => {
            lang_data = data
            loadCSS(`lang-v8/${lang}/override.css`)
            load_voice()
            resolve("Translation loaded")
        })
        .catch(err => {
            console.error(err)
            console.log(`${lang} is not yet supported!`)
            fetch(`lang-v8/en/data.json`)
            .then(data => data.json())
            .then(data => {
                lang = 'en'
                lang_data = data
                loadCSS(`lang-v8/en/override.css`)
                load_voice()
                resolve("Translation loaded")
            })
            .catch(err => {
                reject("Could not read translation")
            })
        })
    })
}

function convert_currency(content){
    return content.replace(/\b(\d+)\.(\d+)\b/g, (match, p1, p2, offset, string) => {
        const before = string.slice(0, offset);
        if (/\b\w+\($/.test(before) || /\d\.\d*$/.test(before)) {
            return match;
        }

        const after = string.slice(offset + match.length);
        if (/^\.\d/.test(after)) {
            return match;
        }

        return `${p1},${p2}`;
    });
    
}

function translate(to_lang){
    return new Promise((resolve, reject) => {
        let body = document.body.innerHTML
        fetch(`lang-v8/${to_lang}/data.json`)
        .then(data => data.json())
        .then(data => {
            Object.entries(data).forEach(([key,value]) => {
                body = body.replaceAll(key,value)
            })
            Object.entries(all_ghosts).forEach(([key,value]) => {
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
        fetch(`lang-v8/${to_lang}/wiki.json`)
        .then(data => data.json())
        .then(data => {
            Object.entries(data).forEach(([key,value]) => {
                body = body.replaceAll(key,value)
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