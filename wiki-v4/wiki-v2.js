
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
    if (flickering){
        flickering=false
    }
    else{
        startFlicker(document.getElementById("phantom-flicker"))
        startFlicker(document.getElementById("normal-flicker"))
        startFlicker(document.getElementById("oni-flicker"))
        startFlicker(document.getElementById("deogen-flicker"))
    }
}