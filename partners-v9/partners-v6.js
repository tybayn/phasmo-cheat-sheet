

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
    fetch("https://zero-network.net/zn/partners.html", {signal: AbortSignal.timeout(6000)})
    .then(data => data.text())
    .then(data => {
        setTimeout(() => {
            document.getElementById('partner_info_block').innerHTML = data
            if(data.includes("LIVE NOW!")){
                $("#partner-tab").addClass("partner-live")
            }
            document.getElementById('partner_info_block').addEventListener('scroll', updateHint, { passive: true });
            setTimeout(()=>{updateHint()},250)
        },1500);
    })
    .catch(error => {
        // Om nom nom
    })

    fetch("https://zero-network.net/zn/drops.html", {signal: AbortSignal.timeout(6000)})
    .then(data => data.text())
    .then(data => {
        setTimeout(() => {
            if(data != "")
                document.getElementById('drops_info_block').innerHTML = data
        },1500);
    })
    .catch(error => {
        // Om nom nom
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