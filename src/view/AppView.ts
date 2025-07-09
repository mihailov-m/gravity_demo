import {Application, Container, FederatedPointerEvent, Graphics, RenderTexture} from 'pixi.js';
import {AppModel} from '../model/AppModel';
import {Shape} from '../model/Shape';
import {ShapeView} from './ShapeView';
import {getTotalRenderedArea} from '../core/getRenderedArea';
import {UIControls} from './UIControls';

export class AppView {
    public readonly app: Application;
    private readonly shapeContainer: Container = new Container();
    private readonly shapeViews: Map<string, ShapeView> = new Map();
    private readonly ui: UIControls;
    private onShapeClick?: (shape: Shape) => void;
    private clickOverlay: Graphics | null = null;
    private areaRenderTexture!: RenderTexture;

    constructor(
        private readonly model: AppModel,
        private readonly container: HTMLElement,
    ) {
        this.app = new Application();
        this.ui = new UIControls();
    }

    public async init(): Promise<void> {
        await this.app.init({
            width: 800,
            height: 600,
            backgroundColor: 0xffffff,
            resolution: window.devicePixelRatio || 1,
            autoDensity: true,
        });

        this.areaRenderTexture = RenderTexture.create({
            width: this.app.screen.width,
            height: this.app.screen.height,
            resolution: this.app.renderer.resolution,
        });

        this.container.appendChild(this.app.canvas);
        this.app.stage.addChild(this.shapeContainer);
        this.ui.init();

        this.subscribeToModelEvents();
        this.updateStats();
    }

    private subscribeToModelEvents(): void {
        this.model.on('shapesAdded', (shapes: Shape[]): void => {
            shapes.forEach(shape => this.addShapeView(shape));
            this.updateStats();
        });
        this.model.on('shapesRemoved', (ids: string[]): void => {
            ids.forEach(id => this.removeShapeView(id));
            this.updateStats();
        });
        this.model.on('updated', (): void => {
            this.render();
        });
        this.model.on('renderedAreaUpdated', (area: number): void => {
            this.ui.updateShapeArea(Math.floor(area));
        });
    }

    public getUIControls(): UIControls {
        return this.ui;
    }

    public getApp(): Application {
        return this.app;
    }

    public bindShapeClick(handler: (shape: Shape) => void): void {
        this.onShapeClick = handler;
    }

    public enableClick(handler: (x: number, y: number) => void): void {
        if (this.clickOverlay) return;
        const g = new Graphics()
            .rect(0, 0, this.app.screen.width, this.app.screen.height)
            .fill({alpha: 0});
        g.eventMode = 'static';
        g.on('pointerdown', (e: FederatedPointerEvent) => handler(e.global.x, e.global.y));
        this.clickOverlay = g;
        this.app.stage.addChildAt(g, 0);
    }

    public render(): void {
        for (const id of this.model.changedShapeIds) {
            const shape = this.model.shapes.get(id);
            const view = this.shapeViews.get(id);
            if (shape && view) {
                view.updatePosition(shape);
                if (view.color !== shape.color) {
                    view.updateShape(shape);
                }
            }
        }
        this.model.changedShapeIds.clear();
    }

    private addShapeView(shape: Shape): void {
        const sv = new ShapeView(shape);

        if (shape.isAutoSpawned) {
            shape.y = -shape.renderedHeight / 2;
            sv.updatePosition(shape);
        }

        sv.bindClick((s) => {
            this.onShapeClick?.(s);
            this.updateStats();
        });

        this.shapeContainer.addChild(sv.graphic);
        this.shapeViews.set(shape.id, sv);
    }

    private removeShapeView(id: string): void {
        const sv = this.shapeViews.get(id);
        if (sv) {
            this.shapeContainer.removeChild(sv.graphic);
            sv.graphic.destroy();
            this.shapeViews.delete(id);
        }
    }

    public calculateRenderedArea(): number {
        return getTotalRenderedArea(this.app.renderer, this.shapeContainer, this.areaRenderTexture);
    }

    private updateStats(): void {
        this.ui.updateShapeCount(this.model.visibleShapesCount);
    }
}