const themes = {
    "Default": "theme-default",
    "Berry": "theme-berry",
    "Black & White": "theme-black-white",
    "Coral": "theme-coral",
    "Dusk": "theme-dusk",
    "Frost": "theme-frost",
    "Halloween": "theme-halloween",
    "Holiday": "theme-holiday-animated",
    "Northern Lights": "theme-northern-lights",
    "Pride": "theme-pride",
    "Spooky": "theme-spooky-animated",
    "Spruce": "theme-spruce",
    "Steel": "theme-steel",
    "Sunset": "theme-sunset",
    "Twilight": "theme-twilight",
    "ZN-Elite" : "theme-zn"
}

const theme_lights = {
    "Holiday":["red","lime","white"],
    "Spooky":["orange","lime","purple"]
}

function loadThemes(){
    let theme_options = ""
    Object.keys(themes).forEach((key) => {
        theme_options += `<option value="${key}">${key}</option>`
    })
    $("#theme").html(theme_options)
}

let light_interval = null

function changeTheme(name = null){

    let changeObjects = [
        ".ghost_card",".menu","#settings_box","#settings_tab","#links_box","#links_tab",
        "#discord_link_box","#discord_link_tab","#event_box","#event_tab",
        "#wiki_box","#wiki_tab","#maps_box","#maps_tab",
        "#news_box","#news_tab","#language_box","#language_tab","#debug_tab",
        "#z3d-tab","#z3d-box","#theme_box","#theme_tab","#discord_tab","#info_box","#info_box_voice",
        "#info_box_debug","#info_box_zndl","#resetMenu", "#broadcast-content"
    ]

    let theme_name = name != null ? name : $("#theme").val()

    clearInterval(light_interval)
    $(".ghost_card").removeClass("c-light-div")
    let old_lights = document.querySelectorAll('.c-light');
    old_lights.forEach(light => {
        light.remove()
    })


    if(themes[theme_name].endsWith("-animated")){

        let objs = document.getElementsByClassName("ghost_card")
        for(let i = 0; i < objs.length; i++){
            wrap(objs[i],theme_lights[theme_name],true,true,true,true,true)
        }
        wrap(document.getElementById("menu"),theme_lights[theme_name],false,true,false,false)
        const lights = document.querySelectorAll('.c-light');
        light_interval = setInterval(() => {
            lights.forEach(light => {
                let i = theme_lights[theme_name].indexOf(light.style.backgroundColor)
                i = (i+1) % theme_lights[theme_name].length
                light.style.backgroundColor = theme_lights[theme_name][i];
                light.style.boxShadow = `0px 0px 20px 5px ${theme_lights[theme_name][i]}`
            });
        }, 2000);
    }

    changeObjects.forEach((item) => {
        $(item).removeClass(Object.values(themes))
        $(item).addClass(themes[theme_name])
    })
}

function wrap(div, light_colors, top=true, right=true, bottom=true, left=true, space=false){

    let i = 20
    let spacing = 100
    let light_color = Math.floor(Math.random()*3)
    if(space)
        div.classList.add("c-light-div")
    if(top)
        for (i = Math.floor(Math.random()*40+5); i < div.clientWidth; i+=spacing) {
            let light = document.createElement('div');
            let base = document.createElement('div')
            light.style.left = `${i}px`
            light.style.top = `-${Math.floor(Math.random() * 10)+5}px`
            light.style.backgroundColor = light_colors[light_color];
            light.style.boxShadow = `0px 0px 20px 5px ${light_colors[light_color]}`
            light.style.transform = `rotate(${Math.floor(Math.random() * 40)-20}deg)`
            light.classList.add('c-light')
            light.classList.add('c-light-t')
            base.classList.add('c-light-b-t')
            light.appendChild(base)
            div.appendChild(light);
            light_color = (light_color + 1) % light_colors.length
        }

    if(right)
        for (i = i - div.clientWidth; i < div.clientHeight; i+=spacing) {
            let light = document.createElement('div');
            let base = document.createElement('div')
            light.style.top = `${i}px`
            light.style.right = `-${Math.floor(Math.random() * 10)+5}px`
            light.style.backgroundColor = light_colors[light_color];
            light.style.boxShadow = `0px 0px 20px 5px ${light_colors[light_color]}`
            light.style.transform = `rotate(${Math.floor(Math.random() * 40)-20}deg)`
            light.classList.add('c-light')
            light.classList.add('c-light-r');
            base.classList.add('c-light-b-r')
            light.appendChild(base)
            div.appendChild(light);
            light_color = (light_color + 1) % light_colors.length
        }

    if(bottom)
        for (i = i - div.clientHeight; i < div.clientWidth; i+=spacing) {
            let light = document.createElement('div');
            let base = document.createElement('div')
            light.style.right = `${i}px`
            light.style.bottom = `-${Math.floor(Math.random() * 10)+5}px`
            light.style.backgroundColor = light_colors[light_color];
            light.style.boxShadow = `0px 0px 20px 5px ${light_colors[light_color]}`
            light.style.transform = `rotate(${Math.floor(Math.random() * 40)-20}deg)`
            light.classList.add('c-light')
            light.classList.add('c-light-b');
            base.classList.add('c-light-b-b')
            light.appendChild(base)
            div.appendChild(light);
            light_color = (light_color + 1) % light_colors.length
        }

    if(left)
        for (i = i - div.clientWidth; i < div.clientHeight; i+=spacing) {
            let light = document.createElement('div');
            let base = document.createElement('div')
            light.style.bottom = `${i}px`
            light.style.left = `-${Math.floor(Math.random() * 10)+5}px`
            light.style.backgroundColor = light_colors[light_color];
            light.style.boxShadow = `0px 0px 20px 5px ${light_colors[light_color]}`
            light.style.transform = `rotate(${Math.floor(Math.random() * 40)-20}deg)`
            light.classList.add('c-light')
            light.classList.add('c-light-l');
            base.classList.add('c-light-b-l')
            light.appendChild(base)
            div.appendChild(light);
            light_color = (light_color + 1) % light_colors.length
        }
}