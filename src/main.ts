import "./style.css";
import { AppModel } from './model/AppModel';
import { AppView } from './view/AppView';
import { MainController } from './controller/MainController';

async function main(): Promise<void> {
  const container = document.getElementById('pixi-root') as HTMLElement;

  const model = new AppModel();
  const view = new AppView(model, container);

  await view.init();

  const controller = new MainController(model, view);
  controller.start();
}

void main();
