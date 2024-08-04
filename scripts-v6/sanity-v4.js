var sanity = 100.00
var sanity_stopped = true
var last_sanity = 100.00

const sanity_maps = {
    "S": 0.12,
    "M": 0.08,
    "L": 0.05
}

const sanity_difficulty = {
    "3A": 1,
    "3I": 1.5,
    "3": 2,
    "2": 2,
    "1": 2,
    "0": 2
}

const sanity_players = {
    "solo": 0.5,
    "multiplayer": 1
}

const sanity_rest = {
    "0": 0,
    "1": 5,
    "2": 10,
    "3": 20,
    "4": 25,
    "5": 30,
    "6": 35,
    "7": 40,
    "8": 45,
    "9": 50,
    "10": 75,
    "11": 100
}

const built_in_diff = {
    "3A": {
        "num_evi": 3,
        "hd": "3A",
        "ss": 100,
        "spr": 7,
        "sds": 100
    },
    "3I": {
        "num_evi": 3,
        "hd": "3I",
        "ss": 100,
        "spr": 6,
        "sds": 150
    },
    "3": {
        "num_evi": 3,
        "hd": "3",
        "ss": 100,
        "spr": 5,
        "sds": 200
    },
    "2": {
        "num_evi": 2,
        "hd": "3",
        "ss": 100,
        "spr": 4,
        "sds": 200
    },
    "1": {
        "num_evi": 1,
        "hd": "3",
        "ss": 75,
        "spr": 3,
        "sds": 200
    },
    "0": {
        "num_evi": 0,
        "hd": "3",
        "ss": 0,
        "spr": 0,
        "sds": 200
    }
}

var sanity_worker;

function set_sanity_settings(){
    toggle_sanity_drain(false, true)
    let dif = document.getElementById("num_evidence").value
    sanity = parseFloat(document.getElementById("cust_starting_sanity").value)

    if (!built_in_diff.hasOwnProperty(dif))
        return

    let setup = built_in_diff[dif]

    document.getElementById("cust_num_evidence").value = setup["num_evi"]
    document.getElementById("cust_hunt_length").value = setup["hd"]
    document.getElementById("cust_starting_sanity").value = setup["ss"]
    sanity = parseFloat(setup["ss"])
    document.getElementById("cust_sanity_pill_rest").value = setup["spr"]
    document.getElementById("cust_sanity_drain").value = setup["sds"]
    send_sanity_link(Math.round(sanity),sanity_color())
}

function toggle_sanity_drain(force_start = false, force_stop = false){

    if(force_start){
        if(!sanity_stopped){
            sanity_worker.terminate()
            start_drain()
        }
        else{
            start_drain()
        }
    }

    else if(force_stop){
        if(!sanity_stopped){
            sanity_stopped = true
            sanity_worker.terminate()
            send_sanity_link(Math.round(sanity),sanity_color())
        }
    }

    else if(!sanity_stopped){
        sanity_stopped = true
        sanity_worker.terminate()
        send_sanity_link(Math.round(sanity),sanity_color())
    }

    else{
        start_drain()
    }
}

function start_drain(){

    function drain(){

        let map_size = document.getElementById("cur_map").querySelector(".map_size").innerText
        let dif = document.getElementById("num_evidence").value
        let sds = parseFloat(document.getElementById("cust_sanity_drain").value) / 100.0
        let mp = ['solo','multiplayer'].includes(document.getElementById("cust_lobby_type").value) ? document.getElementById("cust_lobby_type").value : 'solo'

        let mult = (
            sanity_maps[map_size] *
            (sanity_difficulty[dif] || sds) *
            sanity_players[mp]
        )
        sanity -= mult
        if (sanity <= 0)
            sanity = 0
        if (sanity >= 100)
            sanity = 100

        let cursanity = Math.round(sanity)

        if (last_sanity != cursanity){
            send_sanity_link(cursanity,sanity_color())
            last_sanity = cursanity
        }
    }

    sanity_stopped = false
    send_sanity_link(Math.round(sanity),sanity_color())
    console.log("Starting sanity timer")
    const blob = new Blob([`(function(e){setInterval(function(){this.postMessage(null)},1000)})()`])
    const url = window.URL.createObjectURL(blob)
    sanity_worker = new Worker(url)
    sanity_worker.onmessage = () => {
        drain()
    }
    
}

function restore_sanity(){
    let spr = document.getElementById("cust_sanity_pill_rest").value
    sanity += sanity_rest[spr]
    if (sanity <= 0)
        sanity = 0
    if (sanity >= 100)
        sanity = 100
    send_sanity_link(Math.round(sanity),sanity_color())
}

function adjust_sanity(value){
    sanity += value
    if (sanity <= 0)
        sanity = 0
    if (sanity >= 100)
        sanity = 100
    send_sanity_link(Math.round(sanity),sanity_color())
}

function reset_sanity(){
    let ss = parseFloat(document.getElementById("cust_starting_sanity").value)
    sanity = ss
    if (sanity <= 0)
        sanity = 0
    if (sanity >= 100)
        sanity = 100
    send_sanity_link(Math.round(sanity),sanity_color())
}

function sanity_color(){
    let r = sanity <= 50 ? 'FF' : Math.round(255*(1-(sanity/100))*2).toString(16).padStart(2,'0')
    let g = sanity >= 50 ? 'FF' : Math.round(255*(sanity/100)*2).toString(16).padStart(2,'0')

    return sanity_stopped ? "#AAAAAA" : `#${r}${g}00`
}