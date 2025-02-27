import { Engine, Scene, Vector3, FreeCamera, HemisphericLight, MeshBuilder } from "@babylonjs/core";
import "@babylonjs/loaders";

// Создаём движок и сцену
const canvas = document.getElementById("renderCanvas");
const engine = new Engine(canvas, true);
const scene = new Scene(engine);

// Камера
const camera = new FreeCamera("camera", new Vector3(0, 5, -10), scene);
camera.setTarget(Vector3.Zero());
camera.attachControl(canvas, true);

// Свет
new HemisphericLight("light", new Vector3(0, 1, 0), scene);

// Куб
const cube = MeshBuilder.CreateBox("cube", { size: 1 }, scene);
cube.position.y = 0.5; // Подняли немного над землёй

// Управление движением
const movement = {
    forward: false,
    back: false,
    left: false,
    right: false
};

const speed = 0.1;

// Обработчики клавиш
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
    }
}

// Обновление позиции куба
scene.onBeforeRenderObservable.add(() => {
    let moveDirection = new Vector3(0, 0, 0);

    // Получаем направления в локальных координатах куба
    const forward = cube.forward.normalize();
    const right = cube.right.normalize();

    if (movement.forward) moveDirection.addInPlace(forward);
    if (movement.back) moveDirection.addInPlace(forward.scale(-1));
    if (movement.left) moveDirection.addInPlace(right.scale(-1));
    if (movement.right) moveDirection.addInPlace(right);

    if (!moveDirection.equals(Vector3.Zero())) {
        moveDirection.normalize();
        cube.position.addInPlace(moveDirection.scale(speed));
    }
});

// Запуск рендера
engine.runRenderLoop(() => scene.render());
window.addEventListener("resize", () => engine.resize());
