var play,
    scene,
    camera, 
    fieldOfView, 
    sides, 
    nearObj, 
    farObj,
    renderer,
    main
var time = 0;
var newT = new Date().getTime();
var oldT = new Date().getTime();
var sphere = [];         
var elem = [];           
var elemUse = [];                
var Colors = {
  orange:0xff6f00,
  white:0xd8d0d1,
  purple:0x6600cc,
  mars:0xe65100,
  boom:0x151B54,
  block:0xF9A602
}
var HEIGHT, WIDTH, 
  position = { x: 0, y: 0 };

function mouseMove(event) {
  var xl = -1 + (event.clientX / WIDTH)*2;
  var yl = 1 - (event.clientY / HEIGHT)*2;
  position = {x:xl, y:yl};
}
function mouseTouch(event) {
    event.preventDefault();
    var xl = -1 + (event.touches[0].pageX / WIDTH)*2;
    var yl = 1 - (event.touches[0].pageY / HEIGHT)*2;
    position = {x:xl, y:yl};
  }
function mouseUp(event){
  if (play.status == "waitingReplay"){
    restartGame();
    hideRestart();
  }
}
function mouseDown(event){
  if (play.status == "waitingReplay"){
    restartGame();
    hideRestart();
  }
}

function createScene() {
  HEIGHT = window.innerHeight;
  WIDTH = window.innerWidth;
  
  scene = new THREE.Scene();
  sides = WIDTH / HEIGHT;
  fieldOfView = 70;
  nearObj = .2;
  farObj = 10050;
  camera = new THREE.PerspectiveCamera(fieldOfView, sides, nearObj, farObj);
  renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(WIDTH, HEIGHT);
  renderer.shadowMap.enabled = true;
  camera.position.x = 0;
  camera.position.y = play.objectHeight;
  camera.position.z = 250;
  main = document.getElementById('gameScene');
  main.appendChild(renderer.domElement);
}
//unknown flying Object
var flyingObject = function(){

  this.mesh = new THREE.Object3D();
  var body = new THREE.BoxGeometry(170,10,10,1,1,1);
  var matter = new THREE.MeshPhongMaterial({color:Colors.purple, shading:THREE.FlatShading});
  body.vertices[4].y-=10;
  body.vertices[4].z+=10;
  body.vertices[5].y-=10;
  body.vertices[6].y+=30;
  body.vertices[6].z+=10;
  body.vertices[7].z-=20;
  var mainBody = new THREE.Mesh(body, matter);
  mainBody.castShadow = true;
  mainBody.receiveShadow = true;
  this.mesh.add(mainBody);
  var wing = new THREE.BoxGeometry(30,5,100,0.5,0.5);
  var wingMatter = new THREE.MeshPhongMaterial({color:Colors.purple, shading:THREE.FlatShading});
  var mainWing = new THREE.Mesh(wing, wingMatter);
  mainWing.position.set(0,40,0);
  mainWing.castShadow = true;
  mainWing.receiveShadow = true;
  this.mesh.add(mainWing);

  //2nd pair of wings
  var wing2 = new THREE.BoxGeometry(100,10,100,1,1,1);
  var wingMatter2 = new THREE.MeshPhongMaterial({color:Colors.orange, shading:THREE.FlatShading});
  var mainWing2 = new THREE.Mesh(wing2, wingMatter2);
  mainWing2.position.set(0,15,0);
  mainWing2.castShadow = true;
  mainWing2.receiveShadow = true;
  this.mesh.add(mainWing2);

  //3rd pair of wings
  var wing3 = new THREE.BoxGeometry(70,5,100,1,1,1);
  var wingMatter3 = new THREE.MeshPhongMaterial({color:Colors.orange, shading:THREE.FlatShading});
  var mainWing3 = new THREE.Mesh(wing3, wingMatter3);
  mainWing3.position.set(0,35,0);
  mainWing3.castShadow = true;
  mainWing3.receiveShadow = true;
  this.mesh.add(mainWing3);
  }
//
// make the Mars
Mars = function(){
    var marsLand = new THREE.CylinderGeometry(play.marsradius,play.marsradius,play.marsLen,40,10);
    marsLand.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI/2));
    var land = marsLand.vertices.length;
    this.crater = [];
    for (var i=0;i<land;i++){
      var v = marsLand.vertices[i];
      this.crater.push({y:v.y, x:v.x, z:v.z, ang:Math.random()*Math.PI*2, amp:play.crMinSize 
      + Math.random()*(play.crMaxSize-play.crMinSize),
      speed:play.crMinSpeed + Math.random()*(play.crMaxSpeed - play.crMinSpeed)});
    };
    var matter = new THREE.MeshPhongMaterial({
      color:Colors.mars,
      transparent:true,
      opacity:.8,
      shading:THREE.FlatShading,
    });
    this.mesh = new THREE.Mesh(marsLand, matter);
    this.mesh.receiveShadow = true;
    }
    Mars.prototype.movement = function (){
    var vertices = this.mesh.geometry.vertices;
    var land = vertices.length;
    for (var i=0; i<land; i++){
      var v = vertices[i];
      var rotcrater = this.crater[i];
      v.y = rotcrater.y + Math.sin(rotcrater.ang)*rotcrater.amp;
      rotcrater.ang += rotcrater.speed*time;
      this.mesh.geometry.verticesNeedUpdate=true;
    }
    }
//
// Make crystals
    Crystal = function(){
      var geometry = new THREE.TetrahedronGeometry(5,0);
      var matter = new THREE.MeshPhongMaterial({color:0x6600cc,});
      this.mesh = new THREE.Mesh(geometry,matter);
      this.mesh.castShadow = true;}
      CrystalKeep = function (nCrystal){
      this.mesh = new THREE.Object3D();
      this.crInUse = [];
      this.crAct = [];
      for (var i=0; i<nCrystal; i++){
        var crystal = new Crystal();
        this.crAct.push(crystal);}}
      CrystalKeep.prototype.makeCr = function(){
      var nCrystal = 5 + Math.floor(Math.random()*10);
      var d = play.marsradius + play.objectHeight + (-1 + Math.random() * 3) * (play.objHeight-20);
      var amplitude = 30 + Math.round(Math.random()*20);
      for (var i=0; i<nCrystal; i++){
        var crystal;
        if (this.crAct.length) {
          crystal = this.crAct.pop();
        }else{
          crystal = new Crystal();
        }
        this.mesh.add(crystal.mesh);
        this.crInUse.push(crystal);
        crystal.angle = - (i*0.03);
        crystal.distance = d + Math.cos(i*.6)*amplitude;  
        crystal.mesh.position.x = Math.cos(crystal.angle)*crystal.distance;
      }
      }
      CrystalKeep.prototype.rotateCrystal = function(){
      for (var i=0; i<this.crInUse.length; i++){
        var crystal = this.crInUse[i];
        if (crystal.exploding) continue;
        crystal.angle += play.speed*time*play.crSpeed;
        if (crystal.angle>Math.PI*2) crystal.angle -= Math.PI*2;
        crystal.mesh.position.y = -play.marsradius + Math.sin(crystal.angle)*crystal.distance;
        crystal.mesh.position.x = Math.cos(crystal.angle)*crystal.distance;
        crystal.mesh.rotation.y += Math.random()*.1;
        var varPosision = flyingObject.mesh.position.clone().sub(crystal.mesh.position.clone());
        var d = varPosision.length();
        if (d<play.crystalDist){
          this.crAct.unshift(this.crInUse.splice(i,1)[0]);
          this.mesh.remove(crystal.mesh);
          elementsHolder.makeElement(crystal.mesh.position.clone(), 5, Colors.purple, .9);
          addFuel();
          i--;
        }else if (crystal.angle > Math.PI){
          this.crAct.unshift(this.crInUse.splice(i,1)[0]);
          this.mesh.remove(crystal.mesh);
          i--;
        }}}
//light & shadows for objects 
var light, shadowL, sphereL;
function createLights() {
sphereL = new THREE.HemisphereLight(0xaaaaaa,0x000000, .2)
light = new THREE.AmbientLight(0xdc8874, .3);
shadowL = new THREE.DirectionalLight(0xffffff, .9);
shadowL.position.set(150, 350, 350);
shadowL.castShadow = true;
shadowL.shadow.camera.left = -500;
shadowL.shadow.camera.right = 450;
shadowL.shadow.camera.top = 450;
shadowL.shadow.camera.bottom = -400;
shadowL.shadow.camera.far = 1000;
shadowL.shadow.mapSize.width = 4096;
shadowL.shadow.mapSize.height = 4096;
scene.add(sphereL);
scene.add(shadowL);
scene.add(light);
}
//creating a crashing block
Sphere = function(){
  var geometry = new THREE.TetrahedronGeometry(8,2);
  var matter = new THREE.MeshPhongMaterial({
    color:Colors.block,});
  this.mesh = new THREE.Mesh(geometry,matter);
  this.mesh.castShadow = true;
  this.angle = 0;
  this.dist = 0;
}
SphereKeep  = function (){
  this.mesh = new THREE.Object3D();
  this.sphereUsage = [];
}
SphereKeep.prototype.sphereMakes = function(){
  var nSphere = play.level;
  for (var i=0; i<nSphere; i++){
    var circle;
    if (sphere.length) {
      circle = sphere.pop();
    }else{
      circle = new Sphere();
    }
    circle.angle = - (i*0.1);
    circle.distance = play.marsradius + play. objH + (-1 + Math.random() * 2) * (play.objAlocH-20);
    circle.mesh.position.y = -play.marsradius + Math.sin(circle.angle)*circle.distance;
    circle.mesh.position.x = Math.cos(circle.angle)*circle.distance;

    this.mesh.add(circle.mesh);
    this.sphereUsage.push(circle);
  }
}
SphereKeep.prototype.rotateEnnemies = function(){
  for (var i=0; i<this.sphereUsage.length; i++){
    var circle = this.sphereUsage[i];
    circle.angle += play.speed*time*play.sphereSpeed;
    if (circle.angle > Math.PI*2) circle.angle -= Math.PI*2;
    circle.mesh.position.y = -play.marsradius + Math.sin(circle.angle)*circle.distance;
    circle.mesh.position.x = Math.cos(circle.angle)*circle.distance;
    circle.mesh.rotation.z += Math.random()*.1;
    circle.mesh.rotation.y += Math.random()*.1;
    var diffPos = flyingObject.mesh.position.clone().sub(circle.mesh.position.clone());
    var d = diffPos.length();
    if (d<play.sphereDist){
      elementsHolder.makeElement(circle.mesh.position.clone(), 15, Colors.boom, 3);
      sphere.unshift(this.sphereUsage.splice(i,1)[0]);
      this.mesh.remove(circle.mesh);
      play.objSpeedX = 100 * diffPos.x / d;
      play.pobjSpeedY = 100 * diffPos.y / d;
      light.intensity = 2;
      removeFuel();
      i--;
    }else if (circle.angle > Math.PI){
      sphere.unshift(this.sphereUsage.splice(i,1)[0]);
      this.mesh.remove(circle.mesh);
      i--;
    }
  }
}
//creating little elements 
Elements = function(){
var geometry = new THREE.TetrahedronGeometry(4,1);
var matter = new THREE.MeshPhongMaterial({
  color: Colors.purple,
});
this.mesh = new THREE.Mesh(geometry,matter);
}
Elements.prototype.explode = function(pos, color, scale){
var removing = this;
var parent = this.mesh.parent;
this.mesh.material.color = new THREE.Color(color);
this.mesh.material.needsUpdate = true;
this.mesh.scale.set(scale, scale, scale);
var target1 = pos.x + (-1 + Math.random()*2)*40;
var target2 = pos.y + (-1 + Math.random()*2)*40;
var speed = .4+Math.random()*.2;
TweenMax.to(this.mesh.rotation, speed, {x:Math.random()*12, y:Math.random()*12});
TweenMax.to(this.mesh.position, speed, {x:target1, y:target2, delay:Math.random() *.1, ease:Power2.easeOut, onComplete:function(){
    if(parent) parent.remove(removing.mesh);
    removing.mesh.scale.set(1,1,1);
    elem.unshift(removing);
  }});
}
ElementsHolder = function (){
this.mesh = new THREE.Object3D();
this.elemUse = [];
}
ElementsHolder.prototype.makeElement = function(pos, density, color, scale){
var nElement = density;
for (var i=0; i<nElement; i++){
  var element;
  if (elem.length) {
    element= elem.pop();
  }else{
    element= new Elements();
  }
  this.mesh.add(element.mesh);
  element.mesh.visible = true;
  element.mesh.position.y = pos.y;
  element.mesh.position.x = pos.x;
  element.explode(pos,color, scale);
}
}
function restartGame(){
  play = {level:1,
          levelUpdate:0,
          distanceUpdate:1000,
          speed:0,
          startSpeed:.00050,
          incrementSpeedByTime:.0000020,
          distanceUpdate:100,
          distance:0,
          speedDistance:30,
          fuel:100,
          objectHeight:150,
          objHeight:200,
          objWidth:75,
          objMove:0.007,
          objRotX:0.0008,
          objRotZ:0.0004,
          objFallSpeed:.005,
          minSpeedObj:1.5,
          maxSpeedObj:1.6,
          objSpeed:0,
          objCollDisplaceX:0,
          objCollSpeedX:0,
          objCollDisplace:0,
          objCollSpeed:0,
          marsradius:1000,
          crMinSpeed : 0.004,
          crMaxSpeed : 0.007,
          objH:100,
          objAlocH:80,
          objAlocWidth:75,
          objSpeedX:0,
          objSpeedY:0,
          marsLen:1010,
          mRotSpeed:0.010,
          crMinSize : 15,
          crMaxSize : 30,
          crystalDist:15,
          crystalVal:3,
          crSpeed:.5,
          crMake:0,
          distcr:100,
          sphereDist:10,
          sphereValue:10,
          sphereSpeed:.6,
          sphereMake:0,
          sphereOfDist:50,
          cameraFarPos:500,
          cameraNearPos:150,
          cameraSensivity:0.002,
          status : "playing",
        };
  fieldLevel.innerHTML = Math.floor(play.level);
  }
//creating create-functions
var mars;
var flyingObject;

function createFlyingObject(){
flyingObject = new flyingObject();
flyingObject.mesh.scale.set(.40,.40,.40);
flyingObject.mesh.position.y = play.objectHeight;
scene.add(flyingObject.mesh);
}
function createMars(){
mars = new Mars();
mars.mesh.position.y = -play.marsradius;
scene.add(mars.mesh);
}
function createCrystal(){
crystalKeep = new CrystalKeep(66);
scene.add(crystalKeep.mesh)
}
function createSphere(){
  for (var i=0; i<10; i++){
    var circle = new Sphere();
    sphere.push(circle);
  }
  sphereKeep = new SphereKeep();
  scene.add(sphereKeep.mesh)
}
function createElements(){
for (var i=0; i<10; i++){
  var element = new Elements();
  elem.push(element);
}
elementsHolder = new ElementsHolder();
scene.add(elementsHolder.mesh)
}
//restart the game
function restarting(){
newT = new Date().getTime();
time = newT-oldT;
oldT = newT;
if (play.status=="playing"){
  if (Math.floor(play.distance)%play.distcr == 0 && Math.floor(play.distance) > play.crMake){
    play.crMake = Math.floor(play.distance);
    crystalKeep.makeCr();
  }
  if (Math.floor(play.distance)%play.sphereOfDist == 0 && Math.floor(play.distance) > play.sphereMake){
    play.sphereMake = Math.floor(play.distance);
    sphereKeep.sphereMakes();
  }
  if (Math.floor(play.distance)%play.distanceUpdate == 0 && Math.floor(play.distance) > play.levelUpdate){
    play.levelUpdate = Math.floor(play.distance);
    play.level++;
    fieldLevel.innerHTML = Math.floor(play.level);
  }
  updateFlyingObject();
  updateDist();
  updateFuel();
  play.speed = play.startSpeed * play.objSpeed;
}else if(play.status=="gameover"){
  play.speed *= .99;
  flyingObject.mesh.rotation.z += (-Math.PI/2 - flyingObject.mesh.rotation.z)*.0002*time;
  flyingObject.mesh.rotation.x += 0.0003*time;
  play.objFallSpeed *= 1.05;
  flyingObject.mesh.position.y -= play.objFallSpeed*time;

  if (flyingObject.mesh.position.y <-200){
    showRestart();
    showScore();
    play.status = "waitingReplay";
  }
}else if (play.status=="waitingReplay"){
}
mars.mesh.rotation.z += play.speed*time;
if (mars.mesh.rotation.z > 2*Math.PI)  mars.mesh.rotation.z -= 2*Math.PI;
light.intensity += (.5 - light.intensity)*time*0.005;

crystalKeep.rotateCrystal();
sphereKeep.rotateEnnemies();
mars.movement();

renderer.render(scene, camera);
requestAnimationFrame(restarting);
}

function addFuel(){
  play.fuel += play.crystalVal;
  play.fuel = Math.min(play.fuel, 100);
  }
function updateFuel(){
  play.fuel = Math.max(0, play.fuel);
  fuel.style.right = (100-play.fuel)+"%";
  fuel.style.backgroundColor = (play.fuel<50)? "#ff6f00" : "#151B54";
  if (play.fuel <1){
    play.status = "gameover";
  }
}
  function removeFuel(){
  play.fuel -= play.sphereValue;
  play.fuel = Math.max(0, play.fuel);
  }
function updateDist(){
play.distance += play.speed*time*play.speedDistance;
fieldDistance.innerHTML = Math.floor(play.distance);
var d = 502*(1-(play.distance%play.distanceUpdate)/play.distanceUpdate);
}
function showRestart(){
  restart.style.display="block";
}
function hideRestart(){
  restart.style.display="none";
}
function hideScore(){
  totalScore.style.display="none";
}
function showScore(){
  totalScore.style.display="block";
  fieldDistance = document.getElementById("totalScore");
}
function updateFlyingObject(){
play.objSpeed = normalize(position.x,-.4,.5,play.minSpeedObj, play.maxSpeedObj);
var target2 = normalize(position.y,-.60,.60,play.objectHeight-play.objHeight, play.objectHeight+play.objHeight);
var target1 = normalize(position.x,-1,1,-play.objWidth*.6, -play.objWidth);
target1 += play.objCollDisplaceX;

play.objCollDisplace += play.objCollSpeed;
target2 += play.objCollDisplace;

flyingObject.mesh.position.y += (target2-flyingObject.mesh.position.y)*time*play.objMove;
flyingObject.mesh.position.x += (target1-flyingObject.mesh.position.x)*time*play.objMove;
flyingObject.mesh.rotation.z = (target2-flyingObject.mesh.position.y)*time*play.objRotX;
flyingObject.mesh.rotation.x = (flyingObject.mesh.position.y-target2)*time*play.objRotZ;
camera.updateProjectionMatrix ()
camera.position.y += (flyingObject.mesh.position.y - camera.position.y)*time*play.cameraSensivity;
play.objCollSpeedX += (0-play.objCollSpeedX)*time * 0.03;
play.objCollDisplaceX += (0-play.objCollDisplaceX)*time *0.01;
play.objCollSpeed += (0-play.objCollSpeed)*time * 0.03;
play.objCollDisplace += (0-play.objCollDisplace)*time *0.01;
}

function normalize(v,vmin,vmax,tmin, tmax){
var nv = Math.max(Math.min(v,vmax), vmin);
var dv = vmax-vmin;
var pc = (nv-vmin)/dv;
var dt = tmax-tmin;
var tv = tmin + (pc*dt);
return tv;
}

var fieldDistance, fuel, fieldLevel, restart, totalScore;
function init(event){
fieldDistance = document.getElementById("distance");
fuel = document.getElementById("fuelCount");
fieldLevel = document.getElementById("levelNumber");
restart = document.getElementById("restart");
totalScore = document.getElementById("totalScore");

restartGame();
createScene();
createLights();
createFlyingObject();
createSphere();
createMars();
createCrystal();
createElements();

document.addEventListener('mousemove', mouseMove, false);
document.addEventListener('touchmove', mouseTouch, false);
document.addEventListener('mouseup', mouseUp, false);
document.addEventListener('touchend', mouseDown, false);
restarting();}
window.addEventListener('load', init, false);