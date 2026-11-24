import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Coffee, Check, Palette, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Fabric2DEditor } from './Fabric2DEditor';
import { MugPreview3D } from './MugPreview3D';
import { MUG_VARIANTS, MugVariant } from './types';
import { useToast } from '@/hooks/use-toast';

const MUG_COLORS = [
  { name: 'White', value: '#ffffff' },
  { name: 'Black', value: '#1a1a1a' },
  { name: 'Navy', value: '#1e3a5f' },
  { name: 'Red', value: '#dc2626' },
  { name: 'Forest', value: '#166534' },
  { name: 'Purple', value: '#7c3aed' },
];

export function MugCustomizer() {
  const [selectedVariant, setSelectedVariant] = useState<MugVariant>(MUG_VARIANTS[0]);
  const [canvasTexture, setCanvasTexture] = useState<string | null>(null);
  const [mugColor, setMugColor] = useState('#ffffff');
  
  const { toast } = useToast();

  const handleCanvasUpdate = useCallback((dataUrl: string) => {
    setCanvasTexture(dataUrl);
  }, []);

  const handleExportReady = useCallback((dataUrl: string) => {
    // Create download link
    const link = document.createElement('a');
    link.download = `mug-design-${selectedVariant.id}-${Date.now()}.png`;
    link.href = dataUrl;
    link.click();
    
    toast({
      title: "Design Exported",
      description: "Your print-ready file has been downloaded (300 DPI)"
    });
  }, [selectedVariant.id, toast]);

  return (
    <div className="min-w-0 space-y-5 sm:space-y-6">
      {/* Header */}
      <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <div className="p-2 rounded-xl bg-accent/10">
            <Coffee className="w-6 h-6 text-accent" />
          </div>
          <div className="min-w-0">
            <h2 className="text-xl font-bold">Magic Cup Designer</h2>
            <p className="text-sm text-muted-foreground">Create your custom printed mug</p>
          </div>
        </div>
        
        {/* Variant Selection */}
        <div className="flex min-w-0 flex-wrap gap-2 sm:justify-end">
          {MUG_VARIANTS.map((variant) => (
            <Button
              key={variant.id}
              variant={selectedVariant.id === variant.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedVariant(variant)}
              className="min-w-0 gap-2 whitespace-normal sm:whitespace-nowrap"
            >
              <Coffee className="w-4 h-4" />
              {variant.name}
              <span className="text-xs opacity-70">₹{variant.price}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Main Editor Layout */}
      <div className="grid min-w-0 gap-6 lg:grid-cols-2">
        {/* Left: 2D Editor */}
        <div className="min-w-0 space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Sparkles className="w-4 h-4" />
            2D Design Editor
          </div>
          <div className="glass-card min-w-0 rounded-2xl p-2 sm:p-4">
            <Fabric2DEditor
              variant={selectedVariant}
              onCanvasUpdate={handleCanvasUpdate}
              onExportReady={handleExportReady}
            />
          </div>
        </div>

        {/* Right: 3D Preview */}
        <div className="flex min-w-0 flex-col space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Coffee className="w-4 h-4" />
            3D Live Preview
          </div>
          <div className="glass-card min-w-0 flex-1 rounded-2xl p-2 sm:p-4">
            <MugPreview3D
              canvasTexture={canvasTexture}
              variant={selectedVariant}
              mugColor={mugColor}
            />
          </div>

          {/* Color Selection */}
          <div className="glass-card rounded-2xl p-3 sm:p-4">
            <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
              <Palette className="w-4 h-4" />
              Mug Color
            </h4>
            <div className="flex flex-wrap gap-2">
              {MUG_COLORS.map((color) => (
                <motion.button
                  key={color.value}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setMugColor(color.value)}
                  className={`w-10 h-10 rounded-full border-2 transition-all ${
                    mugColor === color.value
                      ? 'border-accent scale-110 shadow-lg'
                      : 'border-transparent hover:border-muted-foreground/30'
                  }`}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                  aria-label={`Use ${color.name} mug color`}
                  aria-pressed={mugColor === color.value}
                >
                  {mugColor === color.value && (
                    <Check className={`w-4 h-4 mx-auto ${color.value === '#ffffff' ? 'text-black' : 'text-white'}`} />
                  )}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Pricing Info */}
          <div className="glass-card rounded-2xl p-3 sm:p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Selected Variant</p>
                <p className="text-2xl font-bold text-gradient-accent">
                  ₹{selectedVariant.price}
                </p>
              </div>
              <div className="sm:text-right">
                <p className="text-xs text-muted-foreground">Print Area</p>
                <p className="text-sm font-medium">{selectedVariant.printArea.width}x{selectedVariant.printArea.height}px</p>
                <p className="text-xs text-muted-foreground">300 DPI Ready</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
