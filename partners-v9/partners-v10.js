

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

function updateHintDrops() {
    const area = document.getElementById('drops_info_block');
    const hint = document.getElementById('scrollHintDrops');

    if (!canScroll(area) || atBottom(area)) {
        hint.classList.add('is-hidden');
    } else {
        hint.classList.remove('is-hidden');
    }
}

function load_partners() {
    let drop_live = false
    let has_drop = false
    
    let loadPartners = new Promise((resolve, reject) => {
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
                document.getElementById('drops_info_block').addEventListener('scroll', updateHintDrops, { passive: true });
                resolve("Drops Loaded")
            },1500);
        })
        .catch(error => {
            resolve("Drops cannot be loaded")
        })
    })

    Promise.all([loadPartners, loadDrops])
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

// TWITCH

let twitchEmbed = null;
let currentChannel = null;
let resizeTimeout = null;

function openTwitch(channel) {
  $("#blackout_twitch").fadeIn(100);
  currentChannel = channel;
  createTwitchEmbed()
}

function createTwitchEmbed() {
  // Clear existing embed if any
  document.getElementById("twitch-embed").innerHTML = "";
  
  const width = window.innerWidth - 100;
  const height = window.innerHeight - 100;

  twitchEmbed = new Twitch.Embed("twitch-embed", {
    width,
    height,
    channel: currentChannel,
    parent: ["tybayn.github.io", "zero-network.net"]
  });
}

function closeTwitch() {
  $("#blackout_twitch").fadeOut(100, () => {
    document.getElementById("twitch-embed").innerHTML = "";
    twitchEmbed = null;
    currentChannel = null;
  });
}

window.addEventListener("resize", () => {
  if (!twitchEmbed) return;
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    createTwitchEmbed();
  }, 200);
})