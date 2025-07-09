import {AppModel} from '../model/AppModel';
import {AppView} from '../view/AppView';
import {Shape} from '../model/Shape';
import {Ticker} from 'pixi.js';
import {UIControls} from '../view/UIControls';

export class MainController {
    private readonly ui: UIControls;
    private readonly AREA_UPDATE_INTERVAL_MS = 250;

    constructor(
        private readonly model: AppModel,
        private readonly view: AppView,
    ) {
        this.ui = this.view.getUIControls();
    }

    public start(): void {
        this.bindControls();
        this.updateControls();
        this.view.getApp().ticker.add((ticker) => this.tick(ticker));
        this.view.enableClick((x, y) => this.handleClick(x, y));
        this.view.bindShapeClick((shape) => this.handleShapeClick(shape));
        setInterval(() => this.measureArea(), this.AREA_UPDATE_INTERVAL_MS);
    }

    private bindControls(): void {
        this.ui.bindGravity((delta) => {
            this.model.gravity = Math.max(0, this.model.gravity + delta);
            this.updateControls();
        });
        this.ui.bindSpawnRate((delta) => {
            this.model.spawnRate = Math.max(0, this.model.spawnRate + delta);
            this.updateControls();
        });
    }

    private updateControls(): void {
        this.ui.updateGravity(this.model.gravity);
        this.ui.updateSpawnRate(this.model.spawnRate);
    }

    private measureArea(): void {
        const area = this.view.calculateRenderedArea();
        this.model.updateRenderedArea(area);
    }

    private handleClick(x: number, y: number): void {
        this.model.createShapeAt(x, y);
    }

    private handleShapeClick(target: Shape): void {
        this.model.changeColorForType(target.type);
    }

    private tick(ticker: Ticker): void {
        const screen = this.view.getApp().screen;
        this.model.update(ticker, {width: screen.width, height: screen.height});
    }
}