import { useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  Upload, Trash2, RotateCcw, RotateCw, 
  ZoomIn, ZoomOut, Move, Download, X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFabricCanvas } from './useFabricCanvas';
import { MugVariant } from './types';

interface Fabric2DEditorProps {
  variant: MugVariant;
  onCanvasUpdate: (dataUrl: string) => void;
  onExportReady?: (dataUrl: string) => void;
}

export function Fabric2DEditor({ 
  variant, 
  onCanvasUpdate,
  onExportReady 
}: Fabric2DEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const {
    canvasRef,
    containerRef,
    isReady,
    hasImage,
    addImage,
    removeSelected,
    clearCanvas,
    centerSelected,
    rotateSelected,
    scaleSelected,
    getPrintReadyExport,
    getCanvasDisplaySize
  } = useFabricCanvas({ variant, onCanvasUpdate });

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (PNG, JPG, WEBP)');
      return;
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      addImage(dataUrl);
    };
    reader.readAsDataURL(file);
    
    // Reset input
    e.target.value = '';
  }, [addImage]);

  const handleExport = useCallback(() => {
    const dataUrl = getPrintReadyExport();
    if (dataUrl && onExportReady) {
      onExportReady(dataUrl);
    }
  }, [getPrintReadyExport, onExportReady]);

  const { width, height } = getCanvasDisplaySize();

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 p-2.5 sm:p-3 bg-muted/50 rounded-xl">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={handleFileUpload}
          className="hidden"
        />
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          className="gap-2 grow sm:grow-0"
        >
          <Upload className="w-4 h-4" />
          Upload Image
        </Button>

        <div className="hidden h-6 w-px bg-border mx-1 sm:block" />

        <Button
          variant="ghost"
          size="icon"
          onClick={() => rotateSelected(-15)}
          disabled={!hasImage}
          title="Rotate Left"
          aria-label="Rotate image left"
          className="h-10 w-10 sm:h-9 sm:w-9"
        >
          <RotateCcw className="w-4 h-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={() => rotateSelected(15)}
          disabled={!hasImage}
          title="Rotate Right"
          aria-label="Rotate image right"
          className="h-10 w-10 sm:h-9 sm:w-9"
        >
          <RotateCw className="w-4 h-4" />
        </Button>

        <div className="hidden h-6 w-px bg-border mx-1 sm:block" />

        <Button
          variant="ghost"
          size="icon"
          onClick={() => scaleSelected(1.1)}
          disabled={!hasImage}
          title="Scale Up"
          aria-label="Enlarge image"
          className="h-10 w-10 sm:h-9 sm:w-9"
        >
          <ZoomIn className="w-4 h-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={() => scaleSelected(0.9)}
          disabled={!hasImage}
          title="Scale Down"
          aria-label="Shrink image"
          className="h-10 w-10 sm:h-9 sm:w-9"
        >
          <ZoomOut className="w-4 h-4" />
        </Button>

        <div className="hidden h-6 w-px bg-border mx-1 sm:block" />

        <Button
          variant="ghost"
          size="icon"
          onClick={centerSelected}
          disabled={!hasImage}
          title="Center Image"
          aria-label="Center image"
          className="h-10 w-10 sm:h-9 sm:w-9"
        >
          <Move className="w-4 h-4" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={removeSelected}
          disabled={!hasImage}
          title="Remove Selected"
          aria-label="Remove selected image"
          className="h-10 w-10 text-destructive hover:text-destructive sm:h-9 sm:w-9"
        >
          <X className="w-4 h-4" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={clearCanvas}
          disabled={!hasImage}
          title="Clear All"
          aria-label="Clear all images"
          className="h-10 w-10 text-destructive hover:text-destructive sm:h-9 sm:w-9"
        >
          <Trash2 className="w-4 h-4" />
        </Button>

        <div className="hidden flex-1 sm:block" />

        <Button
          variant="secondary"
          size="sm"
          onClick={handleExport}
          disabled={!hasImage}
          className="gap-2 basis-full sm:ml-auto sm:basis-auto"
        >
          <Download className="w-4 h-4" />
          Export Print File
        </Button>
      </div>

      {/* Canvas Workspace */}
      <div className="rounded-xl bg-muted/30 p-2 sm:p-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-xs">
          {/* Print Area Legend */}
          <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1 rounded-lg border bg-background/90 px-3 py-2 shadow-sm backdrop-blur">
            <span className="font-medium text-foreground">Print Area Guide</span>
            <span className="flex items-center gap-2 text-muted-foreground">
              <span className="w-4 border-t-2 border-dashed border-primary" />
              Print boundary
            </span>
            <span className="flex items-center gap-2 text-muted-foreground">
              <span className="w-4 border-t border-dashed border-emerald-500 opacity-60" />
              Safe zone
            </span>
            <span className="text-[10px] text-muted-foreground">
              {variant.printArea.width / 300}" × {variant.printArea.height / 300}" @ 300 DPI
            </span>
          </div>
        </div>

        <div ref={containerRef} className="flex w-full min-w-0 justify-center overflow-hidden" style={{ minHeight: height }}>
          {/* Canvas */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: isReady ? 1 : 0.5, scale: 1 }}
            className="relative max-w-full overflow-hidden rounded-lg shadow-lg"
            style={{ width, height }}
          >
            <canvas ref={canvasRef} />

            {/* Upload Overlay (when no image) */}
            {!hasImage && isReady && (
              <motion.button
                type="button"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 flex cursor-pointer flex-col items-center justify-center bg-background/50 px-3 text-center backdrop-blur-sm"
                onClick={() => fileInputRef.current?.click()}
                aria-label="Upload an image for the mug design"
              >
                <span className="mb-2 flex h-11 w-11 items-center justify-center rounded-full bg-accent/10 sm:mb-4 sm:h-16 sm:w-16">
                  <Upload className="h-6 w-6 text-accent sm:h-8 sm:w-8" />
                </span>
                <span className="text-sm font-medium text-foreground sm:text-base">Tap to upload your image</span>
                <span className="mt-1 text-[11px] text-muted-foreground sm:text-xs">PNG, JPG, WEBP up to 10MB</span>
                <span className="mt-1 text-[11px] text-emerald-600 dark:text-emerald-400 sm:mt-2 sm:text-xs">Keep design inside green safe zone</span>
              </motion.button>
            )}
          </motion.div>
        </div>

        {/* Guidelines */}
        <p className="mx-auto mt-3 w-fit max-w-full rounded bg-background/80 px-2 py-1 text-center text-[11px] text-muted-foreground backdrop-blur sm:text-xs">
          Drag to position • Corners to resize • Rotate handle on top
        </p>
      </div>
    </div>
  );
}
