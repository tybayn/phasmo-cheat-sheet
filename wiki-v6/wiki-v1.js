
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
        openWikiPath(params.get("wiki"))
        let url = new URL(window.location.href)
        url.searchParams.delete("wiki")
        history.replaceState(history.state,"",url.href)
    }
}

// -----------------------------------------------
let ghost_flicker_data = {
    "Normal":{
        "vis_max":0.30,
        "vis_min":0.08,
        "invis_max":0.92,
        "invis_min":0.10,
        "flicker_max":1.00,
        "flicker_min":0.30
    },
    "Phantom":{
        "vis_max":0.30,
        "vis_min":0.08,
        "invis_max":1.92,
        "invis_min":0.70,
        "flicker_max":2.00,
        "flicker_min":1.00
    },
    "Oni":{
        "vis_max":0.50,
        "vis_min":0.02,
        "invis_max":0.50,
        "invis_min":0.01,
        "flicker_max":1.00,
        "flicker_min":0.30
    },
    "Deogen":{
        "vis_max":0.30,
        "vis_min":0.20,
        "invis_max":0.40,
        "invis_min":0.01,
        "flicker_max":0.60,
        "flicker_min":0.30
    }
}

let flickering = false

function startFlicker(elem){
    let obj = $(elem).find("#ghost-flicker")
    let ghost = $(elem).find("#flicker-ghost-name")[0].innerText
    let vis_min = ghost_flicker_data[ghost].vis_min
    let vis_max = ghost_flicker_data[ghost].vis_max
    let invis_min = ghost_flicker_data[ghost].invis_min
    let invis_max = ghost_flicker_data[ghost].invis_max
    let flicker_min = ghost_flicker_data[ghost].flicker_min
    let flicker_max = ghost_flicker_data[ghost].flicker_max

    function flickerOn(){
        if (flickering){
            $(obj).show()
            r = Math.round((Math.random() * (vis_max - vis_min) + vis_min) * 1000)
            setTimeout(flickerOff,r,r/1000)
        }
    }

    function flickerOff(on){
        if (flickering){
            $(obj).hide()
            t_max = Math.min(flicker_max - on, invis_max)
            t_min = Math.max(flicker_min - on, invis_min)
            r = Math.round((Math.random() * (t_max - t_min) + t_min) * 1000)
            setTimeout(flickerOn,r)
        }
    }

    r = Math.floor((Math.random() * (vis_max - vis_min) + vis_min) * 1000)
    $(obj).show()
    flickering = true
    setTimeout(flickerOff,r,r)
}

function setFlicker(){
    if (document.getElementById("wiki_flicker").style.height == "0px" && flickering){
        flickering=false
    }
    else{
        startFlicker(document.getElementById("phantom-flicker"))
        startFlicker(document.getElementById("normal-flicker"))
        startFlicker(document.getElementById("oni-flicker"))
        startFlicker(document.getElementById("deogen-flicker"))
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
            accordian(document.getElementById(`wiki-${id}`))
        }
    })
    document.getElementById(`wiki-${path.split(delim)[path.split(delim).length - 1]}`).scrollIntoView({alignToTop:true,behavior:"smooth"})
}

function generateWikiShareLink(elem){
    let url = ""
    let e = elem.parentElement.previousElementSibling
    do {
        url = `${e.id.replace("wiki-","")}${url == "" ? "" : ">>"}${url}`
        e = e.parentElement.previousElementSibling
    } while (e.id != "wiki-body" && e.id != "");

    navigator.clipboard.writeText(`${window.location.href}?wiki=${url}`)

    $(".wiki-share").html('Copy Share Link <img loading="lazy" src="imgs/share.png">')
    elem.innerHTML = 'Copied! <img loading="lazy" src="imgs/share.png">'
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