// 3D preview is intentionally self-contained; Three.js is loaded from a public CDN.
export async function initStore3D(container) {
  if (!container || container.dataset.threeReady) return;
  container.dataset.threeReady = "1";
  try {
    const THREE = await import("https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js");
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#263a34");
    scene.fog = new THREE.Fog("#263a34", 13, 30);
    const camera = new THREE.PerspectiveCamera(43, 1, 0.1, 100);
    camera.position.set(8, 7, 11);
    camera.lookAt(0, 1, 0);
    const renderer = new THREE.WebGLRenderer({antialias:true, alpha:false});
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.8));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    renderer.domElement.className = "three-canvas";
    container.appendChild(renderer.domElement);
    container.classList.add("three-active");
    const hemi = new THREE.HemisphereLight(0xdce8df, 0x343c35, 2.0); scene.add(hemi);
    const sun = new THREE.DirectionalLight(0xffedcf, 3.0); sun.position.set(5,10,6); sun.castShadow=true; scene.add(sun);
    const fill = new THREE.PointLight(0xc5e0ff, 22, 16); fill.position.set(-4,4,-3); scene.add(fill);
    const mat = (color, roughness=.82)=>new THREE.MeshStandardMaterial({color,roughness});
    const floor = new THREE.Mesh(new THREE.BoxGeometry(14,.25,12),mat("#a9a995")); floor.position.y=-.15; floor.receiveShadow=true; scene.add(floor);
    const back = new THREE.Mesh(new THREE.BoxGeometry(14,4,.2),mat("#59685d")); back.position.set(0,1.9,-5.8); back.receiveShadow=true; scene.add(back);
    const side = new THREE.Mesh(new THREE.BoxGeometry(.2,4,12),mat("#43544a")); side.position.set(-6.9,1.9,0); scene.add(side);
    const shelfMat=mat("#5d4935"), shelfTop=mat("#b59a6b"), productMats=["#d7bd71","#6e9b77","#d8d7c8","#b87457","#7898a7"].map(c=>mat(c,.48));
    function box(w,h,d,material,x,y,z,shadow=true){const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material);mesh.position.set(x,y,z);mesh.castShadow=shadow;mesh.receiveShadow=true;scene.add(mesh);return mesh;}
    for(let row=0;row<2;row++){
      const z=-3.7+row*2.3;
      box(4.5,2.2,.24,shelfMat,-1.5,1.05,z);
      for(let level=0;level<4;level++){
        box(4.45,.08,.65,shelfTop,-1.5,.28+level*.52,z+.3);
        for(let k=0;k<9;k++){
          const x=-3.55+k*.51;
          const height=.22+(k%3)*.045;
          box(.25,height,.25,productMats[(k+level+row)%productMats.length],x,.42+level*.52+height/2,z+.28,false);
        }
      }
    }
    // Checkout counter and terminal
    box(2.4,1,.85,mat("#705b43"),2.9,.5,1.5);
    box(.55,.09,.42,mat("#252d2b"),2.8,1.06,1.5);
    box(.35,.45,.3,mat("#26332f"),3.45,1.2,1.5);
    // Ceiling lamps
    for(const x of [-3,0,3]){box(1.25,.07,.42,mat("#f6edce"),x,3.8,-1);const lamp=new THREE.PointLight(0xfff0cf,12,7);lamp.position.set(x,3.45,-1);scene.add(lamp);}
    // A few simple shopper silhouettes
    const skin=mat("#c49b7b"), clothes=[mat("#6b8f78"),mat("#7d8999"),mat("#b17d58")];
    function person(x,z,color){const body=new THREE.Mesh(new THREE.CylinderGeometry(.19,.25,.8,8),color);body.position.set(x,.65,z);body.castShadow=true;scene.add(body);const head=new THREE.Mesh(new THREE.SphereGeometry(.16,10,8),skin);head.position.set(x,1.16,z);head.castShadow=true;scene.add(head);}
    person(2.0,-.4,clothes[0]);person(4.1,-1.0,clothes[1]);person(.4,2.7,clothes[2]);
    const resize=()=>{const w=Math.max(1,container.clientWidth),h=Math.max(1,container.clientHeight);camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h,false);};
    resize();const observer=new ResizeObserver(resize);observer.observe(container);
    let down=false,lastX=0,lastY=0,rot=0,tilt=0;
    renderer.domElement.addEventListener("pointerdown",e=>{down=true;lastX=e.clientX;lastY=e.clientY;renderer.domElement.setPointerCapture(e.pointerId);});
    renderer.domElement.addEventListener("pointermove",e=>{if(!down)return;rot+=(e.clientX-lastX)*.008;tilt=Math.max(-.2,Math.min(.5,tilt+(e.clientY-lastY)*.004));lastX=e.clientX;lastY=e.clientY;});
    renderer.domElement.addEventListener("pointerup",()=>down=false);
    renderer.domElement.addEventListener("pointercancel",()=>down=false);
    renderer.domElement.addEventListener("wheel",e=>{e.preventDefault();camera.position.multiplyScalar(e.deltaY>0?1.07:.93);camera.position.clampLength(7,22);},{passive:false});
    const baseAngle=Math.atan2(camera.position.x,camera.position.z),radius=Math.hypot(camera.position.x,camera.position.z);
    function animate(){requestAnimationFrame(animate);const angle=baseAngle+rot;camera.position.x=Math.sin(angle)*radius;camera.position.z=Math.cos(angle)*radius;camera.position.y=Math.max(4.8,7+tilt*4);camera.lookAt(0,1,0);renderer.render(scene,camera);}
    animate();
  } catch (error) {
    console.warn("Three.js scene could not start; CSS preview remains visible.",error);
  }
}
