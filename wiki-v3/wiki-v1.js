
function accordian(elem){
    var panel = elem.nextElementSibling;

    if (panel.style.height == '' || panel.style.height != '0px') {
        elem.classList.remove("wiki_active");
        panel.style.height = "0px"
        panel.style.display = "none";
    } else {
        elem.classList.add("wiki_active");
        panel.style.display = "table";
        panel.style.height = "auto"
    }
}

// -----------------------------------------------
let ghost_flicker_data = {
    "Normal":{
        "vis_max":0.3,
        "vis_min":0.08,
        "invis_max":1.0,
        "invis_min":0.3
    },
    "Phantom":{
        "vis_max":0.3,
        "vis_min":0.08,
        "invis_max":2.0,
        "invis_min":1.0
    },
    "Oni":{
        "vis_max":1.0,
        "vis_min":0.3,
        "invis_max":0.3,
        "invis_min":0.08
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

    function flickerOn(){
        if (flickering){
            $(obj).show()
            r = Math.floor((Math.random() * (vis_max - vis_min) + vis_min) * 1000)
            setTimeout(flickerOff,r)
        }
    }

    function flickerOff(){
        if (flickering){
            $(obj).hide()
            r = Math.floor((Math.random() * (invis_max - invis_min) + invis_min) * 1000)
            setTimeout(flickerOn,r)
        }
    }

    r = Math.floor((Math.random() * (vis_max - vis_min) + vis_min) * 1000)
    $(obj).show()
    flickering = true
    setTimeout(flickerOff,r)
}

function setFlicker(){
    if (flickering){
        flickering=false
    }
    else{
        startFlicker(document.getElementById("phantom-flicker"))
        startFlicker(document.getElementById("normal-flicker"))
        startFlicker(document.getElementById("oni-flicker"))
    }
}