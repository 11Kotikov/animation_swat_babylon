let movingRight = false,
    movingLeft = false,
    movingForward = false,
    movingBack = false,
    running = false,
    grabbing = false,
    jumping = false;

const runSpeed = 0.2;
const walkSpeed = 0.1;

let standingAnima, walkingAnima, runningAnima, gatheringAnima;

let currentAnimationGroup, previousAnimationGroup;

export async function initScene(scene) {

    scene.clearColor = new BABYLON.Color3(0.8, 0.85, 0.95);

    // Parameters: name, alpha, beta, radius, target position, scene
    const camera = new BABYLON.ArcRotateCamera("Camera", -Math.PI / 2, Math.PI / 20, 40, new BABYLON.Vector3(0, 0, 0), scene);
    camera.attachControl(canvas, true);

    //light
    let light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 0, 0), scene);
    const ground = new BABYLON.MeshBuilder.CreateGround('ground', { width: 20, height: 20 }, scene);
    const m = new BABYLON.GridMaterial('grid', scene);
    m.mainColor = new BABYLON.Color3(0.5, 0.5, 0.5)
    ground.material = m;

    //crystals
    let crystals = [];
    let crystal;
    let blueCrystal = await BABYLON.SceneLoader.LoadAssetContainerAsync('/models/', 'blue.glb', scene);
    let greenGem = await BABYLON.SceneLoader.LoadAssetContainerAsync('/models/', 'gem.glb', scene);
    let magicCrystal = await BABYLON.SceneLoader.LoadAssetContainerAsync('/models/', 'magic.glb', scene);
    let chaosEmerald = await BABYLON.SceneLoader.LoadAssetContainerAsync('/models/', 'chaos_emerald.glb', scene);

    //field

    let matWall = new BABYLON.StandardMaterial('wall', scene)
    matWall.diffuseTexture = new BABYLON.Texture('./textures/stone.jpg')

    let field = [
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1],
        [1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1],
        [1, 0, 1, 0, 1, 0, 1, 4, 1, 0, 1],
        [1, 2, 1, 0, 0, 0, 1, 0, 1, 0, 1],
        [1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1],
        [1, 0, 0, 0, 1, 5, 0, 0, 1, 0, 1],
        [1, 0, 1, 1, 1, 1, 0, 1, 1, 0, 1],
        [1, 0, 1, 3, 0, 0, 0, 0, 0, 0, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
    ]

    for (let i = 0; i < 10; i++) {
        for (let j = 0; j < 11; j++) {

            switch (field[i][j]) {
                case 1:
                    var box = BABYLON.MeshBuilder.CreateBox("box", { size: 1 }, scene);
                    box.position.x = i;
                    box.position.z = j;
                    box.position.y = 1;
                    box.scaling = new BABYLON.Vector3(1, 2, 1);
                    box.material = matWall;
                    break;
                case 2:
                    crystal = blueCrystal.instantiateModelsToScene();
                    crystal = crystal.rootNodes[0];
                    crystal.position = new BABYLON.Vector3(i, 0, j);
                    crystals.push(crystal);
                    break;
                case 3:
                    crystal = magicCrystal.instantiateModelsToScene();
                    crystal = crystal.rootNodes[0];
                    crystal.position = new BABYLON.Vector3(i, 0, j);
                    crystals.push(crystal);
                    break;
                case 4:
                    crystal = greenGem.instantiateModelsToScene();
                    crystal = crystal.rootNodes[0];
                    crystal.position = new BABYLON.Vector3(i, 0, j);
                    crystals.push(crystal);
                    break;
                case 5:
                    crystal = chaosEmerald.instantiateModelsToScene();
                    crystal = crystal.rootNodes[0];
                    crystal.position = new BABYLON.Vector3(i, 0.3, j);
                    crystals.push(crystal);
                    break;
            }
        }
    }

    //scene.debugLayer.show();

    //swat
    let swat = new BABYLON.MeshBuilder.CreateBox("swat", { size: 1 }, scene);
    let swat_meshes = await BABYLON.SceneLoader.ImportMeshAsync(null, './models/', 'swatNV.glb', scene);

    standingAnima = scene.getAnimationGroupByName('standing');
    walkingAnima = scene.getAnimationGroupByName('walking');
    runningAnima = scene.getAnimationGroupByName('running');
    gatheringAnima = scene.getAnimationGroupByName('gathering');

    currentAnimationGroup = standingAnima.play(true);

    let swatMesh = swat_meshes.meshes[0];
    swatMesh.name = 'swatMesh';
    swat.position.x = 8;
    swat.position.z = 1;
    swatMesh.parent = swat;

    camera.lockedTarget = swat;
    swat.isVisible = false;


    window.addEventListener('keydown', walkingKeydown);
    function walkingKeydown(event) {
        switch (event.code) {
            case 'KeyW':
                movingForward = true,
                    movingBack = false; break;

            case 'KeyS':
                movingForward = false,
                    movingBack = true; break;

            case 'KeyA':
                movingLeft = true,
                    movingRight = false; break;

            case 'KeyD':
                movingLeft = false,
                    movingRight = true; break;

            case 'ShiftLeft':
                running = true; break;

            case 'KeyE':
                grabbing = true; break;

            case 'Space':
                jumping = true; break;
        }
    }

    window.addEventListener('keyup', walkingKeyup);
    function walkingKeyup(event) {
        switch (event.code) {
            case 'KeyW':
                movingForward = false; break;

            case 'KeyS':
                movingBack = false; break;

            case 'KeyA':
                movingLeft = false; break;

            case 'KeyD':
                movingRight = false; break;

            case 'KeyE':
                setTimeout(function () {
                    grabbing = false
                }, 3000); break;

            case 'ShiftLeft':
                running = false; break;

            case 'Space':
                jumping = false; break;

        }
    }

    function updatePosition() {
        let speed;
        let cx = Math.round(swat.position.x);
        let cz = Math.round(swat.position.z);

        swatMesh.rotationQuaternion = null;
        let newPosition = swat.position;

        previousAnimationGroup = currentAnimationGroup;

        if (movingLeft || movingRight || movingBack || movingForward) {

            if (running) {
                speed = runSpeed;
                currentAnimationGroup = runningAnima;
            }
            else {
                speed = walkSpeed;
                currentAnimationGroup = walkingAnima;
            }
        }
        else {
            currentAnimationGroup = standingAnima;
        }

        if (grabbing) {
            currentAnimationGroup = gatheringAnima;
            movingBack = false;
            movingForward = false;
            movingLeft = false;
            movingRight = false;

            for (let i = 0; i < crystals.length; i++) {
                const crystal = crystals[i];
                const distance = BABYLON.Vector3.Distance(swat.position, crystal.position);
                if (distance < 1) {
                    setTimeout(function () {
                        crystal.dispose(); // Удаление кристалла из сцены
                        crystals.splice(i, 0); // Удаление кристалла из массива
                        i--; // Уменьшение счетчика, так как массив сократился на один элемент
                    }, 2000);
                }
            }

        }

        if (previousAnimationGroup && previousAnimationGroup != currentAnimationGroup) {
            currentAnimationGroup.play(true);
            previousAnimationGroup.stop();
        }


        if (movingForward) {
            if (isObstacle(swat.position.x, swat.position.z + speed, cx, cz + 1)) {
                newPosition.z += speed
            }
            swatMesh.rotation.y = Math.PI;
        }
        if (movingBack) {
            if (isObstacle(swat.position.x, swat.position.z - speed, cx, cz - 1)) {
                newPosition.z -= speed;
            }
            swatMesh.rotation.y = 0;
        }
        if (movingLeft) {
            if (isObstacle(swat.position.x - speed, swat.position.z, cx - 1, cz)) {
                newPosition.x -= speed;
            }
            swatMesh.rotation.y = Math.PI / 2;
        }
        if (movingRight) {
            if (isObstacle(swat.position.x + speed, swat.position.z, cx + 1, cz)) {
                newPosition.x += speed;
            }
            swatMesh.rotation.y = -Math.PI / 2;
        }
    }


    function isObstacle(playerX, playerZ, obstacleX, obstacleZ) {
        if (field[obstacleX][obstacleZ] != 1) {
            return true;
        }
        return !collide(playerX - 0.5, playerZ - 0.5, playerX + 0.5, playerZ + 0.5,
            obstacleX - 0.5, obstacleZ - 0.5, obstacleX + 0.5, obstacleZ + 0.5);
    }

    function checkRectangleOverLap(rectangle1, rectangle2) {
        if ((rectangle1[0][0] <= rectangle2[0][0] && rectangle2[0][0] <= rectangle1[1][0])
            || (rectangle1[0][0] <= rectangle2[1][0] && rectangle2[1][0] <= rectangle1[1][0])
            || (rectangle2[0][0] <= rectangle1[0][0] && rectangle1[1][0] <= rectangle2[1][0])) {
            if ((rectangle1[0][1] <= rectangle2[0][1] && rectangle2[0][1] <= rectangle1[1][1])
                || (rectangle1[0][1] <= rectangle2[1][1] && rectangle2[1][1] <= rectangle1[1][1])
                || (rectangle2[0][1] <= rectangle1[0][1] && rectangle1[1][1] <= rectangle2[1][1])) {
                return true;
            }
        }
        return false;
    }

    function collide(ax1, az1, ax2, az2, bx1, bz1, bx2, bz2) {
        return checkRectangleOverLap([[ax1, az1], [ax2, az2]], [[bx1, bz1], [bx2, bz2]]);
    }

    scene.beforeRender = function () {
        updatePosition();
    }


    scene.executeWhenReady(() => {
        whenReady();
    });
};


async function whenReady() {

}