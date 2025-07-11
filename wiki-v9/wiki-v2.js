
function accordian(elem){
    var panel = elem.nextElementSibling;
    var all_titles = $(elem).siblings(".wiki_title")
    var all_details = $(elem).siblings(".wiki_details")

    for(let i = 0; i < all_titles.length; i++){
        if (all_titles[i] != elem){
            all_titles[i].classList.remove("wiki_active")
        }
    }
    for(let i = 0; i < all_details.length; i++){
        if (all_details[i] != panel){
            all_details[i].style.height = "0px"
            all_details[i].style.display = "none"
        }
    }

    if (panel.style.height == '' || panel.style.height != '0px') {
        elem.classList.remove("wiki_active");
        panel.style.height = "0px"
        panel.style.display = "none";
    } else {
        elem.classList.add("wiki_active");
        panel.style.display = "table";
        panel.style.height = "auto"
    }

    setFlicker()
}

function openWikiFromURL(){
    params = new URL(window.location.href).searchParams
    if (params.get("wiki")){
        if(params.get("wiki") == "current-event"){
            showEvent()
            let url = new URL(window.location.href)
            url.searchParams.delete("wiki")
            history.replaceState(history.state,"",url.href)
        }
        else{
            openWikiPath(params.get("wiki"))
            let url = new URL(window.location.href)
            url.searchParams.delete("wiki")
            history.replaceState(history.state,"",url.href)
        }
    }
}

// -----------------------------------------------

function rand_normal(mean = 0.5, stddev = 0.25) {
    let u = Math.random();
    let v = Math.random();
    let num = Math.sqrt(-2.0 * Math.log(u == 0 ? 0.001 : u)) * Math.cos(2.0 * Math.PI * v);
    num = num * stddev + mean;
    return Math.min(Math.max(num, 0), 1);
}

blinks = {
    "12": "https://i.imgur.com/j0JhpT4.png",
    "27": "https://i.imgur.com/UsN4kIZ.png",
    "39": "https://i.imgur.com/U2cHXrN.png",
    "54": "https://i.imgur.com/Ek0n29p.png",
    "62": "https://i.imgur.com/j0JhpT4.png",
    "80": "https://i.imgur.com/UsN4kIZ.png",
    "105": "https://i.imgur.com/U2cHXrN.png",
    "120": "https://i.imgur.com/Ek0n29p.png",
}

let ghost_flicker_data = {
    "Normal":{
        "vis_max":0.30,
        "vis_min":0.08,
        "vis_rand":Math.random,
        "invis_max":0.92,
        "invis_min":0.10,
        "invis_rand":Math.random,
        "flicker_max":1.00,
        "flicker_min":0.30
    },
    "Phantom":{
        "vis_max":0.30,
        "vis_min":0.08,
        "vis_rand":Math.random,
        "invis_max":1.92,
        "invis_min":0.70,
        "invis_rand":rand_normal,
        "invis_mean":0.80,
        "invis_stddev":0.15,
        "flicker_max":2.00,
        "flicker_min":1.00
    },
    "Oni":{
        "vis_max":0.50,
        "vis_min":0.02,
        "vis_rand":rand_normal,
        "vis_mean":0.74,
        "vis_stddev":0.22,
        "invis_max":0.50,
        "invis_min":0.01,
        "invis_rand":rand_normal,
        "invis_mean":0.15,
        "invis_stddev":0.15,
        "flicker_max":1.00,
        "flicker_min":0.30
    },
    "Deogen":{
        "vis_max":0.30,
        "vis_min":0.20,
        "vis_rand":Math.random,
        "invis_max":0.40,
        "invis_min":0.01,
        "invis_rand":Math.random,
        "flicker_max":0.60,
        "flicker_min":0.30
    }
}

let flickering = false

function startFlicker(elem, is_obake = false){
    let obj = $(elem).find("#ghost-flicker")
    let obj_img = $(obj).find("img")
    let ghost = $(elem).find("#flicker-ghost-name")[0].getAttribute("name")
    ghost = ghost == "Obake" ? "Normal" : ghost
    let vis_min = ghost_flicker_data[ghost].vis_min
    let vis_max = ghost_flicker_data[ghost].vis_max
    let invis_min = ghost_flicker_data[ghost].invis_min
    let invis_max = ghost_flicker_data[ghost].invis_max
    let flicker_min = ghost_flicker_data[ghost].flicker_min
    let flicker_max = ghost_flicker_data[ghost].flicker_max
    let flicker_ghost = ghost_flicker_data[ghost]
    let num_blink = 1

    function flickerOn(){
        if (flickering){
            $(obj).show()
            let r = flicker_ghost.vis_rand == Math.random ? flicker_ghost.vis_rand(flicker_ghost.vis_mean,flicker_ghost.vis_stddev) : flicker_ghost.vis_rand()
            let flicker_on_time = (r * (vis_max - vis_min) + vis_min)
            setTimeout(flickerOff,Math.round(flicker_on_time*1000),flicker_on_time)
        }
    }

    function flickerOff(on){
        if (flickering){
            $(obj).hide()
            num_blink = (num_blink + 1) % 132
            if (is_obake && blinks.hasOwnProperty(num_blink.toString())){
                $(obj_img).attr('src',blinks[num_blink.toString()])
            }
            if (is_obake && blinks.hasOwnProperty((num_blink - 1).toString())){
                $(obj_img).attr('src','https://i.imgur.com/U2cHXrN.png')
            }
            let r = flicker_ghost.invis_rand == Math.random ? flicker_ghost.invis_rand(flicker_ghost.invis_mean,flicker_ghost.invis_stddev) : flicker_ghost.invis_rand()
            let flicker_off_time = (r * (invis_max - invis_min) + invis_min)
            flicker_off_time = (on + flicker_off_time) > flicker_max ? (flicker_max - on) : (on + flicker_off_time) < flicker_min ? (flicker_min - on) : flicker_off_time
            setTimeout(flickerOn,Math.round(flicker_off_time*1000))
        }
    }

    let start_filcker_time = (Math.random() * (vis_max - vis_min) + vis_min)
    $(obj).show()
    flickering = true
    setTimeout(flickerOff,Math.round(start_filcker_time*1000),start_filcker_time)
}

function setFlicker(){
    if (document.getElementById("wiki_flicker").style.height == "0px"){
        flickering=false
    }
    else if (document.getElementById("wiki_flicker").style.height != "0px" && !flickering){
        startFlicker(document.getElementById("phantom-flicker"))
        startFlicker(document.getElementById("normal-flicker"))
        startFlicker(document.getElementById("oni-flicker"))
        startFlicker(document.getElementById("deogen-flicker"))
        startFlicker(document.getElementById("normal-flicker-shift"))
        startFlicker(document.getElementById("obake-flicker-shift"),true)
    }
}

function highLightBPMFinder(){
    var hidden = $("#show_tool_button").hasClass("filter_tool_button_back")
    if(hidden){
        toggleFilterTools()
    }

    setTimeout(() => {
        $("#tools-content").children(".modifier").addClass("focus-flash")
        setTimeout(() =>{
            $("#tools-content").children(".modifier").removeClass("focus-flash")
        },2000)
    },hidden ? 500 : 1)
}

function openGhostInfo(ghost){
    if(!$("#wiki_box").hasClass("tab-open"))
        showWiki()
    if(!$("#wiki-0-evidence").hasClass("wiki_active"))
        accordian(document.getElementById("wiki-0-evidence"))
    if(!$(`#wiki-0-evidence-${ghost.toLowerCase().replace(" ","-")}`).hasClass("wiki_active"))
        accordian(document.getElementById(`wiki-0-evidence-${ghost.toLowerCase().replace(" ","-")}`))
    document.getElementById(`wiki-0-evidence-${ghost.toLowerCase().replace(" ","-")}`).scrollIntoView({alignToTop:true,behavior:"smooth"})
}

function openWikiPath(path){

    delim = path.includes(">>") ? ">>" : "."

    if(!$("#wiki_box").hasClass("tab-open"))
        showWiki()
    path.split(delim).forEach(id => {
        if(!$(document.getElementById(`wiki-${id}`)).hasClass("wiki_active")){
            let wiki_elem = document.getElementById(`wiki-${id}`)
            if(wiki_elem.tagName == "DIV")
                accordian(document.getElementById(`wiki-${id}`))
        }
    })
    document.getElementById(`wiki-${path.split(delim)[path.split(delim).length - 1]}`).scrollIntoView({alignToTop:true,behavior:"smooth"})
}

function generateWikiShareLink(elem,inline=false){
    let url = ""
    let e = elem.parentElement.previousElementSibling
    console.log(e)
    if(inline){
        let e2 = elem.previousElementSibling
        console.log(e2)
        while (!e2.id.includes("wiki-"))
            e2 = e2.previousElementSibling
        e = e2
    }
    do {
        url = `${e.id.replace("wiki-","")}${url == "" ? "" : "."}${url}`
        e = e.parentElement.previousElementSibling
    } while (e.id != "wiki-body" && e.id != "");

    navigator.clipboard.writeText(`${window.location.href}${window.location.href.includes("?") ? "&" : "?"}wiki=${url}`)

    $(".wiki-share").html(`${lang_data['{{copy_share_link}}']} <img loading="lazy" src="imgs/share.png">`)
    elem.innerHTML = `${lang_data['{{copied}}']} <img loading="lazy" src="imgs/share.png">`
}

function generateEventShareLink(elem){
    navigator.clipboard.writeText(`${window.location.href}${window.location.href.includes("?") ? "&" : "?"}wiki=current-event`)
    $(".wiki-share").html(`${lang_data['{{copy_share_link}}']} <img loading="lazy" src="imgs/share.png">`)
    elem.innerHTML = `${lang_data['{{copied}}']} <img loading="lazy" src="imgs/share.png">`
}

function zoomImage(elem,subtitle=null){
    $("#zoom_image").attr("src",$(elem).attr("src"))
    if(subtitle){
        $("#blackout_image_subtitle").text(subtitle)
        $("#blackout_image_subtitle").show()
    }
    else{
        $("#blackout_image_subtitle").hide()
    }
    $("#blackout_image").show()
    document.getElementById("blackout_image").style.opacity = 1
}

function zoomOutImage(){
    document.getElementById("blackout_image").style.opacity = 0
    setTimeout(() => {
        $("#blackout_image").hide()
    },500)
}