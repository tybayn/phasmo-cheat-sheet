const MQUERY = window.matchMedia("screen and (pointer: coarse) and (max-device-width: 600px)")

let lastTap = 0;
function doubleTap(callback, event, elem, ms = 500) {
  const now = Date.now();
  if (now - lastTap < ms) {
    lastTap = 0;
    callback(elem);
  } else {
    lastTap = now;
  }
}

function toggleGhostExpand(elem){

    let behavior = $(elem).siblings(".ghost_behavior")
    let touch_info = $(elem).hasClass("ghost_expand") ? $(elem) : $($(elem).siblings(".ghost_expand")[0])

    if(behavior.css("height") == "0px"){
        behavior[0].style.height = `${behavior[0].scrollHeight + 5}px`
        touch_info.siblings(".ghost_hunt_info")[0].style.height = "100px"
        touch_info.html(`▲ ${lang_data["{{show_less}}"]} ▲`)
    }
    else{
        touch_info.siblings(".ghost_behavior").css("height", "0px")
        touch_info.siblings(".ghost_hunt_info").css("height", "0px")
        $(".ghost_expand").html(`▼ ${lang_data["{{show_more}}"]} ▼`)
    }
    updateScaling()

}

function expandAll(){
    let bevs = document.getElementsByClassName("ghost_behavior")
    for(let i = 0; i < bevs.length; i++){
        bevs[i].style.height = `${bevs[i].scrollHeight + 5}px`
    }
    $(".ghost_hunt_info").css("height", "100px")
    $(".ghost_expand").html(`▲ ${lang_data["{{show_less}}"]} ▲`)
    updateScaling()
}

function collapseAll(){
    $(".ghost_behavior").css("height", "0px")
    $(".ghost_hunt_info").css("height", "0px")
    $(".ghost_expand").html(`▼ ${lang_data["{{show_more}}"]} ▼`)
    updateScaling()
}

function updateScaling() {
    if(MQUERY.matches){
        const container = document.querySelector('#cards');
        const items = [...container.querySelectorAll('.ghost_card')];
        const containerRect = container.getBoundingClientRect();
        const center = containerRect.top + containerRect.height / 3;

        items.forEach(el => {
            const rect = el.getBoundingClientRect();
            const elCenter = rect.top + rect.height / 3;

            const distance = Math.max(0, Math.abs(center - elCenter) - 50);
            const maxDistance = containerRect.height / 3;

            const factor = Math.min(distance / maxDistance, 1);

            const scale = 1 - factor * 0.05;
            const opacity = 1 - factor * 0.25;

            el.style.transform = `scale(${scale})`;
            el.style.opacity = opacity;
        });
    }
}

const OPEN = window.innerHeight * 0.25;
const WOPEN = 0;

function openMenu() {
    const tab = document.getElementById('menu_tab');
    document.getElementById('menu').style.top = `${OPEN}px`;
    tab.innerHTML = "▼ ▼ ▼";
}

function closeMenu() {
    const tab = document.getElementById('menu_tab');
    const CLOSED = window.innerHeight;
    document.getElementById('menu').style.top = `${CLOSED}px`;
    tab.innerHTML = "▲ ▲ ▲";
}

function toggleMenu() {
    const tab = document.getElementById('menu_tab');
    if(tab.innerHTML.includes("▼")){
        closeMenu();
    }
    else{
        openMenu();
    }
}

let dragging = false;
let startX = 0, startY = 0;
let lastMoveX = 0, lastMoveY = 0;
let startLeft = 0;
let startTop = 0;
let lastMoveTime = 0;
const DRAG_THRESHOLD = 8; // minimum movement to start drag
const SWIPE_DISTANCE = 50;
const SWIPE_VELOCITY = 0.3;
const HORIZONTAL_SWIPE_DISTANCE = 120; // require more distance for horizontal swipes
const VERTICAL_SWIPE_DISTANCE = 40; // reduced for easier swipe down triggering
const DIRECTION_THRESHOLD = 15; // reduced back to prevent missing swipes

// MENU TAB
function menuTabDown(e) { 
    const menu = document.getElementById('menu'); 
    const tab = document.getElementById('menu_tab'); 
    dragging = true; 
    startY = e.clientY; 
    startTop = menu.getBoundingClientRect().top; 
    menu.style.transition = 'none'; 
    tab.setPointerCapture(e.pointerId); 
} 

function menuTabMove(e) { 
    if (!dragging) return; 
    const menu = document.getElementById('menu'); 
    const tab = document.getElementById('menu_tab'); 
    const CLOSED = window.innerHeight; 
    const y = e.clientY; 
    const delta = y - startY; 
    let nextTop = startTop + delta; 
    nextTop = Math.max(OPEN, Math.min(CLOSED, nextTop)); 
    menu.style.top = `${nextTop}px`; // direction arrow UI 
    const midpoint = (OPEN + CLOSED) / 2; 
    tab.innerHTML = nextTop < midpoint ? "▼ ▼ ▼" : "▲ ▲ ▲"; // store movement for velocity 
    lastMoveY = y; 
    lastMoveTime = performance.now(); 
}

function menuTabEnd(e) { 
    if (!dragging) return; 
    dragging = false; 
    const menu = document.getElementById('menu'); 
    const CLOSED = window.innerHeight; 
    menu.style.transition = 'top 0.25s cubic-bezier(.22,.61,.36,1)'; 
    const top = menu.getBoundingClientRect().top; 
    const midpoint = (OPEN + CLOSED) / 2; 
    const dy = lastMoveY - startY; 
    const dt = performance.now() - lastMoveTime; 
    const velocity = dy / dt; // px per ms 
 
    // flick detection (tune threshold as needed) 
    if (velocity < -0.35) return openMenu(); 
    if (velocity > 0.35) return closeMenu();
    
    // fallback → midpoint logic 
    if (top < midpoint) openMenu(); 
    else closeMenu(); 
}

// SETTINGS TAB
function tabDown(e,block) { 
    if(!MQUERY.matches) return;
    const menu = document.getElementById(`${block}_box`); 
    const tab = document.getElementById(`${block}_tab`); 
    dragging = true; 
    menu.style.zIndex = "1000"
    startX = e.clientX; 
    startLeft = menu.getBoundingClientRect().left; 
    menu.style.transition = 'none'; 
    tab.setPointerCapture(e.pointerId); 
} 

function tabMove(e,block) { 
    if (!dragging) return; 
    if(!MQUERY.matches) return;
    const menu = document.getElementById(`${block}_box`);  
    const CLOSED = -document.getElementById(`${block}_box`).clientWidth; 
    const x = e.clientX; 
    const delta = x - startX; 
    let nextLeft = startLeft + delta; 
    nextLeft = Math.min(WOPEN, Math.max(CLOSED, nextLeft)); 
    menu.style.left = `${nextLeft}px`
    lastMoveTime = performance.now(); 
}

function tabEnd(e,block) { 
    if (!dragging) return; 
    if(!MQUERY.matches) return;
    dragging = false; 
    const menu = document.getElementById(`${block}_box`); 
    const CLOSED = document.getElementById(`${block}_box`).clientWidth; 
    menu.style.transition = 'left 0.25s cubic-bezier(.22,.61,.36,1)'; 
    const left = menu.getBoundingClientRect().left; 
    const midpoint = (OPEN + CLOSED) / 2; 
    const dx = lastMoveX - startX; 
    const dt = performance.now() - lastMoveTime; 
    const velocity = dx / dt; // px per ms 
 
    // flick detection (tune threshold as needed) 
    if (velocity < -0.35) return showSideMenu(block,true); 
    if (velocity > 0.35) return showSideMenu(block,false);
    
    // fallback → midpoint logic 
    if (left < midpoint) showSideMenu(block,true); 
    else showSideMenu(block,false);
}


// ^^^ Menu Tab Dragging Logic ^^^ (Working, do not touch unless you know what you're doing) ^^^
// vvv Menu Swipe Logic vvv


let x0 = null;
let y0 = null;

function lock(e) {
    x0 = e.changedTouches[0].clientX;
    y0 = e.changedTouches[0].clientY;
}

function move(e,directions) {
    if (x0 === null || y0 === null) return;
    if (dragging) return; // prevent swipe actions while dragging

    let dx = e.changedTouches[0].clientX - x0;
    let dy = e.changedTouches[0].clientY - y0;
    let absDx = Math.abs(dx);
    let absDy = Math.abs(dy);

    // Directions is a object where the keys are strings 'left', 'right', 'up', 'down' and the values 
    // are an array where the first element is a function to call and the second element is an array of parameters to pass to that function
    // example : {"left": [myFunc,[params]], "down": [myFunc2,[params2]]}

    if (Math.max(absDx, absDy) > 150) {
        if (absDx > absDy) {
            if(dx > 0 && directions.right){
                directions.right[0](...directions.right[1]);
            }
            else if(dx < 0 && directions.left){
                directions.left[0](...directions.left[1]);
            }
        } else {
            if(dy > 0 && directions.down){
                directions.down[0](...directions.down[1]);
            }
            else if(dy < 0 && directions.up){
                directions.up[0](...directions.up[1]);
            }
        }
    }
 
    x0 = null;
    y0 = null;
}
