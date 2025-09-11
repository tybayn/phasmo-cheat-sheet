const themes = {
    "Default": "theme-default",
    "Berry": "theme-berry",
    "Black & White": "theme-black-white",
    "Blood Moon": "theme-blood-moon-particle",
    "Coral": "theme-coral",
    "Cozy": "theme-cozy",
    "Desolate": "theme-desolate",
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
let isAltered = false

function changeTheme(name = null){

    let changeObjects = [
        ".ghost_card",".menu","#settings_box","#settings_tab","#links_box","#links_tab",
        "#discord_link_box","#discord_link_tab","#event_box","#event_tab",
        "#wiki_box","#wiki_tab","#maps_box","#maps_tab",
        "#news_box","#news_tab","#language_box","#language_tab","#debug_tab",
        "#z3d-tab","#z3d-box","#theme_box","#theme_tab","#discord_tab", "#youtube_tab", "#info_box","#info_box_voice",
        "#info_box_debug","#info_box_zndl","#info_box_calibrate", "#info_box_weekly", "#resetMenu", "#broadcast-content",
        "#search_box","#search_tab", "#partner-box", "#partner-tab"
    ]

    if(isAltered){
        undoDesolate(changeObjects)
        isAltered = false
    }

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
    cg = document.getElementById("candle-group")
    if(cg) cg.remove()
    sl = document.getElementById("string-lights")
    if(sl) sl.remove()
    sd = document.getElementById("body-spacer")
    if(sd) sd.remove()

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
    else if(themes[theme_name] == "theme-cozy"){
        if(!document.getElementById("disable_particles").checked){
            createCozyLights()
            createCandles()
            createGhostSpacer()
        }
        document.body.style.backgroundImage = "radial-gradient(circle, rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.6)), url('https://zero-network.net/phasmophobia/static/imgs/background-cozy.png')"
    }
    else if(themes[theme_name] == "theme-desolate"){
        isAltered = true
        desolate(changeObjects)
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

function createGhostSpacer(height=125){
    ghost_container = document.getElementById('cards')
    const spacerdiv = document.createElement('div')  
    spacerdiv.id = "body-spacer"
    spacerdiv.style.height = `${height}px`
    ghost_container.appendChild(spacerdiv);
}

function createCandles(){
    particleContainer = document.getElementById('particle-container')
    menu_width = parseInt(lang_menu_widths[lang].width)
    const candlediv = document.createElement('div')   
    candlediv.innerHTML = `
        <div class="holder" style="bottom: 0px; left: 20px;">
            <div class="candle">
                <div class="blinking-glow"></div>
                <div class="thread"></div>
                <div class="glow"></div>
                <div class="flame"></div>
            </div>
        </div>
        <div class="holder" style="bottom: -10px; left: 80px;">
            <div class="candle">
                <div class="blinking-glow"></div>
                <div class="thread"></div>
                <div class="glow"></div>
                <div class="flame"></div>
            </div>
        </div>
        <div class="holder" style="bottom: -30px; left: 50px;">
            <div class="candle">
                <div class="blinking-glow"></div>
                <div class="thread"></div>
                <div class="glow"></div>
                <div class="flame"></div>
            </div>
        </div>
    `
    candlediv.id = "candle-group"
    candlediv.style.left = `${menu_width}px`
    particleContainer.appendChild(candlediv);
}

function createCozyLights(){
    particleContainer = document.getElementById('particle-container')
    menu_width = parseInt(lang_menu_widths[lang].width)
    const lightdiv = document.createElement('div')   
    lightdiv.innerHTML = `
        <div class="light" style="--i:0;"></div>
        <div class="light" style="--i:1;"></div>
        <div class="light" style="--i:2;"></div>
        <div class="light" style="--i:3;"></div>
        <div class="light" style="--i:4;"></div>
        <div class="light" style="--i:5;"></div>
    `
    lightdiv.id = "string-lights"
    lightdiv.classList.add("string-lights")
    particleContainer.appendChild(lightdiv);
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

function saveOriginalStyles(elem, styles) {
    styles.forEach(style => {
        if (!(style in elem.dataset)) {
            elem.dataset["orig" + style] = elem.style[style] || "";
        }
    });
}

function restoreOriginalStyles(elem) {
    Object.keys(elem.dataset).forEach(key => {
        if (key.startsWith("orig")) {
            let styleName = key.slice(4);
            styleName = styleName.charAt(0).toLowerCase() + styleName.slice(1); // lowercase first letter
            elem.style[styleName] = elem.dataset[key];
        }
    });
}

function undoDesolate(changeObjects) {
    changeObjects.forEach(item => {
        if (item[0] === '.') {
            Array.from(document.getElementsByClassName(item.slice(1))).forEach(elem => {
                restoreOriginalStyles(elem);
            });
        } else {
            restoreOriginalStyles(document.getElementById(item.slice(1)));
        }
    });

    // Also revert card icons and other manually changed elements
    Array.from(document.getElementsByClassName("card_icon")).forEach(elem => {
        restoreOriginalStyles(elem);
    });

    document.getElementById("num_evidence").style.background = null
    document.getElementById("cust_num_evidence").style.background = null
    document.getElementById("cust_hunt_length").style.background = null
    document.getElementById("evidence").style.background = null
    document.getElementById("feed_info_block").style.background = null
    document.getElementById("3d_info_block").style.background = null
    document.getElementsByClassName("speed")[0].style.background = null
    document.getElementsByClassName("hunt_sanity")[0].style.background = null
    document.getElementsByClassName("timers")[0].style.background = null
    document.getElementsByClassName("modifier")[0].style.background = null

    Array.from(document.getElementsByClassName("card_icon")).forEach(elem => {
        elem.style.filter = null
        elem.style.opacity = null
    })
}


function desolate(changeObjects){
    document.body.style.backgroundImage = 'radial-gradient(circle, rgba(20, 10, 0, 0.4), rgba(20, 10, 0, 0.6)), url("https://zero-network.net/phasmophobia/static/imgs/background-desolate.png")'

    changeObjects.forEach((item) => {

        let let_t = item == ".ghost_card"

        function d(elem, t=false){
            saveOriginalStyles(elem, [
                "transform", "backgroundImage", "backgroundPosition", "backgroundSize",
                "filter", "boxShadow", "clipPath"
            ]);
            
            // Apply crooked position
            if(t){
                let rr = Math.random() * 3 - 1;   // small crooked rotation
                let rx = Math.floor(Math.random() * 50) - 25; // horizontal offset
                elem.style.transform = `rotate(${rr}deg) translate(${rx}px, 0px)`;
            }

            // Background
            if(t)
                elem.style.backgroundImage = 'radial-gradient(rgba(2, 0, 20, 0.9), rgba(33,34,47, 0.7)),url("https://zero-network.net/phasmophobia/static/imgs/wood-texture.png")'
            else
                elem.style.backgroundImage = 'radial-gradient(rgba(2, 0, 20, 0.8), rgba(33,34,47, 0.8)),url("https://zero-network.net/phasmophobia/static/imgs/wood-texture.png")'
            let bgX = Math.floor(Math.random() * 100);
            let bgY = Math.floor(Math.random() * 100);
            let bgSize = 100 + Math.floor(Math.random() * 20);
            elem.style.backgroundPosition = `${bgX}% ${bgY}%`;
            elem.style.backgroundSize = `${bgSize}% auto`;

            // Faded/aged look
            elem.style.filter = `brightness(${0.8 + Math.random()*0.2}) grayscale(0.2)`;

            // Uneven shadow
            elem.style.boxShadow = `${Math.random()*10-5}px ${Math.random()*10-5}px 15px rgba(0,0,0,0.7)`;

            // Generate a jagged edge shape
            if (t) {
            function randomJaggedPath() {
                let points = [];
                let width = 100;
                let height = 100;
                for (let x = 0; x <= width; x += 20) points.push(`${x}% ${Math.random()}%`);
                for (let y = 0; y <= height; y += 20) points.push(`${100 - Math.random()}% ${y}%`);
                for (let x = width; x >= 0; x -= 20) points.push(`${x}% ${100 - Math.random()}%`);
                for (let y = height; y >= 0; y -= 20) points.push(`${Math.random()}% ${y}%`);
                return `polygon(${points.join(",")})`;
            }
            elem.style.clipPath = randomJaggedPath();
        }
        }
        if(item[0] == '.'){
            Array.from(document.getElementsByClassName(item.slice(1))).forEach(elem => {
                d(elem,let_t)
            });
        }
        else{
            d(document.getElementById(item.slice(1)),let_t)
        }
    })

    document.getElementById("num_evidence").style.background = "rgba(0,0,0,0.4)"
    document.getElementById("cust_num_evidence").style.background = "rgba(0,0,0,0.4)"
    document.getElementById("cust_hunt_length").style.background = "rgba(0,0,0,0.4)"
    document.getElementById("evidence").style.background = "rgba(0,0,0,0.4)"
    document.getElementById("feed_info_block").style.background = "rgba(0,0,0,0.4)"
    document.getElementById("3d_info_block").style.background = "rgba(0,0,0,0.4)"
    document.getElementsByClassName("speed")[0].style.background = "rgba(0,0,0,0.4)"
    document.getElementsByClassName("hunt_sanity")[0].style.background = "rgba(0,0,0,0.4)"
    document.getElementsByClassName("timers")[0].style.background = "rgba(0,0,0,0.4)"
    document.getElementsByClassName("modifier")[0].style.background = "rgba(0,0,0,0.4)"

    Array.from(document.getElementsByClassName("card_icon")).forEach(elem => {
        elem.style.filter = "invert(1)"
        elem.style.opacity = 0.4
    })
}