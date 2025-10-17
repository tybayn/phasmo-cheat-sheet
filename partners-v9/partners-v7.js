

function canScroll(el) {
    // Allow a 1px fudge factor for sub-pixel rounding
    return Math.ceil(el.scrollHeight) - 1 > el.clientHeight;
}

function atBottom(el) {
    return el.scrollTop + el.clientHeight >= el.scrollHeight - 1;
}

function updateHint() {
    const area = document.getElementById('partner_info_block');
    const hint = document.getElementById('scrollHint');

    if (!canScroll(area) || atBottom(area)) {
        hint.classList.add('is-hidden');
    } else {
        hint.classList.remove('is-hidden');
    }
}

function load_partners() {
    let drop_live = false
    let has_drop = false
    
    let loadPartners= new Promise((resolve, reject) => {
        fetch("https://zero-network.net/zn/partners.html", {signal: AbortSignal.timeout(6000)})
        .then(data => data.text())
        .then(data => {
            setTimeout(() => {
                document.getElementById('partner_info_block').innerHTML = data
                if(data.includes("LIVE NOW!")){
                    $("#partner-tab").addClass("partner-live")
                    if(data.includes("partner_drops_icon")){
                        drop_live = true
                    }
                }
                document.getElementById('partner_info_block').addEventListener('scroll', updateHint, { passive: true });
                setTimeout(()=>{updateHint()},250)
                resolve("Partners Loaded")
            },1500);
        })
        .catch(error => {
            resolve("Partners cannot be loaded")
        })
    })

    let loadDrops = new Promise((resolve, reject) => {
        fetch("https://zero-network.net/zn/drops.html", {signal: AbortSignal.timeout(6000)})
        .then(data => data.text())
        .then(data => {
            setTimeout(() => {
                if(data != "")
                    document.getElementById('drops_info_block').innerHTML = data
                if (data.includes("LIVE!")){
                    has_drop = true
                    $("#partner-tab").addClass("drop-active")
                }
                resolve("Drops Loaded")
            },1500);
        })
        .catch(error => {
            resolve("Drops cannot be loaded")
        })
    })

    Promise.all([loadPartners(), loadDrops()])
    .then(() => {
        if(has_drop && drop_live){
            $("#partner-tab").addClass("live_drops")
        }
    })

    // Update on resize of the container or its content
    const area = document.getElementById('partner_info_block');
    const resizeObs = new ResizeObserver(updateHint);
    resizeObs.observe(area);
    const mutationObs = new MutationObserver(() => {
        requestAnimationFrame(updateHint);
    });
    mutationObs.observe(area, { childList: true, subtree: true, characterData: true });
}