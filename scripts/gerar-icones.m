// Gera os PNGs do ✨ (cursor e favicons) a partir do emoji do sistema.
// Compilar e rodar:  npm run icones
#import <AppKit/AppKit.h>

static void render(int size, NSString *path, NSColor *fundo, CGFloat escala) {
    CGFloat s = (CGFloat)size;
    NSBitmapImageRep *rep = [[NSBitmapImageRep alloc]
        initWithBitmapDataPlanes:NULL
                      pixelsWide:size
                      pixelsHigh:size
                   bitsPerSample:8
                 samplesPerPixel:4
                        hasAlpha:YES
                        isPlanar:NO
                  colorSpaceName:NSDeviceRGBColorSpace
                     bytesPerRow:0
                    bitsPerPixel:0];
    if (!rep) return;

    NSGraphicsContext *ctx = [NSGraphicsContext graphicsContextWithBitmapImageRep:rep];
    [NSGraphicsContext saveGraphicsState];
    [NSGraphicsContext setCurrentContext:ctx];
    [ctx setImageInterpolation:NSImageInterpolationHigh];

    NSRect quadro = NSMakeRect(0, 0, s, s);
    if (fundo) {
        [fundo setFill];
        NSRectFill(quadro);
    }

    CGFloat corpo = s * escala * (fundo ? 0.72 : 1.0);
    NSFont *fonte = [NSFont fontWithName:@"Apple Color Emoji" size:corpo];
    if (!fonte) fonte = [NSFont systemFontOfSize:corpo];
    NSAttributedString *texto = [[NSAttributedString alloc]
        initWithString:@"✨"
            attributes:@{NSFontAttributeName: fonte}];
    NSSize medida = [texto size];
    [texto drawAtPoint:NSMakePoint((s - medida.width) / 2.0, (s - medida.height) / 2.0)];

    [NSGraphicsContext restoreGraphicsState];

    NSData *png = [rep representationUsingType:NSBitmapImageFileTypePNG properties:@{}];
    if ([png writeToFile:path atomically:YES]) {
        printf("  ok  %s (%dx%d, %.1fkB)\n", [path UTF8String], size, size, png.length / 1024.0);
    }
}

int main(void) {
    @autoreleasepool {
        NSColor *rosa = [NSColor colorWithSRGBRed:0xE8/255.0 green:0x9A/255.0 blue:0xD2/255.0 alpha:1.0];

        printf("Cursor:\n");
        render(32, @"public/cursor/sparkle-32.png", nil, 0.92);
        render(64, @"public/cursor/sparkle-64.png", nil, 0.92);
        render(40, @"public/cursor/sparkle-40.png", nil, 0.92);
        render(80, @"public/cursor/sparkle-80.png", nil, 0.92);

        printf("Favicons:\n");
        render(16, @"public/icones/favicon-16.png", nil, 1.0);
        render(32, @"public/icones/favicon-32.png", nil, 0.96);
        render(180, @"public/icones/apple-touch-icon.png", rosa, 0.92);
        render(192, @"public/icones/icone-192.png", rosa, 0.92);
        render(512, @"public/icones/icone-512.png", rosa, 0.92);
    }
    return 0;
}
