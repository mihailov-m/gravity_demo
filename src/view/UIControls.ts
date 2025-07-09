export class UIControls {
    private onGravityChange?: (delta: number) => void;
    private onSpawnRateChange?: (delta: number) => void;

    public init(): void {
        document.getElementById('increaseGravity')?.addEventListener('click', () => this.onGravityChange?.(0.1));
        document.getElementById('decreaseGravity')?.addEventListener('click', () => this.onGravityChange?.(-0.1));

        document.getElementById('increaseRate')?.addEventListener('click', () => this.onSpawnRateChange?.(1));
        document.getElementById('decreaseRate')?.addEventListener('click', () => this.onSpawnRateChange?.(-1));
    }

    public bindGravity(callback: (delta: number) => void): void {
        this.onGravityChange = callback;
    }

    public bindSpawnRate(callback: (delta: number) => void): void {
        this.onSpawnRateChange = callback;
    }

    public updateGravity(value: number): void {
        const el = document.getElementById('gravityValue');
        if (el) el.textContent = value.toFixed(1);
    }

    public updateSpawnRate(value: number): void {
        const el = document.getElementById('rateValue');
        if (el) el.textContent = value.toString();
    }

    public updateShapeCount(count: number): void {
        const el = document.getElementById('shapeCount');
        if (el) el.textContent = count.toString();
    }

    public updateShapeArea(area: number): void {
        const el = document.getElementById('shapeArea');
        if (el) el.textContent = area.toString();
    }
}