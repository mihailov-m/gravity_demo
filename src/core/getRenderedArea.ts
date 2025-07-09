import {Container, RenderTexture, Renderer} from 'pixi.js';

export function getTotalRenderedArea(
    renderer: Renderer,
    container: Container,
    targetTexture: RenderTexture
): number {
    renderer.render({
        container: container,
        target: targetTexture,
        clear: true,
    });

    const pixelsData = renderer.extract.pixels(targetTexture);
    const pixels = pixelsData.pixels;
    let area = 0;

    for (let i = 0; i < pixels.length; i += 4) {
        const alpha = pixels[i + 3];
        if (alpha > 0) {
            area++;
        }
    }
    return area;
}