const themes = {
    "Default": "theme-default",
    "Berry": "theme-berry",
    "Black & White": "theme-black-white",
    "Blood Moon": "theme-blood-moon-particle",
    "Coral": "theme-coral",
    "Dusk": "theme-dusk",
    "Frost": "theme-frost",
    "Halloween": "theme-halloween",
    "Holiday": "theme-holiday-animated",
    "Northern Lights": "theme-northern-lights",
    "Pride": "theme-pride",
    "Snow": "theme-snow-particle",
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
let bloodMoonInterval = null
let snowInterval = null

function changeTheme(name = null){

    let changeObjects = [
        ".ghost_card",".menu","#settings_box","#settings_tab","#links_box","#links_tab",
        "#discord_link_box","#discord_link_tab","#event_box","#event_tab",
        "#wiki_box","#wiki_tab","#maps_box","#maps_tab",
        "#news_box","#news_tab","#language_box","#language_tab","#debug_tab",
        "#z3d-tab","#z3d-box","#theme_box","#theme_tab","#discord_tab","#info_box","#info_box_voice",
        "#info_box_debug","#info_box_zndl","#info_box_calibrate","#resetMenu", "#broadcast-content"
    ]

    let theme_name = name != null ? name : $("#theme").val()
    if(themes[theme_name] == undefined){
        theme_name = "Default"
        document.getElementById("theme").value = "Default"
    }

    clearInterval(light_interval)
    $(".ghost_card").removeClass("c-light-div")
    let old_lights = document.querySelectorAll('.c-light');
    old_lights.forEach(light => {
        light.remove()
    })

    clearInterval(bloodMoonInterval)
    clearInterval(snowInterval)

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

    if(themes[theme_name] == "theme-blood-moon-particle"){
        if(!document.getElementById("disable_particles").checked){
            bloodMoonInterval = setInterval(createBMParticle, 80);
        }
        document.body.style.backgroundImage = "radial-gradient(circle, rgba(0,0,0,0.7), rgba(0,0,0,0.8)), url('https://zero-network.net/phasmophobia/static/imgs/bm-background.jpg')"
    }
    else if(themes[theme_name] == "theme-snow-particle"){
        if(!document.getElementById("disable_particles").checked){
            snowInterval = setInterval(createSnowParticle, 200);
        }
        document.body.style.backgroundImage = "radial-gradient(circle, rgba(0,0,0,0.75), rgba(0,0,0,1)), url('https://zero-network.net/phasmophobia/static/imgs/background.jpg')"
    }
    else{
        document.body.style.backgroundImage = "radial-gradient(circle, rgba(0,0,0,0.75), rgba(0,0,0,1)), url('https://zero-network.net/phasmophobia/static/imgs/background.jpg')"
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

function createBMParticle() {
    particleContainer = document.getElementById('particle-container');
    const particle = document.createElement('div');
    particle.classList.add('bm-particle');
    particle.style.backgroundColor = Math.floor(Math.random() * 3) == 0 ? 'rgb(160, 0, 0)' : 'rgb(40, 40, 40)';
    const randomX = Math.random() * window.innerWidth;
    particle.style.left = `${randomX}px`;
    const size = Math.random() * 3 + 2;
    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;
    const duration = Math.random() * 3 + 2;
    particle.style.animationDuration = `${duration}s`;
    particleContainer.appendChild(particle);
    setTimeout(() => {
        particle.remove();
    }, duration * 1000);
}

function createSnowParticle() {
    particleContainer = document.getElementById('particle-container');
    const particle = document.createElement('div');
    particle.classList.add('snow-particle');
    particle.style.backgroundColor = Math.floor(Math.random() * 3) == 0 ? 'rgb(200, 200, 200)' : 'rgb(200, 200, 220)';
    const randomX = Math.random() * window.innerWidth;
    particle.style.left = `${randomX}px`;
    const size = Math.random() * 3 + 2;
    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;
    const duration = Math.random() * 10 + 10;
    particle.style.animationDuration = `${duration}s`;
    particleContainer.appendChild(particle);
    setTimeout(() => {
        particle.remove();
    }, duration * 1000);
}

function createBMEffectParticle() {
    particleContainer = document.getElementById('particle-container');
    const top_particle = document.createElement('div');
    top_particle.classList.add('bm-particle');
    top_particle.style.backgroundColor = Math.floor(Math.random() * 4) == 0 ? 'rgb(160, 0, 0)' : 'rgb(40, 40, 40)';
    const top_randomX = Math.random() * window.innerWidth;
    top_particle.style.left = `${top_randomX}px`;
    const top_size = Math.random() * 3 + 2;
    top_particle.style.width = `${top_size}px`;
    top_particle.style.height = `${top_size}px`;
    const top_duration = Math.random() * 3 + 2;
    top_particle.style.animationDuration = `${top_duration}s`;
    particleContainer.appendChild(top_particle);
    setTimeout(() => {
        top_particle.remove();
    }, top_duration * 1000);
    const bot_particle = document.createElement('div');
    bot_particle.classList.add('bm-particle-top');
    bot_particle.style.backgroundColor = Math.floor(Math.random() * 4) == 0 ? 'rgb(160, 0, 0)' : 'rgb(40, 40, 40)';
    const bot_randomX = Math.random() * window.innerWidth;
    bot_particle.style.left = `${bot_randomX}px`;
    const bot_size = Math.random() * 3 + 2;
    bot_particle.style.width = `${bot_size}px`;
    bot_particle.style.height = `${bot_size}px`;
    const bot_duration = Math.random() * 3 + 2;
    bot_particle.style.animationDuration = `${bot_duration}s`;
    particleContainer.appendChild(bot_particle);
    setTimeout(() => {
        bot_particle.remove();
    }, bot_duration * 1000);
}