window.Game = window.Game || {};

Game.init = function () {

    Game.clock = new THREE.Clock();
    Game.isdisplayedOn3D = false;
    Game.mouse = new THREE.Vector2();
    Game.raycaster = new THREE.Raycaster();

    Game.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

    Game.element = Game.renderer.domElement;
    Game.container = document.getElementById('example');
    Game.container.appendChild(Game.element);

    //instanciate a new stereoEffect even if it's not used afterward
    Game.effect = new THREE.StereoEffect(Game.renderer);
    Game.scene = new THREE.Scene();

    Game.camera;
    if(Game.isdisplayedOn3D)
        Game.camera = new THREE.PerspectiveCamera(90, 1, 0.001, 700);
    else
        Game.camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 15000);
    //Game.camera.rotation.y = THREE.Math.degToRad(0);
   // Game.camera.lookAt(new THREE.Vector3(0,0,0));
    Game.scene.add(Game.camera);

    // Game.renderer.shadowMapEnabled = true;
    // Game.renderer.shadowMapSoft = true;

    Game.createWorld();

    Game.PlayerSpeed = 40;
    Game.DistanceEnemyCollision = 10;

    Game.TimeBetweenEnemies = 2;

    Game.enemies = []; // array of Enemies

    // console.log(Game.camera.position);

    // for(var i=0; i<Game.path.length; i++)
    //     console.log(Game.path[i]);

/*    Game.controls;
    if(Game.isdisplayedOn3D){
        Game.controls = new THREE.OrbitControls(Game.camera, Game.element);
        Game.controls.rotateUp(Math.PI / 4);
        Game.controls.target.set(
            Game.camera.position.x + 0.1,
            Game.camera.position.y,
            Game.camera.position.z
        );
        Game.controls.noZoom = true;
        Game.controls.noPan = true;
    }
    else
    {
        Game.controls = new THREE.FlyControls( Game.camera );
        Game.controls.movementSpeed = 2500;
        Game.controls.domElement = Game.container;
        Game.controls.rollSpeed = Math.PI / 6;
        Game.controls.autoForward = false;
        Game.controls.dragToLook = false
    }

*/
    //should be above in the else
    window.addEventListener('mousemove', onMouseMove, false);
    function setOrientationControls(e) {
    if (!e.alpha) {
      return;
    }

/*        controls = new THREE.DeviceOrientationControls(Game.camera, true);
        controls.connect();
        controls.update();*/

        Game.element.addEventListener('click', Game.fullscreen, false);

        window.removeEventListener('deviceorientation', setOrientationControls, true);
      }
      window.addEventListener('deviceorientation', setOrientationControls, true);

      Game.add_elements();
      window.addEventListener('resize', Game.resize, false);
      setTimeout(Game.resize, 1);
}

Game.createWorld = function() {

    var boxWidth = 20;
    var terrainWidth = 1300;
    var boxMinHeight = 10, boxMaxHeight = 80;
    var density = 5; // %

    this.createTerrain = function(PathCollisionsSpheres) {

        var planeGeometry = new THREE.PlaneGeometry(terrainWidth, terrainWidth);
        var material = new THREE.MeshPhongMaterial( { ambient: 0x333333, color: 0xffffff, specular: 0xffffff, shininess: 50 } );

        var terrainMesh = new THREE.Mesh(planeGeometry, material);

        terrainMesh.receiveShadow = true;

        terrainMesh.rotation.x = THREE.Math.degToRad(-90);
        terrainMesh.updateMatrix();

        var grid = [];

        gridLengthX = terrainWidth/boxWidth-1, gridLengthY = terrainWidth/boxWidth-1;

        for ( var i=0; i<gridLengthX+1; i++ ) {

            grid[i] = [];

            for ( var j=0; j<gridLengthY+1; j++ ) {

                grid[i][j] = { full: Math.random()<density/100, color: '#ffffff' };

                if ( grid[i][j].full ) {

                    if ( j>0 && grid[i][j-1].full ) {

                        grid[i][j].color = grid[i][j-1].color;

                    } else {

                        if ( i>0 && grid[i-1][j].full ) {

                            grid[i][j].color = grid[i-1][j].color;

                        } else {

                            grid[i][j].color = '#' + Math.floor( Math.random() * 16777215 ).toString( 16 );

                        }

                    }

                    var height = THREE.Math.randInt( boxMinHeight, boxMaxHeight );
                    var boxGeometry = new THREE.BoxGeometry( boxWidth, height, boxWidth );
                    var boxMaterial = new THREE.MeshPhongMaterial( { ambient: grid[i][j].color
                    , color: 0xffffff, specular: 0xffffff, shininess: 50 } );

                    var boxMesh = new THREE.Mesh(boxGeometry, boxMaterial);
                    boxMesh.position.set( (i-gridLengthX/2)*boxWidth, 2, (j-gridLengthY/2)*boxWidth );

                    var onPath = false;

                    for ( var k=0; k<PathCollisionsSpheres.length && !onPath; k++ ) {

                        if ( PathCollisionsSpheres[k].containsPoint(boxMesh.position) ) {

                            onPath = true;

                        }

                    }

                    if ( !onPath ) {

                        boxMesh.position.setY( height/2 );
                        boxMesh.castShadow = true;
                        boxMesh.matrixAutoUpdate = false;
                        boxMesh.updateMatrix();
                        Game.scene.add( boxMesh );

                    }

                }

            }

        }

        // Game.camera.position.set( 0, 2000, 0 );
        // Game.camera.lookAt( new THREE.Vector3( 0, 0, 0 ) );
/*
        var geometry = new THREE.SphereGeometry( 5, 32, 32);
        var material2 = new THREE.MeshBasicMaterial( { color: 0xffffff } );

        // Beautiful sky from Gomez *\0/*
        for ( var i = 0; i < 1000; i ++ ) {

            sphere = new THREE.Mesh( geometry, material2);
            sphere.position.x = 8000 * ( 2.0 * Math.random() - 1.0 );
            sphere.position.y = 8000 * ( 2.0 * Math.random() - 1.0 );
            sphere.position.z = 8000 * ( 2.0 * Math.random() - 1.0 );

            Game.scene.add( sphere );

        }
*/
        terrainMesh.matrixAutoUpdate = false;

        Game.scene.add( terrainMesh );

    }

    this.calculatePath = function( collisionsSpheres, collisionSphereRadius ) {

        /**************** Create your path here ****************/
        /**/
        /**/
        var path = [];
        var checkpoints = 16;
        var radius = 250;
        var angle = 2*Math.PI/checkpoints;

        for ( var i=0; i<checkpoints; i++ ) {

            path.push(new THREE.Vector3( -Math.cos(angle*i)*radius+radius, 2, Math.sin(angle*i)*radius ));

        }

        for ( var i=0; i<checkpoints; i++ ) {

            path.push(new THREE.Vector3( Math.cos(angle*i)*radius-radius, 2, Math.sin(angle*i)*radius ));

        }
        /**/
        /**/
        /*******************************************************/

        this.smoothPath = function() {

            var spline = new THREE.Spline(path);
            spline.reparametrizeByArcLength ( 6000 );

            var smoothedPath = [];
            // console.log(spline.getControlPointsArray());

            splineArray = spline.getControlPointsArray();

            var distanceFromLast=0;

            smoothedPath.push(new THREE.Vector3(splineArray[0][0],splineArray[0][1],splineArray[0][2]));
            collisionsSpheres.push(new THREE.Sphere(new THREE.Vector3().copy(smoothedPath[0]), collisionSphereRadius));

            for ( var i=1; i<splineArray.length; i++ ) {

                smoothedPath.push(new THREE.Vector3(splineArray[i][0],splineArray[i][1],splineArray[i][2]));

                distanceFromLast += smoothedPath[smoothedPath.length-1].distanceTo(smoothedPath[smoothedPath.length-2]);

                if ( distanceFromLast > collisionSphereRadius ) {

                    collisionsSpheres.push(new THREE.Sphere(new THREE.Vector3().copy(smoothedPath[smoothedPath.length-1]), collisionSphereRadius));
                    distanceFromLast=0;

                }

            }

            return smoothedPath;

        }

        return this.smoothPath();

    }

    var PathCollisionsSpheres = [];

    Game.path = this.calculatePath(PathCollisionsSpheres, Math.sqrt(boxWidth*boxWidth*2));
    Game.nextCheckpoint = 0;

    Game.camera.position.copy(Game.path[Game.nextCheckpoint]);

    this.createTerrain(PathCollisionsSpheres);

}

function onMouseMove( event )
{
    event.preventDefault();
    // calculate mouse position in normalized device coordinates
    // (-1 to +1) for both components
    Game.mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    Game.mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
}

Game.shoot = function () {

    //@see SpawnEnemy the raycast should be tested between camera and game.scene
    Game.raycaster.setFromCamera( Game.mouse, Game.camera );
    // calculate objects intersecting the picking ray
    var intersects = Game.raycaster.intersectObjects( Game.enemies, true );

    if ( intersects.length > 0 ) {

        for ( var i=0; i<Game.enemies.length; i++ ) {

            if ( Game.enemies[i].id==intersects[ 0 ].object.parent.parent.id ) {

                Game.enemies.splice( i, 1 );   // remove the id of the ennemy killed from the array;
                i=Game.enemies.length;

            }

        }

        Game.scene.remove( intersects[ 0 ].object.parent.parent );

    }

}

Game.add_elements = function ()
{
    var ambient = new THREE.AmbientLight( 0xffffff );
    ambient.color.setHSL( 0.1, 0.3, 0.4 );
    Game.scene.add( ambient );


    var dirLight = new THREE.DirectionalLight( 0xffffff, 0.200 );
    dirLight.position.set( 512, 1024, 0 );
    dirLight.color.setHSL( 0.1, 0.7, 1 );
    dirLight.target.position.set(0, 0, 0);
    dirLight.castShadow = true;
    //dirLight.shadowCameraVisible = true; // only for debugging

    Game.scene.add( dirLight );

    var dirLightLeft = new THREE.DirectionalLight( 0xffffff, 0.125 );
    dirLightLeft.position.set( -10, 0, 0 );
    dirLightLeft.color.setHSL( 0.1, 0.7, 1 );

    Game.scene.add( dirLightLeft );
}

Game.addLight = function ( h, s, l, x, y, z ) {
    var light = new THREE.PointLight( 0xffffff, 1.5, 4500 );
    light.color.setHSL( h, s, l );
    light.position.set( x, y, z );
    Game.scene.add( light );

    var flareColor = new THREE.Color( 0xffffff );
    flareColor.setHSL( h, s, l + 0.5 );

    var lensFlare = new THREE.LensFlare( Game.textureFlare0, 700, 0.0, THREE.AdditiveBlending, flareColor );

    lensFlare.add( Game.textureFlare2, 512, 0.0, THREE.AdditiveBlending );
    lensFlare.add( Game.textureFlare2, 512, 0.0, THREE.AdditiveBlending );
    lensFlare.add( Game.textureFlare2, 512, 0.0, THREE.AdditiveBlending );

    lensFlare.add( Game.textureFlare3, 60, 0.6, THREE.AdditiveBlending );
    lensFlare.add( Game.textureFlare3, 70, 0.7, THREE.AdditiveBlending );
    lensFlare.add( Game.textureFlare3, 120, 0.9, THREE.AdditiveBlending );
    lensFlare.add( Game.textureFlare3, 70, 1.0, THREE.AdditiveBlending );

    lensFlare.customUpdateCallback = Game.lensFlareUpdateCallback;
    lensFlare.position.copy( light.position );

    Game.scene.add( lensFlare );
}

Game.resize = function ()
{
    var width = Game.container.offsetWidth;
    var height = Game.container.offsetHeight;

    Game.camera.aspect = width / height;
    Game.camera.updateProjectionMatrix();

    Game.renderer.setSize(width, height);
    if(Game.isdisplayedOn3D) {
       Game.effect.setSize(width, height);
    }
}

Game.spawnEnemy = function()
{
    var spawned=true; // returned at the end to inform if the ennemy have been instanciated or not;
    var enemyDistance = THREE.Math.randInt ( 150, 300 );
    var currentPosition = new THREE.Vector3().copy(Game.camera.position);
    var nextCheckpoint = Game.nextCheckpoint;
    var distanceBetweenCheckpoints = currentPosition.distanceTo(Game.path[nextCheckpoint]);
    while(distanceBetweenCheckpoints < enemyDistance )
    {
        enemyDistance -= distanceBetweenCheckpoints;
        currentPosition.copy(Game.path[nextCheckpoint]);

        if(nextCheckpoint < Game.path.length-1)
            nextCheckpoint++;
        else
            nextCheckpoint=0;

        distanceBetweenCheckpoints = currentPosition.distanceTo(Game.path[nextCheckpoint]);
    }
    var translationVector = new THREE.Vector3().subVectors(Game.path[nextCheckpoint], currentPosition);
    translationVector.multiplyScalar(enemyDistance);
    translationVector.divideScalar(distanceBetweenCheckpoints);

    var enemySpawnPosition = new THREE.Vector3().addVectors(currentPosition, translationVector);

    // check that the ennemy can be spawned on this position (ie :  not overlapping another ennemy or a building)
    for(var i=0; i<Game.enemies.length; i++)
    {
        if(Game.enemies[i].position.distanceTo(enemySpawnPosition)<Enemy.collisionRadius*4)
        {
            i=Game.enemies.length;
            spawned=false;
        }
    }

    if(spawned)
    {
        var enemyMesh = new Enemy( enemySpawnPosition );
        Game.scene.add( enemyMesh );
        Game.enemies.push(enemyMesh);
    }
    return spawned;
}

Game.movePlayer = function(dt)
{
    this.crashTest = function(Vector3from, Vector3to, distanceToCollision)
    {
        var raycaster = new THREE.Raycaster(Vector3from, new THREE.Vector3().subVectors( Vector3to , Vector3from ), 0, Vector3from.distanceTo(Vector3to));

        var intersects = raycaster.intersectObject( Game.enemies[0], true );
        if(intersects.length > 0)
        {
            // console.log(intersects[ 0 ]);
            if(distanceToCollision === undefined || intersects[ 0 ].distance<distanceToCollision)
            {
                console.log("FATALITY, You Are NOTHING !");
                intersects[ 0 ].object.material = Enemy.crashedMaterial;

              //  console.log(Game.camera.position.distanceTo(intersects[ 0 ].object.position));

                return true;
            }
        }

        return false;
    }

    if(Game.enemies.length > 0)
    {
        var distanceToCollision = Game.DistanceEnemyCollision;
        var nextCollisionFrom = new THREE.Vector3().copy(Game.camera.position); // position as vector3
        var nextCollisionCheckpointTo = Game.nextCheckpoint;    // checkpoint index

        var distanceToNextCollisionsCheckpoint = nextCollisionFrom.distanceTo(Game.path[nextCollisionCheckpointTo]);

        while(distanceToNextCollisionsCheckpoint < distanceToCollision)
        {
            if(this.crashTest(nextCollisionFrom, Game.path[nextCollisionCheckpointTo]))
                distanceToCollision=0;

            distanceToCollision-=distanceToNextCollisionsCheckpoint;

            nextCollisionFrom = Game.path[nextCollisionCheckpointTo];

            if(nextCollisionCheckpointTo < Game.path.length-1)
                nextCollisionCheckpointTo = nextCollisionCheckpointTo+1;
            else
                nextCollisionCheckpointTo = 0;

            distanceToNextCollisionsCheckpoint = nextCollisionFrom.distanceTo(Game.path[nextCollisionCheckpointTo]);
        }

        this.crashTest(nextCollisionFrom, Game.path[nextCollisionCheckpointTo], distanceToCollision);
    }

    // if distance to the next checkpoint is shorter than distance to travel this tick
    // then increment checkpoint
    var translateDistance = Game.PlayerSpeed*dt;

    var distanceToNextCheckpoint = Game.camera.position.distanceTo(Game.path[Game.nextCheckpoint]);

    while(distanceToNextCheckpoint < translateDistance)
    {
        translateDistance -= distanceToNextCheckpoint;
        Game.camera.position.copy(Game.path[Game.nextCheckpoint]);

        if(Game.nextCheckpoint < Game.path.length-1)
            Game.nextCheckpoint++;
        else
            Game.nextCheckpoint=0;

        var distanceToNextCheckpoint = Game.camera.position.distanceTo(Game.path[Game.nextCheckpoint]);
    }

    Game.camera.lookAt(Game.path[Game.nextCheckpoint]);

    Game.camera.translateZ(-translateDistance);

    for(var i=0; i<Game.enemies.length; i++)
        Game.enemies[i].lookAt(Game.camera.position);
}

Game.update = function (dt) {

    Game.update.lastEnemySpawn = Game.update.lastEnemySpawn || 0;

    if ( Game.clock.getElapsedTime() - Game.update.lastEnemySpawn > Game.TimeBetweenEnemies ) {

        if ( Game.spawnEnemy() ) {

            Game.update.lastEnemySpawn = Game.clock.getElapsedTime ();

        }

    }

    Game.resize();
    Game.shoot();
    Game.camera.updateProjectionMatrix();

    Game.movePlayer(dt);

/*    if(Game.isdisplayedOn3D) {
        Game.controls.update(dt);
    }
    else {
        Game.controls.update(dt);
    }*/

}

Game.onWindowResize = function( event ) {
    var width = Game.container.offsetWidth;
    var height = Game.container.offsetHeight;

    Game.camera.aspect = width / height;
    Game.camera.updateProjectionMatrix();

    Game.renderer.setSize(width, height);
    if(Game.isdisplayedOn3D) {
        Game.effect.setSize(width, height);
    }
}

//

Game.animate = function() {
    requestAnimationFrame(Game.animate);
      Game.update(Game.clock.getDelta());
      Game.render(Game.clock.getDelta());

}

Game.render = function () {
    if (Game.isdisplayedOn3D) {
        Game.effect.render(Game.scene, Game.camera);
    }
    else
    {
        Game.renderer.render(Game.scene, Game.camera);
    }
}

Game.fullscreen = function () {
 if (Game.container.requestFullscreen) {
    Game.container.requestFullscreen();
  } else if (Game.container.msRequestFullscreen) {
    Game.container.msRequestFullscreen();
  } else if (Game.container.mozRequestFullScreen) {
    Game.container.mozRequestFullScreen();
  } else if (Game.container.webkitRequestFullscreen) {
    Game.container.webkitRequestFullscreen();
  }
}

//start the game
Game.init();
// var textGeometry = new THREE.TextGeometry("RailShooter \n by \n ...");
// var textMaterial = new THREE.MeshPhongMaterial( { ambient: '#'+Math.floor(Math.random()*16777215).toString(16)
// , color: 0xffffff, specular: 0xffffff, shininess: 50 } );

// var textMesh = new THREE.Mesh(textGeometry, textMaterial);

// Game.scene.add(textMesh);

Game.animate();
