import {
    ArcRotateCamera,
    HemisphericLight,
    Vector3,
    SceneLoader,
    MeshBuilder,
    Quaternion,
} from "@babylonjs/core";
import "@babylonjs/loaders";
import "@babylonjs/inspector";

// Управление движением
const movement = {
    forward: false,
    back: false,
    left: false,
    right: false,
    running: false,
    grabbing: false,
    jumping: false,
};

const runSpeed = 0.2;
const walkSpeed = 0.03;
let animations = {};
let currentAnimationGroup;
let swatShell, swatMesh, topCamera;

export async function initScene(scene) {
    const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);
    light.intensity = 0.7;

    await createEnvironment(scene);
    await createMovingSwat(scene);

    // Создаём статичную камеру сверху
    createTopCamera(scene);

    scene.beforeRender = updatePosition;
}

async function createEnvironment(scene) {
    await SceneLoader.ImportMeshAsync("", "./models/", "big_room.glb", scene);
}

async function createMovingSwat(scene) {
    swatShell = MeshBuilder.CreateBox("swat", { size: 1 }, scene);
    const swatMeshes = await SceneLoader.ImportMeshAsync(
        null,
        "./models/",
        "swatNV.glb",
        scene
    );

    swatMesh = swatMeshes.meshes[0];
    swatMesh.name = "swatMesh";
    swatMesh.parent = swatShell;

    swatShell.position.set(1, 0, 1);
    swatShell.isVisible = false;

    // Загрузка анимаций
    animations = {
        standing: scene.getAnimationGroupByName("standing"),
        walking: scene.getAnimationGroupByName("walking"),
        running: scene.getAnimationGroupByName("running"),
        grabbing: scene.getAnimationGroupByName("gathering"),
    };

    currentAnimationGroup = animations.standing.play(true);
}

function createTopCamera(scene) {
    topCamera = new ArcRotateCamera("topCamera", -Math.PI / 2, 0, 50, new Vector3(0, 0, 0), scene);
    scene.activeCamera = topCamera;
    topCamera.attachControl(canvas, true); // Для управления мышью
}

window.addEventListener("keydown", (event) => handleKey(event, true));
window.addEventListener("keyup", (event) => handleKey(event, false));

function handleKey(event, isPressed) {
    switch (event.code) {
        case "KeyW":
            movement.forward = isPressed;
            break;
        case "KeyS":
            movement.back = isPressed;
            break;
        case "KeyA":
            movement.left = isPressed;
            break;
        case "KeyD":
            movement.right = isPressed;
            break;
        case "ShiftLeft":
            movement.running = isPressed;
            break;
        case "KeyE":
            if (isPressed) {
                movement.grabbing = true;
                let grabbingStartTime = Date.now(); // Запоминаем время начала

                setTimeout(() => {
                    if (Date.now() - grabbingStartTime >= 3000) {
                        movement.grabbing = false;
                    }
                }, 3600);
            }
            break;
    }
}

function switchAnimation(name, reverse = false) {
    if (currentAnimationGroup?.name === name && currentAnimationGroup.speedRatio === (reverse ? -1 : 1)) return;

    currentAnimationGroup?.stop();
    currentAnimationGroup = animations[name];

    if (currentAnimationGroup) {
        currentAnimationGroup.speedRatio = reverse ? -1 : 1;
        currentAnimationGroup.play(true);
    }
}

function updatePosition() {
    if (!swatMesh || !swatShell) return;

    let speed = movement.running ? runSpeed : walkSpeed;
    let moveDirection = new Vector3(0, 0, 0);
    let isMoving = false;

    // **Получаем направления в ЛОКАЛЬНЫХ координатах персонажа**
    const forward = swatShell.forward.normalize();
    const right = swatShell.right.normalize();

    if (!movement.grabbing) {
        if (movement.forward) moveDirection.addInPlace(forward);
        if (movement.back) moveDirection.addInPlace(forward.scale(-1)); // Движение назад
        if (movement.left) moveDirection.addInPlace(right.scale(-1)); // Лево относительно персонажа
        if (movement.right) moveDirection.addInPlace(right); // Право относительно персонажа
    }

    if (!moveDirection.equals(Vector3.Zero())) {
        moveDirection.normalize();
        swatShell.position.addInPlace(moveDirection.scale(speed));
        isMoving = true;
    }

    // **Выбираем анимацию**
    let newAnimation = "standing";
    let reverseAnimation = false;

    if (movement.grabbing) {
        newAnimation = "gathering";
    } else if (isMoving) {
        if (movement.back) {
            newAnimation = "walking";
            reverseAnimation = true;
        } else {
            newAnimation = movement.running ? "running" : "walking";
        }
    }

    switchAnimation(newAnimation, reverseAnimation);

    // **ГЛАДКИЙ ПОВОРОТ без дёрганий**
    if (isMoving && !movement.grabbing) {
        let targetRotation = Quaternion.FromLookDirectionLH(moveDirection, Vector3.Up());

        if (!swatShell.rotationQuaternion) {
            swatShell.rotationQuaternion = targetRotation;
        } else {
            // **Проверяем, стоит ли поворачивать**
            let angleDifference = Quaternion.Dot(swatShell.rotationQuaternion, targetRotation);

            if (angleDifference < 0.999) { 
                let rotationSpeed = 0.06; // Плавный поворот (уменьшил для стабильности)
                swatShell.rotationQuaternion = Quaternion.Slerp(
                    swatShell.rotationQuaternion,
                    targetRotation,
                    rotationSpeed
                );
            }
        }
    }
}








