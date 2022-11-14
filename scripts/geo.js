//
// Configuration
//

// ms to wait after dragging before auto-rotating
var rotationDelay = 3000
// scale of the globe (not the canvas element)
var scaleFactor = 0.9
// autorotation speed
var degPerSec = 8
// start angles
var angles = { x: -20, y: 40, z: 0}
// colors
var colorWater = '#000'
var colorLand = '#066770'
var colorGraticule = '#032f33'
var colorLogin = '#c9870c'
var colorDailies = '#055961'


//
// Variables
//

var current = d3.select('#current')
var canvas = d3.select('#globe')
var context = canvas.node().getContext('2d')
var water = {type: 'Sphere'}
var projection = d3.geoOrthographic().precision(0.01)
var graticule = d3.geoGraticule10()
var path = d3.geoPath(projection).context(context)
var r0 // Projection rotation as Euler angles at start.
var q0 // Projection rotation as versor at start.
var lastTime = d3.now()
var degPerMs = degPerSec / 1000
var width, height
var land, logins, dailies
var countryList
var autorotate, now, diff, roation
var currentCountry

//
// Functions
//

function setAngles() {
  var rotation = projection.rotate()
  rotation[0] = angles.y
  rotation[1] = angles.x
  rotation[2] = angles.z
  projection.rotate(rotation)
}

function scale() {
  width = $("#globe").width()
  height = $("#globe").height()
  canvas.attr('width', width).attr('height', height)
  projection
    .scale((scaleFactor * Math.min(width, height)) / 2)
    .translate([width / 2, height / 2])
  render()
}

function startRotation(delay) {
  autorotate.restart(rotate, delay || 0)
}

function render() {
  context.clearRect(0, 0, width, height)
  fill(water, colorWater)
  stroke(graticule, colorGraticule)
  fill(land, colorLand)
  fill(dailies, colorDailies)
  fill(logins, colorLogin)
}

function fill(obj, color) {
  context.beginPath()
  path(obj)
  context.fillStyle = color
  context.fill()
}

function stroke(obj, color) {
  context.beginPath()
  path(obj)
  context.strokeStyle = color
  context.stroke()
}

function rotate(elapsed) {
  now = d3.now()
  diff = now - lastTime
  if (diff < elapsed) {
    rotation = projection.rotate()
    rotation[0] += diff * degPerMs
    projection.rotate(rotation)
    if (!document.hidden || !$("#world").is(":visible")){
      render()
    }
  }
  lastTime = now
}

function loadData(cb) {
  d3.queue()
  .defer(d3.json,'https://unpkg.com/world-atlas@1/world/110m.json')
  .defer(d3.json,"https://zero-network.duckdns.org/analytics/active.json")
  .defer(d3.json,"https://zero-network.duckdns.org/analytics/daily.json")
  .await((error, world, points, points_hist) => {
    if (error) throw error
    cb(world,points,points_hist)
  });
}

function reloadData(){
    d3.queue()
    .defer(d3.json,"https://zero-network.duckdns.org/analytics/active.json")
    .defer(d3.json,"https://zero-network.duckdns.org/analytics/daily.json")
    .await((error, points, points_hist) => {
        if (error) throw error
        logins = points
        dailies = points_hist
      });
}

//
// Initialization
//

setAngles()

loadData(function(world,locations,locations_hist) {
  land = topojson.feature(world, world.objects.land)
  logins = locations
  dailies = locations_hist
  
  window.addEventListener('resize', scale)
  scale()
  autorotate = d3.timer(rotate)
})

setInterval(function(){
  if(!document.hidden){
    reloadData()
    heartbeat()
  }
}, 60000)