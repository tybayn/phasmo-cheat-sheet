var lang = 'en'
var lang_data = null

// ----------------------------------

const lang_currency = [
    "de"
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

function load_translation(){
    return new Promise((resolve, reject) => {
        lang = getCookie("lang")
        if(!lang){
            lang = 'en'
        }
        fetch(`lang-v8/${lang.split('-')[0]}/data.json`)
        .then(data => data.json())
        .then(data => {
            lang_data = data
            resolve("Translation loaded")
        })
        .catch(err => {
            console.log(`${lang} is not yet supported!`)
            fetch(`lang-v8/en.json`)
            .then(data => data.json())
            .then(data => {
                lang_data = data
                resolve("Translation loaded")
            })
            .catch(err => {
                reject("Could not read translation")
            })
        })
    })
}

function translate(to_lang){
    return new Promise((resolve, reject) => {
        let body = document.body.innerHTML
        fetch(`lang-v8/${to_lang.split('-')[0]}/data.json`)
        .then(data => data.json())
        .then(data => {
            Object.entries(data).forEach(([key,value]) => {
                body = body.replaceAll(key,value)
            })
            Object.entries(all_ghosts).forEach(([key,value]) => {
                body = body.replaceAll(`{{${key}}}`,value)
            })
            document.body.innerHTML = body
            loadCSS(`lang-v8/${to_lang}/override.css`)
            if(to_lang != "en")
                $(".vcs").hide()
            $("#page-loading").hide()
            lang = to_lang
            setCookie("lang",lang,90)
            lang_data = data
            resolve("Translation complete")
        })
        .catch(err => {
            console.log(`${to_lang} is not yet supported!`)
            fetch(`lang-v8/en.json`)
            .then(data => data.json())
            .then(data => {
                Object.entries(data).forEach(([key,value]) => {
                    body = body.replaceAll(key,value)
                })
                Object.entries(all_ghosts).forEach(([key,value]) => {
                    body = body.replaceAll(`{{${key}}}`,value)
                })
                document.body.innerHTML = body
                loadCSS(`lang-v8/en/override.css`)
                $("#page-loading").hide()
                lang = 'en'
                setCookie("lang",'en',90)
                lang_data = data
                resolve("Translation complete")
            })
            .catch(err => {
                reject("Could not translate")
            })
        })
    })
}

function translate_wiki(to_lang){
    return new Promise((resolve, reject) => {
        let body = document.body.innerHTML
        fetch(`lang-v8/${to_lang.split('-')[0]}/wiki.json`)
        .then(data => data.json())
        .then(data => {
            Object.entries(data).forEach(([key,value]) => {
                body = body.replaceAll(key,value)
            })
            document.body.innerHTML = lang_currency.includes(to_lang) ? body.replace(/(\d+)\.(\d+)/g, '$1,$2') : body
            resolve("Translation complete")
        })
        .catch(err => {
            console.log(err)
            reject("Could not translate")
        })
    })
}