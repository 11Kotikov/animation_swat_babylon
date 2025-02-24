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
  topCamera = new ArcRotateCamera("topCamera", -Math.PI/2, 0, 50, new Vector3(0, 0, 0), scene);
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
        setTimeout(() => (movement.grabbing = false), 3000);
      }
      break;
    case "Space":
      movement.jumping = isPressed;
      break;
  }
}

function switchAnimation(name) {
  if (currentAnimationGroup !== animations[name]) {
    currentAnimationGroup?.stop();
    currentAnimationGroup = animations[name].play(true);
  }
}

function updatePosition() {
  if (!swatMesh || !swatShell) return;

  let speed = movement.running ? runSpeed : walkSpeed;
  let newPosition = swatShell.position.clone();
  let moveDirection = new Vector3(0, 0, 0);
  let isMoving = false;

  // Определение направления движения
  if (movement.forward) moveDirection.addInPlace(new Vector3(0, 0, 1));
  if (movement.back) moveDirection.addInPlace(new Vector3(0, 0, -1));
  if (movement.left) moveDirection.addInPlace(new Vector3(-1, 0, 0));
  if (movement.right) moveDirection.addInPlace(new Vector3(1, 0, 0));

  // Проверка, двигаемся ли мы
  if (!moveDirection.equals(Vector3.Zero())) {
    moveDirection.normalize();
    newPosition.addInPlace(moveDirection.scale(speed));
    isMoving = true;
  }

  // Управление анимациями
  if (movement.grabbing) {
    switchAnimation("grabbing");
  } else if (isMoving) {
    switchAnimation(movement.running ? "running" : "walking");
  } else {
    switchAnimation("standing");
  }

  // Обновление позиции персонажа
  swatShell.position.copyFrom(newPosition);

  // Если персонаж движется, обновляем его поворот
  if (isMoving) {
    let newRotation = Quaternion.FromLookDirectionLH(moveDirection, Vector3.Up());
    swatMesh.rotationQuaternion = newRotation;
  }
}
