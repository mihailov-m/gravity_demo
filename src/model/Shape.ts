export enum ShapeType {
    Triangle = 'triangle',
    Rectangle = 'rectangle',
    Pentagon = 'pentagon',
    Hexagon = 'hexagon',
    Circle = 'circle',
    Ellipse = 'ellipse',
    Random = 'random',
}

export class Shape {
    public velocityY = 0;
    public renderedHeight = 0;

    constructor(
        public readonly id: string,
        public readonly type: ShapeType,
        public x: number,
        public y: number,
        public color: number,
        public size: number,
        public readonly isAutoSpawned: boolean,
    ) {}
}