window.AudioContext = window.AudioContext || window.webkitAudioContext;
var context = new AudioContext();
const gainNode = context.createGain();

let stepBuffer = {}
var futureStepTime = context.currentTime
var counter = 1
var tempo = 115
var secondsPerBeat = 60 / tempo
var counterTimeValue = (secondsPerBeat / 4)
var timerID = undefined
var timerStop = undefined
var isPlaying = false;
var volume = 0.5

var step_cnt = 0
var snd_choice = 0
var prev_r = 0

gainNode.gain.value = volume
gainNode.connect(context.destination)

function loadSound(url,idx=0) {
    fetch(url)
    .then(response => response.arrayBuffer())
    .then(arrayBuffer => context.decodeAudioData(arrayBuffer))
    .then(audioBuffer => {
        if(!stepBuffer.hasOwnProperty(idx))
            stepBuffer[idx]=[]
        stepBuffer[idx].push(audioBuffer);
    })
}

function playStep(time) {
    gainNode.gain.value = volume
    if(step_cnt > 2){
        var r = Math.round(Math.random() * (stepBuffer[snd_choice].length-1))
        if(prev_r != r){
            prev_r = r
            step_cnt = 0
        }
    }
    else{
        step_cnt += 1
    }
    let source = context.createBufferSource();
    source.connect(gainNode);
    source.buffer = stepBuffer[snd_choice][prev_r];
    source.start(context.currentTime + time);
}

function scheduleStep(time) {
    playStep(time)
}

function playTick() {
    secondsPerBeat = 60 / tempo;
    counterTimeValue = (secondsPerBeat / 1);
    counter += 1;
    futureStepTime += counterTimeValue;
}

function scheduler() {
    if (futureStepTime < context.currentTime + 0.1) {
        scheduleStep(futureStepTime - context.currentTime);
        playTick();
    }
    timerID = window.setTimeout(scheduler, 0);
}

function step() {
    isPlaying = !isPlaying;

    if (isPlaying) {
        counter = 1;
        futureStepTime = context.currentTime;
        scheduler();
    } else {
        window.clearTimeout(timerID);
        window.clearTimeout(timerStop);
    }
}