

var windowW = window.innerWidth, windowH = Math.max(600, window.innerHeight);





window.onload = function(){
  var webgl = new Webgl();
  var audio = new Audio(webgl);
}




class Audio{
    constructor(_webgl){
        this.webgl = _webgl;
        this.source = null;
        this.audioContext = (window.AudioContext) ? new AudioContext : new webkitAudioContext;
        this.fileReader  = new FileReader;
        this.init();
        this.isReady = false;
        this.count = 0;
        this.render();
    }
  
  init(){
    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 2048;
    this.analyser.minDecibels = -70;
    this.analyser.maxDecibels = 10;
    this.analyser.smoothingTimeConstant = .75;

  
    
    document.getElementById('file').addEventListener('change', function(e){
        this.fileReader.readAsArrayBuffer(e.target.files[0]);
        e.target.display = none;
      }.bind(this));
      
      var _this = this;
      
      this.fileReader.onload = function(){
        _this.audioContext.decodeAudioData(_this.fileReader.result, function(buffer){
          if(_this.source) {
            _this.source.stop();
          }
          _this.source = _this.audioContext.createBufferSource();
          _this.source.buffer = buffer;
          
          _this.source.loop = true;
  
          _this.source.connect(_this.analyser);
  
          _this.gainNode = _this.audioContext.createGain();
  
          _this.source.connect(_this.gainNode);
          _this.gainNode.connect(_this.audioContext.destination);
          _this.source.start(0);
          
          _this.frequencyArray = _this.webgl.sphereG.attributes.aFrequency.array;
          _this.indexPosArray = _this.webgl.indexPosArray;
          _this.indexPosLength = _this.webgl.indexPosArray.length;
          _this.isReady = true;
        });
      };
    }
  
  _render(){
    if(!this.isReady) return;
    this.count++;
    
    this.spectrums = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(this.spectrums);
    
    var num, mult, frequency, maxNum = 255, frequencyAvg = 0;
    
    for(var i = 0; i < this.indexPosLength; i++){
      mult = Math.floor(i / maxNum);
      
      if(mult % 2 === 0){
        num = i - maxNum * mult;
      } else {
        num = maxNum - (i - maxNum * mult);
      }
      
      var spectrum = (num > 150) ? 0 : this.spectrums[num + 20];
      frequencyAvg += spectrum * 1.2;

        var indexPos = this.indexPosArray[i];
        spectrum = Math.max(0, spectrum - i/80);
        
        for(var j = 0, len = indexPos.length; j < len; j++){
          var vectorNum = indexPos[j];
          this.frequencyArray[vectorNum] = spectrum;
        }
    }
    
    frequencyAvg /= this.indexPosLength;
    frequencyAvg*= 1.7;
    this.webgl.sphereM.uniforms["uScale"].value = this.webgl.sphereM_2.uniforms["uScale"].value = frequencyAvg * 1.7;
    this.webgl.sphereM.uniforms["uTime"].value += 0.015;
    
    this.webgl.mesh_2.scale.x = 1 + frequencyAvg / 290;
    this.webgl.mesh_2.scale.y = 1 + frequencyAvg / 290;
    this.webgl.mesh_2.scale.z = 1 + frequencyAvg / 290;
    
  }
  
  render(){
    this._render();
    this.webgl.render();
    requestAnimationFrame(this.render.bind(this))
    

  }
}

class Webgl{
  constructor(){
    this.scene = new THREE.Scene();
    

    this.camera = new THREE.PerspectiveCamera(45, windowW / windowH, 0.1, 1000);
    // this.camera.position.set(20, 200, -80);
    this.camera.position.z = 20


    const canvas = document.querySelector("#c");
    
    // this.camera.lookAt(this.scene.position);
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      canvas,
      alpha: true
    });
    
    this.renderer.setPixelRatio(1.5);
    
    // this.renderer.setClearColor(0x20c5d4, 0);
    this.renderer.setSize(windowW, windowH);
    var div = document.getElementById("wrapper");
    div.appendChild(this.renderer.domElement);
    div.style.width = windowW + "px";
    div.style.height = window.innerHeight + "px";
    
    this.renderer.domElement.style.width = windowW + "px";
    this.renderer.domElement.style.height = windowH + "px";
    
    
    
    var controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
    this.windowW = windowW;
    this.windowH = window.innerHeight;
    
    this.mouse = {
      x: 0,
      y: 0,
      old_x: 0,
      old_y : 0
    }
    
//     document.addEventListener( 'mousemove', function(event){
//       this.mouse.old_x = this.mouse.x;
//       this.mouse.old_y = this.mouse.y;
      
//       this.mouse.x = event.clientX - this.windowW / 2;
//       this.mouse.y = event.clientY - this.windowH / 2;
//     }.bind(this), false );


    
    window.onresize = function() {
      this.windowW = document.body.clientWidth;
      this.windowH = window.innerHeight;
      var _height = Math.max(600, this.windowH);
      this.renderer.setSize(this.windowW, _height);
      this.camera.aspect = this.windowW / _height;
      this.camera.updateProjectionMatrix();
      
      div.style.width = this.windowW + "px";
      div.style.height = window.innerHeight + "px";
      
    }.bind(this);
    
    this.createSphere();
    this.createSphereLeft();
    this.createSphereRight();

    this.renderer.render(this.scene, this.camera);
    
    
}

createSphereLeft(){
    this.geometry = new THREE.SphereGeometry(32, 50, 50)
    
    this.material = new THREE.PointsMaterial({
        color: '#c472ba',
        sizeAttenuation: false,
        size: 3,
    });

    this.sphereL = new THREE.Points(this.geometry, this.material)
    this.sphereL.position.x = -70


    this.scene.add(this.sphereL);

}

createSphereRight(){
  this.geometry = new THREE.SphereGeometry(32, 50, 50)
  
  this.material = new THREE.PointsMaterial({
      color: '#e1cedb',
      sizeAttenuation: false,
      size: 3,
  });

  this.sphereR = new THREE.Points(this.geometry, this.material)
  this.sphereR.position.x = 70

  this.scene.add(this.sphereR);

}

  
  createSphere(){
    this.createShader();
    
    this.sphereG = new THREE.IcosahedronBufferGeometry(40, 4);
    this.sphereM = new THREE.ShaderMaterial({
      vertexShader: this.vertex,
      fragmentShader: this.fragment,
      uniforms: {
        uTime: {type: "f", value: 0},
        uScale: {type: "f", value: 0},
        isBlack : {type: "i", value: 1}
        
      },
      wireframe: true,
      transparent: true,
      flatShading: false
    });

    
    this.sphereM.flatShading = false;
    
    this.detectIndex();
    this.sphereG.addAttribute("aFrequency", new THREE.BufferAttribute(new Float32Array(this.indexArray.length), 1));
    
    this.mesh = new THREE.Mesh(this.sphereG, this.sphereM);
    
    this.scene.add(this.mesh);
    
    this.createSphere2();
  }
  
  
  createSphere2(){
    this.sphereG_2 = new THREE.IcosahedronBufferGeometry(20, 2);
    this.sphereG_2.addAttribute("aFrequency", new THREE.BufferAttribute(new Float32Array(this.indexArray.length), 1));
    this.sphereM_2 =  new THREE.ShaderMaterial({
      vertexShader: this.vertex_2,
      fragmentShader: this.fragment_2,
      uniforms: {
        uScale: {type: "f", value: 0},
        isBlack: {type: "i", value: 1}
      },

      
      flatShading: true
    });
    

    this.mesh_2 = new THREE.Mesh(this.sphereG_2, this.sphereM_2);
    this.scene.add(this.mesh_2);
  }
  
  
  detectIndex(){
    this.verticesArray = this.sphereG.attributes.position.array;
    var arrayLength = this.verticesArray.length;
    
    this.vecCount = 0;
    this.indexCount = 0;
    this.vec3Array = [];
    this.allVec3Array = [];
    this.indexArray = [];
    this.indexPosArray = []; 
    this.frequencyNumArray = [];
    
    for(var i = 0; i < arrayLength; i+= 3){
      var vec3 = {};
      vec3.x = this.verticesArray[i];
      vec3.y = this.verticesArray[i + 1];
      vec3.z = this.verticesArray[i + 2];
      var detect = this.detectVec(vec3);
      this.allVec3Array.push(vec3);
      
      if(detect === 0 || detect > 0){
        this.indexArray[this.indexCount] = detect;
        this.indexPosArray[detect].push(this.indexCount);
        
      } else {
        this.vec3Array[this.vecCount] = vec3;
        this.indexArray[this.indexCount] = this.vecCount;
        
        this.indexPosArray[this.vecCount] = [];
        this.indexPosArray[this.vecCount].push(this.indexCount);
        
        this.vecCount++;
        
      }

      this.indexCount++;
    }
  }
  
  
  detectVec(vec3){
    if(this.vecCount === 0) return false;
  
    for(var i = 0, len = this.vec3Array.length; i < len; i++){
      var _vec3 = this.vec3Array[i];
      var isExisted = vec3.x === _vec3.x && vec3.y === _vec3.y && vec3.z === _vec3.z;
      if(isExisted) {
        return i;
      }
    }

    return false;
  }
  
  createShader(){
    this.vertex = [
      "uniform float uTime;",
      "uniform float uScale;",
      
      "attribute float aFrequency;",
      "varying float vFrequency;",
      "varying float vPos;",
      
      
      "const float frequencyNum = 256.0;",
      "const float radius = 40.0;",
      "const float PI = 3.14159265;",
      "const float _sin15 = sin(PI / 10.0);",
      "const float _cos15 = cos(PI / 10.0);",
      
      "void main(){",
      
      "float frequency;",
      "float SquareF = aFrequency * aFrequency;",
      
      "frequency = smoothstep(16.0, 7200.0, SquareF) * SquareF / (frequencyNum * frequencyNum);",
      
      "vFrequency = frequency;",
      
      "float _uScale = (1.0 - uScale * 0.5 / frequencyNum) * 3.0;",
      
      "float _sin = sin(uTime * .5);",
      "float _cos = cos(uTime * .5);",
      
      
      "mat2 rot = mat2(_cos, -_sin, _sin, _cos);",
      "mat2 rot15 = mat2(_cos15, -_sin15, _sin15, _cos15);",
      
      "vec2 _pos = rot * position.xz;",
      "vec3 newPos = vec3(_pos.x, position.y, _pos.y);",
      "newPos.xy = rot15 * newPos.xy;",
      
      "newPos = (1.0 + uScale / (frequencyNum * 2.0) ) * newPos;",
      
      "vPos = (newPos.x + newPos.y + newPos.z) / (3.0 * 120.0);",
      
      
      "gl_Position = projectionMatrix * modelViewMatrix * vec4(newPos + vFrequency * newPos * _uScale, 1.0);",
      "}"
    ].join("\n");
    
    this.fragment = [
      "uniform float uTime;",
      "uniform float uScale;",
      
      "uniform int isBlack;",
      
      "varying float vFrequency;",
      "varying float vPos;",
      
      "const float frequencyNum = 256.0;",
      "const vec3 baseColor = vec3(0.95, 0.25, 0.3);",
      // "const vec3 baseColor = vec3(0.0, 0.65, 0.7);",
      
      
      
      "void main(){",
      "float f = smoothstep(0.0, 0.00002, vFrequency * vFrequency) * vFrequency;",
      "float red = min(1.0, baseColor.r + f * 1.9);",
      "float green = min(1.0, baseColor.g + f * 3.6);",
      "float blue = min(1.0, baseColor.b + f* 0.01);",
      "float sum = red + blue + green;",

      "blue = min(1.0, blue + 0.3);",
      "green = max(0.0, green - 0.1);",
      
      "float offsetSum = (sum - (red + blue + green) / 3.0) / 3.0;",
      
      "blue += offsetSum + min(vPos * 2.0, -0.2);",
      "red += offsetSum + min(vPos * 0.5, 0.2);",
      "green += offsetSum - vPos * max(0.3, vFrequency * 2.0);",
      
      "vec3 color;",

      "color = vec3(red, green, blue);",
      
      
      "gl_FragColor = vec4(color, 1.0);",
      "}"
    ].join("\n");
    
    //color: 0xff6673,
    this.vertex_2 = [
      "varying vec3 vPosition;",
      
      "void main(){",
      "vPosition = position;",
      "gl_Position =projectionMatrix * modelViewMatrix * vec4(position, 1.0);", 
      "}"
    ].join("\n");
    this.fragment_2 = [
      "uniform float uScale;",
      "uniform int isBlack;",
      
      
      "varying vec3 vPosition;",
      "const float frequencyNum = 256.0;",
      
      "const float radius = 40.0;",
      "const vec3 baseColor = vec3(1.0, 102.0 / 255.0, 115.0 / 255.0);",
      // "const vec3 baseColor = vec3(0.1, 0.8, 0.9);",
      
      
      
      
      "void main(){",
      "vec3 pos = vec3(vPosition.x, -vPosition.y, vPosition.z) / (radius * 10.0) + 0.05;",
      
      "vec3 _color;",

      "_color = baseColor + pos;",
      
      // "float _uScale = uScale / (frequencyNum * 5.0);",
      
      "gl_FragColor = vec4(_color, 1.0);",
      "}"
      
    ].join("\n")
  }
  



  render(){
    this.sphereG.attributes.aFrequency.needsUpdate = true;
    // requestAnimationFrame(render);

    this.sphereL.rotation.x += 0.005;
    this.sphereL.rotation.y += 0.005;

    this.sphereR.rotation.x += 0.005;
    this.sphereR.rotation.y += 0.005;


    // var d = this.mouse.x - this.mouse.old_x;
    // var theta = d * 0.1;
    // var sin = Math.sin(theta);
    // var cos = Math.cos(theta);
    
    // var x = this.camera.position.x;
    // var z = this.camera.position.z;
    
    
    // this.camera.position.x = x * cos - z * sin;
   //  this.camera.position.z = x * sin + z * cos;

    // this.camera.lookAt( this.scene.position );
    
    this.renderer.render(this.scene, this.camera);
    this.renderer.autoClear = false;
    
    
  }

  
}




