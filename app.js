const canvas = document.getElementById("c")
const ctx = canvas.getContext("2d")

let p1 = {x:200,y:200}
let p2 = {x:440,y:200}

const minDist = 308
const maxDist = minDist + 200

let drag = null

canvas.addEventListener("mousedown",e=>{
const r=canvas.getBoundingClientRect()
const x=e.clientX-r.left
const y=e.clientY-r.top

if(dist(x,y,p1.x,p1.y)<20) drag="p1"
if(dist(x,y,p2.x,p2.y)<20) drag="p2"
})

window.addEventListener("mouseup",()=>drag=null)

canvas.addEventListener("mousemove",e=>{
if(!drag)return

const r=canvas.getBoundingClientRect()
const x=e.clientX-r.left
const y=e.clientY-r.top

if(drag==="p1"){p1.x=x;p1.y=y}
if(drag==="p2"){p2.x=x;p2.y=y}

limitDistance()
})

function dist(ax,ay,bx,by){
return Math.hypot(ax-bx,ay-by)
}

function limitDistance(){

let d=dist(p1.x,p1.y,p2.x,p2.y)

if(d<minDist||d>maxDist){

let angle=Math.atan2(p2.y-p1.y,p2.x-p1.x)

let newDist=Math.max(minDist,Math.min(maxDist,d))

p2.x=p1.x+Math.cos(angle)*newDist
p2.y=p1.y+Math.sin(angle)*newDist

}
}

function drawSpring(x1,y1,x2,y2){

const coils=12
const amp=6

let dx=(x2-x1)/coils
let dy=(y2-y1)/coils

ctx.beginPath()
ctx.moveTo(x1,y1)

for(let i=1;i<coils;i++){

let px=x1+dx*i
let py=y1+dy*i

let ang=Math.atan2(y2-y1,x2-x1)+Math.PI/2
let off=i%2?amp:-amp

ctx.lineTo(px+Math.cos(ang)*off,py+Math.sin(ang)*off)

}

ctx.lineTo(x2,y2)
ctx.strokeStyle="#444"
ctx.lineWidth=4
ctx.stroke()

}

function drawDynamometer(x,y,angle){

ctx.save()
ctx.translate(x,y)
ctx.rotate(angle)

ctx.fillStyle="#333"
ctx.fillRect(-80,-12,160,24)

ctx.fillStyle="white"
ctx.font="18px Arial"
ctx.textAlign="center"
ctx.fillText("10 N",0,6)

ctx.restore()

}

function drawHandle(x,y,color){

let g=ctx.createRadialGradient(x,y,3,x,y,18)
g.addColorStop(0,"white")
g.addColorStop(1,color)

ctx.fillStyle=g
ctx.beginPath()
ctx.arc(x,y,18,0,Math.PI*2)
ctx.fill()

}

function draw(){

ctx.clearRect(0,0,640,400)

let cx=(p1.x+p2.x)/2
let cy=(p1.y+p2.y)/2
let angle=Math.atan2(p2.y-p1.y,p2.x-p1.x)

drawSpring(p1.x,p1.y,cx,cy)
drawSpring(cx,cy,p2.x,p2.y)

drawDynamometer((p1.x+cx)/2,(p1.y+cy)/2,angle)
drawDynamometer((p2.x+cx)/2,(p2.y+cy)/2,angle)

drawHandle(p1.x,p1.y,"red")
drawHandle(p2.x,p2.y,"blue")

requestAnimationFrame(draw)

}

draw()
