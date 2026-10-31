// Comprime vídeo e gera poster usando o AVFoundation do próprio macOS.
// Existe porque esta máquina não tem ffmpeg, e o `avconvert` do sistema não
// deixa escolher a taxa de bits — sem isso os vídeos ficam grandes demais.
//
//   clang -fobjc-arc -framework Foundation -framework AVFoundation \
//         -framework CoreMedia -framework CoreVideo -framework ImageIO \
//         -framework CoreGraphics -o comprimir-video scripts/comprimir-video.m
//
//   comprimir-video video  entrada.mov saida.mp4 1280 1200000 128000 [segundos]
//   comprimir-video poster entrada.mp4 saida.jpg 720 [segundo]

#import <AVFoundation/AVFoundation.h>
#import <CoreMedia/CoreMedia.h>
#import <ImageIO/ImageIO.h>

/** H.264 exige lado par; arredonda para baixo. */
static size_t Par(double v) {
  size_t n = (size_t)llround(v);
  return n % 2 ? n - 1 : n;
}

static int GerarPoster(NSString *entrada, NSString *saida, double ladoMax, double segundo) {
  AVURLAsset *asset = [AVURLAsset URLAssetWithURL:[NSURL fileURLWithPath:entrada] options:nil];
  AVAssetImageGenerator *ger = [AVAssetImageGenerator assetImageGeneratorWithAsset:asset];
  ger.appliesPreferredTrackTransform = YES;  // respeita vídeo gravado de lado
  ger.maximumSize = CGSizeMake(ladoMax, ladoMax);
  ger.requestedTimeToleranceBefore = CMTimeMakeWithSeconds(0.5, 600);
  ger.requestedTimeToleranceAfter = CMTimeMakeWithSeconds(2.0, 600);

  NSError *erro = nil;
  CGImageRef img = [ger copyCGImageAtTime:CMTimeMakeWithSeconds(segundo, 600)
                               actualTime:NULL
                                    error:&erro];
  if (!img) {
    // vídeo curto demais para o instante pedido: tenta o primeiro quadro
    img = [ger copyCGImageAtTime:kCMTimeZero actualTime:NULL error:&erro];
  }
  if (!img) {
    fprintf(stderr, "poster: %s\n", erro.localizedDescription.UTF8String);
    return 1;
  }

  NSURL *url = [NSURL fileURLWithPath:saida];
  CGImageDestinationRef dest =
      CGImageDestinationCreateWithURL((__bridge CFURLRef)url, (CFStringRef) @"public.jpeg", 1, NULL);
  if (!dest) { CGImageRelease(img); return 1; }
  NSDictionary *props = @{(id)kCGImageDestinationLossyCompressionQuality : @0.72};
  CGImageDestinationAddImage(dest, img, (__bridge CFDictionaryRef)props);
  BOOL ok = CGImageDestinationFinalize(dest);
  CFRelease(dest);
  printf("%zux%zu\n", CGImageGetWidth(img), CGImageGetHeight(img));
  CGImageRelease(img);
  return ok ? 0 : 1;
}

static int Comprimir(NSString *entrada, NSString *saida, double ladoMax, int bitsVideo,
                     int bitsAudio, double limiteSegundos) {
  NSError *erro = nil;
  AVURLAsset *asset = [AVURLAsset URLAssetWithURL:[NSURL fileURLWithPath:entrada] options:nil];
  AVAssetTrack *faixaV = [asset tracksWithMediaType:AVMediaTypeVideo].firstObject;
  if (!faixaV) { fprintf(stderr, "sem faixa de vídeo\n"); return 1; }
  AVAssetTrack *faixaA = [asset tracksWithMediaType:AVMediaTypeAudio].firstObject;

  CMTimeRange trecho = CMTimeRangeMake(kCMTimeZero, asset.duration);
  if (limiteSegundos > 0 &&
      CMTimeGetSeconds(asset.duration) > limiteSegundos) {
    trecho = CMTimeRangeMake(kCMTimeZero, CMTimeMakeWithSeconds(limiteSegundos, 600));
  }

  // Tamanho já girado: vídeo de celular vem com a rotação na matriz, não nos pixels.
  CGAffineTransform t = faixaV.preferredTransform;
  CGSize nat = faixaV.naturalSize;
  CGRect girado = CGRectApplyAffineTransform(CGRectMake(0, 0, nat.width, nat.height), t);
  double ow = fabs(girado.size.width), oh = fabs(girado.size.height);
  double escala = ladoMax / MAX(ow, oh);
  if (escala > 1) escala = 1;
  size_t rw = Par(ow * escala), rh = Par(oh * escala);
  if (rw < 2 || rh < 2) { fprintf(stderr, "tamanho inválido\n"); return 1; }

  CGAffineTransform final = CGAffineTransformConcat(
      CGAffineTransformConcat(t, CGAffineTransformMakeTranslation(-girado.origin.x, -girado.origin.y)),
      CGAffineTransformMakeScale(escala, escala));

  AVMutableVideoCompositionLayerInstruction *camada =
      [AVMutableVideoCompositionLayerInstruction videoCompositionLayerInstructionWithAssetTrack:faixaV];
  [camada setTransform:final atTime:kCMTimeZero];

  AVMutableVideoCompositionInstruction *instr = [AVMutableVideoCompositionInstruction videoCompositionInstruction];
  instr.timeRange = trecho;
  instr.layerInstructions = @[ camada ];

  AVMutableVideoComposition *comp = [AVMutableVideoComposition videoComposition];
  comp.renderSize = CGSizeMake(rw, rh);
  CMTime frameDur = faixaV.nominalFrameRate > 0
                        ? CMTimeMake(1000, (int32_t)round(faixaV.nominalFrameRate * 1000))
                        : CMTimeMake(1, 30);
  comp.frameDuration = frameDur;
  comp.instructions = @[ instr ];

  AVAssetReader *leitor = [AVAssetReader assetReaderWithAsset:asset error:&erro];
  if (!leitor) { fprintf(stderr, "leitor: %s\n", erro.localizedDescription.UTF8String); return 1; }
  leitor.timeRange = trecho;

  AVAssetReaderVideoCompositionOutput *saidaV = [AVAssetReaderVideoCompositionOutput
      assetReaderVideoCompositionOutputWithVideoTracks:@[ faixaV ]
                                        videoSettings:@{
                                          (id)kCVPixelBufferPixelFormatTypeKey :
                                              @(kCVPixelFormatType_32BGRA)
                                        }];
  saidaV.videoComposition = comp;
  saidaV.alwaysCopiesSampleData = NO;
  [leitor addOutput:saidaV];

  AVAssetReaderAudioMixOutput *saidaA = nil;
  if (faixaA) {
    saidaA = [AVAssetReaderAudioMixOutput
        assetReaderAudioMixOutputWithAudioTracks:@[ faixaA ]
                                   audioSettings:@{
                                     AVFormatIDKey : @(kAudioFormatLinearPCM),
                                     AVLinearPCMBitDepthKey : @16,
                                     AVLinearPCMIsFloatKey : @NO,
                                     AVLinearPCMIsBigEndianKey : @NO,
                                     AVLinearPCMIsNonInterleaved : @NO,
                                     AVSampleRateKey : @44100,
                                     AVNumberOfChannelsKey : @2,
                                   }];
    saidaA.alwaysCopiesSampleData = NO;
    [leitor addOutput:saidaA];
  }

  [[NSFileManager defaultManager] removeItemAtPath:saida error:nil];
  AVAssetWriter *escritor = [AVAssetWriter assetWriterWithURL:[NSURL fileURLWithPath:saida]
                                                     fileType:AVFileTypeMPEG4
                                                        error:&erro];
  if (!escritor) { fprintf(stderr, "escritor: %s\n", erro.localizedDescription.UTF8String); return 1; }
  // põe o índice no começo do arquivo: sem isso o vídeo só toca depois de baixar inteiro
  escritor.shouldOptimizeForNetworkUse = YES;

  AVAssetWriterInput *entradaV = [AVAssetWriterInput
      assetWriterInputWithMediaType:AVMediaTypeVideo
                     outputSettings:@{
                       AVVideoCodecKey : AVVideoCodecTypeH264,
                       AVVideoWidthKey : @(rw),
                       AVVideoHeightKey : @(rh),
                       AVVideoCompressionPropertiesKey : @{
                         AVVideoAverageBitRateKey : @(bitsVideo),
                         AVVideoMaxKeyFrameIntervalKey : @60,
                         AVVideoProfileLevelKey : AVVideoProfileLevelH264HighAutoLevel,
                         AVVideoAllowFrameReorderingKey : @YES,
                       },
                     }];
  entradaV.expectsMediaDataInRealTime = NO;
  [escritor addInput:entradaV];

  AVAssetWriterInput *entradaA = nil;
  if (saidaA) {
    entradaA = [AVAssetWriterInput assetWriterInputWithMediaType:AVMediaTypeAudio
                                                 outputSettings:@{
                                                   AVFormatIDKey : @(kAudioFormatMPEG4AAC),
                                                   AVNumberOfChannelsKey : @2,
                                                   AVSampleRateKey : @44100,
                                                   AVEncoderBitRateKey : @(bitsAudio),
                                                 }];
    entradaA.expectsMediaDataInRealTime = NO;
    [escritor addInput:entradaA];
  }

  if (![leitor startReading]) {
    fprintf(stderr, "não comecei a ler: %s\n", leitor.error.localizedDescription.UTF8String);
    return 1;
  }
  [escritor startWriting];
  [escritor startSessionAtSourceTime:kCMTimeZero];

  dispatch_group_t grupo = dispatch_group_create();
  __block BOOL falhou = NO;

  dispatch_group_enter(grupo);
  dispatch_queue_t filaV = dispatch_queue_create("video", DISPATCH_QUEUE_SERIAL);
  [entradaV requestMediaDataWhenReadyOnQueue:filaV
                                  usingBlock:^{
                                    while (entradaV.isReadyForMoreMediaData) {
                                      CMSampleBufferRef b = [saidaV copyNextSampleBuffer];
                                      if (b) {
                                        if (![entradaV appendSampleBuffer:b]) falhou = YES;
                                        CFRelease(b);
                                        if (falhou) { [entradaV markAsFinished]; dispatch_group_leave(grupo); return; }
                                      } else {
                                        [entradaV markAsFinished];
                                        dispatch_group_leave(grupo);
                                        return;
                                      }
                                    }
                                  }];

  if (entradaA) {
    dispatch_group_enter(grupo);
    dispatch_queue_t filaA = dispatch_queue_create("audio", DISPATCH_QUEUE_SERIAL);
    [entradaA requestMediaDataWhenReadyOnQueue:filaA
                                    usingBlock:^{
                                      while (entradaA.isReadyForMoreMediaData) {
                                        CMSampleBufferRef b = [saidaA copyNextSampleBuffer];
                                        if (b) {
                                          if (![entradaA appendSampleBuffer:b]) falhou = YES;
                                          CFRelease(b);
                                          if (falhou) { [entradaA markAsFinished]; dispatch_group_leave(grupo); return; }
                                        } else {
                                          [entradaA markAsFinished];
                                          dispatch_group_leave(grupo);
                                          return;
                                        }
                                      }
                                    }];
  }

  dispatch_group_wait(grupo, DISPATCH_TIME_FOREVER);

  dispatch_semaphore_t pronto = dispatch_semaphore_create(0);
  [escritor finishWritingWithCompletionHandler:^{ dispatch_semaphore_signal(pronto); }];
  dispatch_semaphore_wait(pronto, DISPATCH_TIME_FOREVER);

  if (escritor.status != AVAssetWriterStatusCompleted) {
    fprintf(stderr, "escrita falhou: %s\n", escritor.error.localizedDescription.UTF8String);
    return 1;
  }
  if (leitor.status == AVAssetReaderStatusFailed) {
    fprintf(stderr, "leitura falhou: %s\n", leitor.error.localizedDescription.UTF8String);
    return 1;
  }
  printf("%zux%zu\n", rw, rh);
  return 0;
}

int main(int argc, const char *argv[]) {
  @autoreleasepool {
    if (argc < 4) {
      fprintf(stderr, "uso: comprimir-video <video|poster> <entrada> <saida> ...\n");
      return 2;
    }
    NSString *modo = @(argv[1]), *entrada = @(argv[2]), *saida = @(argv[3]);
    if ([modo isEqualToString:@"poster"]) {
      double lado = argc > 4 ? atof(argv[4]) : 720;
      double seg = argc > 5 ? atof(argv[5]) : 1.0;
      return GerarPoster(entrada, saida, lado, seg);
    }
    if ([modo isEqualToString:@"video"]) {
      double lado = argc > 4 ? atof(argv[4]) : 1280;
      int bv = argc > 5 ? atoi(argv[5]) : 1200000;
      int ba = argc > 6 ? atoi(argv[6]) : 128000;
      double limite = argc > 7 ? atof(argv[7]) : 0;
      return Comprimir(entrada, saida, lado, bv, ba, limite);
    }
    fprintf(stderr, "modo desconhecido: %s\n", argv[1]);
    return 2;
  }
}
