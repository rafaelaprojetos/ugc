// Trata as imagens do site usando o CoreGraphics do próprio macOS.
// Existe porque a máquina não tem ffmpeg nem ImageMagick, e o `sips` não
// sabe apagar fundo nem recortar sobra transparente.
//
//   clang -fobjc-arc -framework Foundation -framework AppKit \
//         -framework CoreGraphics -framework ImageIO \
//         -o tratar-imagem scripts/tratar-imagem.m
//
//   tratar-imagem logo   entrada.png saida.png 400   → tira fundo branco, apara, encaixa
//   tratar-imagem quadra entrada.png saida.png 400   → recorta no centro, vira quadrado
//   tratar-imagem corte  entrada.jpg saida.png 1600 900 0.5  → recorta na proporção pedida

#import <AppKit/AppKit.h>
#import <CoreGraphics/CoreGraphics.h>
#import <ImageIO/ImageIO.h>

static CGImageRef CarregarImagem(NSString *caminho) {
  NSURL *url = [NSURL fileURLWithPath:caminho];
  CGImageSourceRef fonte = CGImageSourceCreateWithURL((__bridge CFURLRef)url, NULL);
  if (!fonte) return NULL;
  CGImageRef img = CGImageSourceCreateImageAtIndex(fonte, 0, NULL);
  CFRelease(fonte);
  return img;
}

/** Desenha a imagem num buffer RGBA que eu possa ler pixel a pixel. */
static uint8_t *LerPixels(CGImageRef img, size_t *larg, size_t *alt) {
  size_t w = CGImageGetWidth(img), h = CGImageGetHeight(img);
  uint8_t *buf = calloc(w * h * 4, 1);
  CGColorSpaceRef esp = CGColorSpaceCreateDeviceRGB();
  CGContextRef ctx = CGBitmapContextCreate(buf, w, h, 8, w * 4, esp,
                                           kCGImageAlphaPremultipliedLast | kCGBitmapByteOrder32Big);
  CGColorSpaceRelease(esp);
  CGContextDrawImage(ctx, CGRectMake(0, 0, w, h), img);
  CGContextRelease(ctx);
  *larg = w; *alt = h;
  return buf;
}

static CGImageRef DoBuffer(uint8_t *buf, size_t w, size_t h) {
  CGColorSpaceRef esp = CGColorSpaceCreateDeviceRGB();
  CGContextRef ctx = CGBitmapContextCreate(buf, w, h, 8, w * 4, esp,
                                           kCGImageAlphaPremultipliedLast | kCGBitmapByteOrder32Big);
  CGColorSpaceRelease(esp);
  CGImageRef img = CGBitmapContextCreateImage(ctx);
  CGContextRelease(ctx);
  return img;
}

/**
 * Apaga o fundo claro e uniforme. Só mexe em pixel quase branco E quase cinza
 * (pouca diferença entre os canais) — assim um logo branco sobre cor viva
 * continua intacto, e só o fundo some.
 */
static void ApagarFundoClaro(uint8_t *buf, size_t w, size_t h) {
  for (size_t i = 0; i < w * h; i++) {
    uint8_t *p = buf + i * 4;
    if (p[3] == 0) continue;
    int r = p[0], g = p[1], b = p[2];
    int maior = MAX(r, MAX(g, b)), menor = MIN(r, MIN(g, b));
    if (menor >= 238 && (maior - menor) <= 12) {
      p[0] = p[1] = p[2] = p[3] = 0;
    }
  }
}

/** Retângulo que sobra depois de tirar a borda transparente. */
static CGRect AreaUtil(uint8_t *buf, size_t w, size_t h) {
  size_t x0 = w, y0 = h, x1 = 0, y1 = 0;
  BOOL achou = NO;
  for (size_t y = 0; y < h; y++) {
    for (size_t x = 0; x < w; x++) {
      if (buf[(y * w + x) * 4 + 3] > 12) {
        achou = YES;
        if (x < x0) x0 = x;
        if (y < y0) y0 = y;
        if (x > x1) x1 = x;
        if (y > y1) y1 = y;
      }
    }
  }
  if (!achou) return CGRectMake(0, 0, w, h);
  return CGRectMake(x0, y0, x1 - x0 + 1, y1 - y0 + 1);
}

static BOOL Gravar(CGImageRef img, NSString *caminho) {
  NSURL *url = [NSURL fileURLWithPath:caminho];
  CGImageDestinationRef dest =
      CGImageDestinationCreateWithURL((__bridge CFURLRef)url, (CFStringRef) @"public.png", 1, NULL);
  if (!dest) return NO;
  CGImageDestinationAddImage(dest, img, NULL);
  BOOL ok = CGImageDestinationFinalize(dest);
  CFRelease(dest);
  return ok;
}

int main(int argc, const char *argv[]) {
  @autoreleasepool {
    if (argc < 4) {
      fprintf(stderr, "uso: tratar-imagem <logo|quadra|corte> <entrada> <saida> ...\n");
      return 2;
    }
    NSString *modo = @(argv[1]);
    NSString *entrada = @(argv[2]);
    NSString *saida = @(argv[3]);

    CGImageRef original = CarregarImagem(entrada);
    if (!original) { fprintf(stderr, "não consegui abrir: %s\n", argv[2]); return 1; }

    size_t w, h;
    uint8_t *buf = LerPixels(original, &w, &h);
    CGImageRelease(original);

    CGRect recorte;
    size_t ladoW, ladoH;

    if ([modo isEqualToString:@"logo"]) {
      ApagarFundoClaro(buf, w, h);
      recorte = AreaUtil(buf, w, h);
      ladoW = argc > 4 ? atoi(argv[4]) : 400;
      ladoH = 0;  // mantém proporção
    } else if ([modo isEqualToString:@"quadra"]) {
      size_t lado = MIN(w, h);
      recorte = CGRectMake((w - lado) / 2.0, (h - lado) / 2.0, lado, lado);
      ladoW = argc > 4 ? atoi(argv[4]) : 400;
      ladoH = ladoW;
    } else if ([modo isEqualToString:@"corte"]) {
      double propW = argc > 4 ? atof(argv[4]) : 16;
      double propH = argc > 5 ? atof(argv[5]) : 9;
      double ancora = argc > 6 ? atof(argv[6]) : 0.5;  // 0 = esquerda, 1 = direita
      double alvo = propW / propH, atual = (double)w / (double)h;
      if (atual > alvo) {
        double nw = h * alvo;
        recorte = CGRectMake((w - nw) * ancora, 0, nw, h);
      } else {
        double nh = w / alvo;
        recorte = CGRectMake(0, (h - nh) * ancora, w, nh);
      }
      ladoW = argc > 7 ? atoi(argv[7]) : (size_t)recorte.size.width;
      ladoH = (size_t)round(ladoW * propH / propW);
    } else {
      fprintf(stderr, "modo desconhecido: %s\n", argv[1]);
      free(buf);
      return 2;
    }

    CGImageRef cortada = DoBuffer(buf, w, h);
    CGImageRef pedaco = CGImageCreateWithImageInRect(cortada, recorte);
    CGImageRelease(cortada);
    free(buf);
    if (!pedaco) { fprintf(stderr, "recorte inválido\n"); return 1; }

    size_t pw = CGImageGetWidth(pedaco), ph = CGImageGetHeight(pedaco);
    size_t fw, fh;
    if (ladoH == 0) {
      // cabe dentro de um quadrado de lado ladoW, sem esticar
      double escala = (double)ladoW / (double)MAX(pw, ph);
      if (escala > 1) escala = 1;
      fw = (size_t)round(pw * escala);
      fh = (size_t)round(ph * escala);
    } else {
      fw = ladoW; fh = ladoH;
    }
    if (fw < 1) fw = 1;
    if (fh < 1) fh = 1;

    uint8_t *saidaBuf = calloc(fw * fh * 4, 1);
    CGColorSpaceRef esp = CGColorSpaceCreateDeviceRGB();
    CGContextRef ctx = CGBitmapContextCreate(saidaBuf, fw, fh, 8, fw * 4, esp,
                                             kCGImageAlphaPremultipliedLast | kCGBitmapByteOrder32Big);
    CGColorSpaceRelease(esp);
    CGContextSetInterpolationQuality(ctx, kCGInterpolationHigh);
    CGContextDrawImage(ctx, CGRectMake(0, 0, fw, fh), pedaco);
    CGImageRelease(pedaco);
    CGImageRef final = CGBitmapContextCreateImage(ctx);
    CGContextRelease(ctx);

    BOOL ok = Gravar(final, saida);
    CGImageRelease(final);
    free(saidaBuf);
    if (!ok) { fprintf(stderr, "não consegui gravar: %s\n", argv[3]); return 1; }
    printf("%zux%zu\n", fw, fh);
    return 0;
  }
}
