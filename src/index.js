import {
  Scene,
  Engine,
} from "@babylonjs/core";
import { initScene } from "./scene.js";

const canvas = document.getElementById("canvas");
const engine = new Engine(canvas, true);
const scene = new Scene(engine);

let sceneAsyncImport, initeScene;
sceneAsyncImport = await import("./scene.js");
initeScene = sceneAsyncImport.initScene;

//Inspector
window.addEventListener("keydown", (event) => {
  //Ctrl+I
  if (event.ctrlKey && event.keyCode === 73) {
    if (scene.debugLayer.isVisible()) {
      scene.debugLayer.hide();
    } else {
      scene.debugLayer.show();
    }
  }
});

window.addEventListener("resize", function () {
  engine.resize();
});

(async () => {
  await initScene(scene);
  engine.runRenderLoop(() => {
    scene.render();
  })
})();