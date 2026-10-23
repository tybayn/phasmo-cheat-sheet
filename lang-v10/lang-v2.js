var lang = 'en'
var lang_data = null

// ----------------------------------

const lang_currency = [
    "de", "es", "fr", "it", "pt-br", "ru", "tr", "pl"
]

const lang_menu_widths = {
    "en":{
        "left":"196px",
        "width":"168px",
        "maps":"calc(100% - 265px)"
    },
    "de":{
        "left":"240px",
        "width":"219px",
        "maps":"calc(100% - 309px)"
    },
    "fr":{
        "left":"230px",
        "width":"209px",
        "maps":"calc(100% - 299px)"
    },
    "it":{
        "left":"230px",
        "width":"209px",
        "maps":"calc(100% - 299px)"
    },
    "jp":{
        "left":"230px",
        "width":"209px",
        "maps":"calc(100% - 299px)"
    },
    "es":{
        "left":"230px",
        "width":"289px",
        "maps":"calc(100% - 299px)"
    },
    "pl":{
        "left":"210px",
        "width":"188px",
        "maps":"calc(100% - 279px)"
    },
    "ko":{
        "left":"221px",
        "width":"193px",
        "maps":"calc(100% - 290px)"
    },
    "pt-br":{
        "left":"196px",
        "width":"168px",
        "maps":"calc(100% - 265px)"
    },
    "ru":{
        "left":"240px",
        "width":"219px",
        "maps":"calc(100% - 309px)"
    },
    "tr":{
        "left":"236px",
        "width":"208px",
        "maps":"calc(100% - 305px)"
    },
    "zh-cn":{
        "left":"221px",
        "width":"193px",
        "maps":"calc(100% - 290px)"
    },
    "zh-tw":{
        "left":"221px",
        "width":"193px",
        "maps":"calc(100% - 290px)"
    }
}

// Languages not offered by the server: data is requested in the alias language and converted locally
const lang_server_alias = {
    "zh-tw": "zh-cn"
}

const local_languages = [
    {"lang":"zh-tw","lang_option":"Chinese (Traditional) 🇹🇼","url":"zh-tw"}
]

// BCP 47 tags for <html lang>, so fallback fonts pick the right CJK glyph forms
const lang_html_tags = {
    "jp": "ja",
    "pt-br": "pt-BR",
    "zh-cn": "zh-Hans",
    "zh-tw": "zh-Hant-TW"
}

// ----------------------------------

function loadScript(src){
    return new Promise((resolve, reject) => {
        const script = document.createElement("script")
        script.src = src
        script.onload = resolve
        script.onerror = () => reject(`Failed to load script: ${src}`)
        document.head.appendChild(script)
    })
}

// Traditional Chinese: convert Simplified server data with OpenCC + Taiwan phrasing
;(function(){
    // checkLink() stores ?lang= in the cookie later, but server requests must already be patched by then
    const url_lang = new URLSearchParams(window.location.search).get("lang")?.toLowerCase()
    const cookie_lang = document.cookie.split(";").map(c => c.trim()).find(c => c.startsWith("lang="))?.slice(5)
    if((url_lang ?? cookie_lang) != "zh-tw") return

    const to_tw = Promise.all([
        loadScript("lang-v10/zh-tw/opencc-cn2t.js"),
        loadScript("lang-v10/zh-tw/tw-phrases.js")
    ])
    .then(() => {
        const convert = OpenCC.Converter({ from: "cn", to: "twp" })
        return text => zh_tw_phrases.reduce((out, [from, to]) => out.replaceAll(from, to), convert(text))
    })
    .catch(err => {
        console.error(err)
        return text => text
    })

    // Only values are converted, keys stay untouched since they are used as ids
    const deep_convert = (value, fn) => {
        if(typeof value === "string") return fn(value)
        if(Array.isArray(value)) return value.map(v => deep_convert(v, fn))
        if(value && typeof value === "object")
            return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, deep_convert(v, fn)]))
        return value
    }

    const native_fetch = window.fetch
    window.fetch = (input, init = {}) => {
        const url = input instanceof Request ? input.url : String(input)
        const method = (init.method ?? (input instanceof Request ? input.method : "GET")).toUpperCase()
        if(!url.includes("zero-network.net") || method != "GET")
            return native_fetch(input, init)

        const server_url = url.replace(/([?&]lang=)zh-tw(?=&|$)/, `$1${lang_server_alias["zh-tw"]}`)
        return Promise.all([native_fetch(server_url, init), to_tw])
        .then(([res, fn]) => {
            if(!res.ok || !(res.headers.get("content-type") ?? "").includes("json"))
                return res
            return res.json().then(data => new Response(JSON.stringify(deep_convert(data, fn)), {
                status: res.status,
                statusText: res.statusText,
                headers: {"Content-Type": "application/json"}
            }))
        })
    }
})()

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
        new Audio(`lang-v10/${lang}/assets/1.mp3`),
        new Audio(`lang-v10/${lang}/assets/2.mp3`),
        new Audio(`lang-v10/${lang}/assets/3.mp3`),
        new Audio(`lang-v10/${lang}/assets/4.mp3`),
        new Audio(`lang-v10/${lang}/assets/5.mp3`),
        new Audio(`lang-v10/${lang}/assets/spirit_smudge.mp3`),
        new Audio(`lang-v10/${lang}/assets/standard_smudge.mp3`),
        new Audio(`lang-v10/${lang}/assets/demon_smudge.mp3`),
        new Audio(`lang-v10/${lang}/assets/demon_cooldown.mp3`),
        new Audio(`lang-v10/${lang}/assets/standard_cooldown.mp3`),
        new Audio(`lang-v10/${lang}/assets/standard_hunt.mp3`),
        new Audio(`lang-v10/${lang}/assets/cursed_hunt.mp3`),
        new Audio('assets/start.mp3'),
        new Audio('assets/stop.mp3'),
        new Audio(`lang-v10/${lang}/assets/sound_cooldown.mp3`),
        new Audio(`lang-v10/${lang}/assets/myling_cooldown.mp3`),
        new Audio(`assets/obambo-alert.mp3`)
    ];
    timer_snd.forEach(snd => {
        snd.preload = 'auto';
        snd.load();
    });
}

function load_translation(){
    return new Promise((resolve, reject) => {
        lang = getCookie("lang")
        if(!lang){
            lang = 'en'
        }
        fetch(`lang-v10/${lang}/data.json`)
        .then(data => data.json())
        .then(data => {
            lang_data = data
            document.documentElement.lang = lang_html_tags[lang] ?? lang
            loadCSS(`lang-v10/${lang}/override.css`)
            load_voice()
            resolve("Translation loaded")
        })
        .catch(err => {
            console.error(err)
            console.log(`${lang} is not yet supported!`)
            fetch(`lang-v10/en/data.json`)
            .then(data => data.json())
            .then(data => {
                lang = 'en'
                lang_data = data
                loadCSS(`lang-v10/en/override.css`)
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
        fetch(`lang-v10/${to_lang}/data.json`)
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

function fallback_translate(to_lang){
    return new Promise((resolve, reject) => {
        let body = document.body.innerHTML
        fetch(`lang-v10/en/data.json`)
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
            $("#page-loading").hide()
            resolve("Translation complete")
        })
    })
}

function translate_wiki(to_lang){
    return new Promise((resolve, reject) => {
        let body = document.body.innerHTML
        fetch(`lang-v10/${to_lang}/wiki.json`)
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

function fallback_translate_wiki(to_lang){
    return new Promise((resolve, reject) => {
        let body = document.body.innerHTML
        fetch(`lang-v10/en/wiki.json`)
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