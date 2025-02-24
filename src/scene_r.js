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

// Управление движением персонажа (логические флаги)

// Скорости ходьбы и бега

// Переменные для хранения анимаций и игровых объектов

// Функция инициализации сцены
export async function initScene(scene) {
    const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);
    light.intensity = 0.7;

    //Вызовы функций
    await createEnvironment(scene);
    await createMovingSwat(scene);
    createTopCamera(scene);

    // Вызываем обновление позиции перед каждым кадром
    scene.beforeRender = updatePosition;
}

async function createEnvironment(scene) {
    await SceneLoader.ImportMeshAsync("", "./models/", "big_room.glb", scene);
}

// Функция создания персонажа
async function createMovingSwat(scene) {
    // Создаём невидимую оболочку (контейнер) для персонажа
    swatShell = MeshBuilder.CreateBox("swat", { size: 1 }, scene);
    // Загружаем 3D-модель персонажа
    const swatMeshes = await SceneLoader.ImportMeshAsync(
        null,
        "./models/",
        "swatNV.glb",
        scene
    );

    // Устанавливаем основной меш персонажа

    // Позиционируем персонажа
    // Делаем оболочку невидимой

    // Загружаем анимации персонажа

    // Устанавливаем анимацию "стояния" по умолчанию
    currentAnimationGroup = animations.standing.play(true);
}

// Функция создания статичной камеры сверху
function createTopCamera(scene) {
    topCamera = new ArcRotateCamera(
        "topCamera",
        0,
        Math.PI / 2,
        30,
        new Vector3(0, 0, 0),
        scene
    );
    scene.activeCamera = topCamera;
    topCamera.attachControl(canvas, true);
}

// обработчики нажатия и отпускания клавиш
window.addEventListener("keydown", (event) => handleKey(event, true));
window.addEventListener("keyup", (event) => handleKey(event, false));

// Функция обработки нажатий клавиш
function handleKey(event, isPressed) {

}

// Функция переключения анимаций
function switchAnimation(name) {

}

// Функция обновления позиции персонажа
function updatePosition() {

}
