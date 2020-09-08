
function init(){
    var scene = new THREE.Scene();
    
    var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 10000);
    camera.position.z = 7
    sceneDos.add(cameraDos)
        
    var renderer = new THREE.WebGLRenderer({antialias: true, canvas, alpha:true});
    var renderer.setSize(window.innerWidth,window.innerHeight);
    document.body.appendChild(renderer.domElement)
    
    const geometry = new THREE.SphereGeometry(2, 50, 50)

    const material = new THREE.PointsMaterial({
        color: '#c472ba',
        sizeAttenuation: false,
        size: 3,
    });

    points = new THREE.Points(geometry, material)
    points.position.x = -3
    scene.add(points);

    const geometry2 = new THREE.SphereGeometry(2, 50, 50)

    const material2 = new THREE.PointsMaterial({
        color: '#e1cedb',
        sizeAttenuation: false,
        size: 3,
    });

    points2 = new THREE.Points(geometry2, material2)
    points2.position.x = 3
    scene.add(points2);

}


function animate(){
    requestAnimationFrame(animate);

    points.rotation.x += 0.005;
    points.rotation.y += 0.005;

    points2.rotation.x += 0.005;
    points2.rotation.y += 0.005;

    renderer.render(scene, camera)
    
}

init();
animate();
