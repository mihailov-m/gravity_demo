import {EventEmitter} from '../core/EventEmitter';
import {Shape, ShapeType} from './Shape';
import {Ticker} from 'pixi.js';

export type ModelEvents = {
    shapesAdded: [Shape[]];
    shapesRemoved: [string[]];
    updated: [];
    renderedAreaUpdated: [number];
};

const MIN_SHAPE_SIZE = 20;
const MAX_SHAPE_SIZE = 100;

export class AppModel extends EventEmitter<ModelEvents> {
    public gravity = 0.1;
    public spawnRate = 5;
    public shapes: Map<string, Shape> = new Map();
    public changedShapeIds: Set<string> = new Set();
    public renderedArea = 0;
    public visibleShapesCount = 0;
    private spawnTimer = 0;

    public update(ticker: Ticker, boundaries: {width: number; height: number}): void {
        const somethingChanged = this._updateShapesPhysics(ticker, boundaries);
        this._removeOffscreenShapes(boundaries);
        this._spawnNewShapes(ticker.deltaMS, boundaries.width);

        if (somethingChanged) {
            this.emit('updated');
        }
    }

    public createShapeAt(x: number, y: number): void {
        const type = this._getRandomShapeType();
        const shape = this._createRandomShape(type, x, y, false);
        this.addShape(shape);
        this.emit('shapesAdded', [shape]);
    }

    public changeColorForType(typeToChange: ShapeType): void {
        const newColor = Math.floor(Math.random() * 0xffffff);
        let changed = false;
        for (const shape of this.shapes.values()) {
            if (shape.type === typeToChange && shape.color !== newColor) {
                shape.color = newColor;
                this.markChanged(shape.id);
                changed = true;
            }
        }
        if (changed) {
            this.emit('updated');
        }
    }

    public updateRenderedArea(area: number): void {
        if (this.renderedArea !== area) {
            this.renderedArea = area;
            this.emit('renderedAreaUpdated', area);
        }
    }

    private addShape(shape: Shape): void {
        this.shapes.set(shape.id, shape);
        this.changedShapeIds.add(shape.id);
    }

    private removeShape(id: string): void {
        if (this.shapes.has(id)) {
            this.shapes.delete(id);
            this.changedShapeIds.delete(id);
        }
    }

    public markChanged(id: string): void {
        if (this.shapes.has(id)) {
            this.changedShapeIds.add(id);
        }
    }

    private _updateShapesPhysics(ticker: Ticker, boundaries: {height: number}): boolean {
        let hasPositionUpdates = false;
        let currentVisibleCount = 0;

        for (const shape of this.shapes.values()) {
            const oldY = shape.y;
            shape.velocityY += this.gravity * (ticker.deltaTime || 1);
            shape.y += shape.velocityY * (ticker.deltaTime || 1);

            if (shape.y !== oldY) {
                this.markChanged(shape.id);
                hasPositionUpdates = true;
            }

            const topEdge = shape.y - shape.renderedHeight / 2;
            const bottomEdge = shape.y + shape.renderedHeight / 2;
            if (bottomEdge > 0 && topEdge < boundaries.height) {
                currentVisibleCount++;
            }
        }

        this.visibleShapesCount = currentVisibleCount;
        return hasPositionUpdates;
    }

    private _removeOffscreenShapes(boundaries: {height: number}): void {
        const toRemoveIds: string[] = [];
        for (const shape of this.shapes.values()) {
            const topEdge = shape.y - shape.renderedHeight / 2;
            if (topEdge > boundaries.height) {
                toRemoveIds.push(shape.id);
            }
        }

        if (toRemoveIds.length > 0) {
            for (const id of toRemoveIds) {
                this.removeShape(id);
            }
            this.emit('shapesRemoved', toRemoveIds);
        }
    }

    private _spawnNewShapes(deltaMs: number, canvasWidth: number): void {
        if (!this.spawnRate) return;

        const newlySpawnedShapes: Shape[] = [];
        this.spawnTimer += deltaMs;
        const interval = 1000 / this.spawnRate;

        while (this.spawnTimer >= interval) {
            this.spawnTimer -= interval;
            const shape = this._createShapeForAutoSpawn(canvasWidth);
            this.addShape(shape);
            newlySpawnedShapes.push(shape);
        }

        if (newlySpawnedShapes.length > 0) {
            this.emit('shapesAdded', newlySpawnedShapes);
        }
    }

    private _createShapeForAutoSpawn(width: number): Shape {
        const type = this._getRandomShapeType();
        const x = Math.random() * width;
        const y = 0;
        return this._createRandomShape(type, x, y, true);
    }

    private _createRandomShape(type: ShapeType, x: number, y: number, isAutoSpawned: boolean): Shape {
        const color = Math.floor(Math.random() * 0xffffff);
        const size = MIN_SHAPE_SIZE + Math.random() * (MAX_SHAPE_SIZE - MIN_SHAPE_SIZE);
        return new Shape(crypto.randomUUID(), type, x, y, color, size, isAutoSpawned);
    }

    private _getRandomShapeType(): ShapeType {
        const enumValues = Object.values(ShapeType);
        return enumValues[Math.floor(Math.random() * enumValues.length)];
    }
}