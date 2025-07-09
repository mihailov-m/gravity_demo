import {Shape, ShapeType} from '../model/Shape';
import {FederatedPointerEvent, Graphics, Point} from 'pixi.js';

type DrawStrategy = (g: Graphics, size: number) => void;

export class ShapeView {
    public readonly graphic: Graphics;
    public color: number;
    private shape: Shape;
    private onClick?: (shape: Shape) => void;

    private static readonly drawStrategies: Map<ShapeType, DrawStrategy> = new Map([
        [ShapeType.Circle, ShapeView._drawCircle],
        [ShapeType.Ellipse, ShapeView._drawEllipse],
        [ShapeType.Rectangle, ShapeView._drawRectangle],
        [ShapeType.Triangle, (g, s) => ShapeView._drawPolygon(g, 3, s)],
        [ShapeType.Pentagon, (g, s) => ShapeView._drawPolygon(g, 5, s)],
        [ShapeType.Hexagon, (g, s) => ShapeView._drawPolygon(g, 6, s)],
        [ShapeType.Random, ShapeView._drawCloud],
    ]);

    private static readonly cloudTemplate = [
        {x: -0.5, y: -0.2, rx: 0.9, ry: 0.6},
        {x: 0, y: -0.5, rx: 1.1, ry: 0.7},
        {x: 0.4, y: -0.1, rx: 0.8, ry: 0.5},
        {x: -0.2, y: 0.2, rx: 1.0, ry: 0.6},
        {x: 0.3, y: 0.5, rx: 0.7, ry: 0.4},
    ];

    constructor(shape: Shape) {
        this.shape = shape;
        this.graphic = new Graphics();
        this.color = shape.color;

        this.draw();
        this.updatePosition(shape);
        this.shape.renderedHeight = this.graphic.height;

        this.graphic.eventMode = 'static';
        this.graphic.cursor = 'pointer';
        this.graphic.on('pointerdown', (e: FederatedPointerEvent) => {
            e.stopPropagation();
            this.onClick?.(this.shape);
        });
    }

    public updateShape(shape: Shape): void {
        this.shape = shape;
        this.color = shape.color;
        this.draw();
        this.updatePosition(shape);
        this.shape.renderedHeight = this.graphic.height;
    }

    public updatePosition({x, y}: Shape): void {
        this.graphic.position.set(x, y);
    }

    public bindClick(handler: (shape: Shape) => void): void {
        this.onClick = handler;
    }

    private draw(): void {
        this.graphic.clear();
        const drawFn = ShapeView.drawStrategies.get(this.shape.type);
        if (drawFn) {
            drawFn(this.graphic, this.shape.size);
        }
        this.graphic.fill({color: this.shape.color});
    }

    private static _drawCircle(g: Graphics, size: number): void {
        g.circle(0, 0, size / 2);
    }

    private static _drawEllipse(g: Graphics, size: number): void {
        g.ellipse(0, 0, size / 2, size * 0.35);
    }

    private static _drawRectangle(g: Graphics, size: number): void {
        g.rect(-size / 2, -size / 2, size, size);
    }

    private static _drawPolygon(g: Graphics, sides: number, size: number): void {
        const angleStep = (Math.PI * 2) / sides;
        const radius = size / 2;
        const points: Point[] = [];
        for (let i = 0; i < sides; i++) {
            const angle = angleStep * i - Math.PI / 2;
            points.push(new Point(Math.cos(angle) * radius, Math.sin(angle) * radius));
        }
        g.poly(points);
    }

    private static _drawCloud(g: Graphics, size: number): void {
        const baseSize = size / 2;
        for (const part of ShapeView.cloudTemplate) {
            const offsetX = part.x * baseSize;
            const offsetY = part.y * baseSize;
            g.ellipse(offsetX, offsetY, part.rx * baseSize, part.ry * baseSize);
        }
    }
}