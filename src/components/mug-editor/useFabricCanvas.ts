import { useRef, useEffect, useCallback, useState } from 'react';
import { MugVariant, CanvasExportOptions } from './types';

// Types for Fabric.js (loaded dynamically)
type FabricCanvas = any;
type FabricModule = typeof import('fabric');

interface UseFabricCanvasOptions {
  variant: MugVariant;
  onCanvasUpdate: (dataUrl: string) => void;
}

interface UseFabricCanvasReturn {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  containerRef: React.RefObject<HTMLDivElement>;
  isReady: boolean;
  hasImage: boolean;
  addImage: (imageUrl: string) => Promise<void>;
  removeSelected: () => void;
  clearCanvas: () => void;
  centerSelected: () => void;
  rotateSelected: (degrees: number) => void;
  scaleSelected: (factor: number) => void;
  exportCanvas: (options?: Partial<CanvasExportOptions>) => string | null;
  getPrintReadyExport: () => string | null;
  getCanvasDisplaySize: () => { width: number; height: number };
}

const MAX_CANVAS_WIDTH = 500;
const MAX_CANVAS_HEIGHT = 350;
const MIN_CANVAS_WIDTH = 1;
const SAFE_MARGIN_RATIO = 10 / MAX_CANVAS_WIDTH;

export function useFabricCanvas({ variant, onCanvasUpdate }: UseFabricCanvasOptions): UseFabricCanvasReturn {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fabricRef = useRef<FabricCanvas | null>(null);
  const fabricModuleRef = useRef<FabricModule | null>(null);
  const initializingRef = useRef(false);
  const displaySizeRef = useRef({ width: 0, height: 0 });
  const onCanvasUpdateRef = useRef(onCanvasUpdate);
  const variantRef = useRef(variant);
  const resizeFrameRef = useRef<number | null>(null);
  const [displaySize, setDisplaySize] = useState({ width: 0, height: 0 });
  const [isReady, setIsReady] = useState(false);
  const [hasImage, setHasImage] = useState(false);

  useEffect(() => {
    onCanvasUpdateRef.current = onCanvasUpdate;
  }, [onCanvasUpdate]);

  useEffect(() => {
    variantRef.current = variant;
  }, [variant]);

  // Fit the print-area ratio inside both the measured container and the desktop caps.
  const calculateDisplaySize = useCallback((availableWidth: number) => {
    const { aspectRatio } = variant.printArea;
    const boundedWidth = Math.max(MIN_CANVAS_WIDTH, Math.min(availableWidth, MAX_CANVAS_WIDTH));
    let width = boundedWidth;
    let height = width / aspectRatio;

    if (height > MAX_CANVAS_HEIGHT) {
      height = MAX_CANVAS_HEIGHT;
      width = height * aspectRatio;
    }

    return {
      width: Math.max(MIN_CANVAS_WIDTH, Math.round(width)),
      height: Math.max(MIN_CANVAS_WIDTH, Math.round(height)),
    };
  }, [variant.printArea]);

  const getCanvasDisplaySize = useCallback(() => {
    if (displaySizeRef.current.width > 0) return displaySizeRef.current;
    return calculateDisplaySize(MAX_CANVAS_WIDTH);
  }, [calculateDisplaySize]);

  const exportCanvasInternal = useCallback((
    canvas: FabricCanvas,
    multiplier: number = 1,
    options?: Partial<CanvasExportOptions>,
    targetSize?: { width: number; height: number }
  ): string => {
    const borders = canvas.getObjects().filter((obj: any) => obj.__isPrintAreaBorder === true);
    borders.forEach((border: any) => {
      border.visible = false;
    });

    canvas.renderAll();
    let dataUrl: string;

    if (targetSize) {
      const renderedCanvas = canvas.toCanvasElement(multiplier, {
        width: canvas.getWidth(),
        height: canvas.getHeight(),
      });
      const outputCanvas = document.createElement('canvas');
      outputCanvas.width = targetSize.width;
      outputCanvas.height = targetSize.height;
      const outputContext = outputCanvas.getContext('2d');
      outputContext?.drawImage(renderedCanvas, 0, 0, targetSize.width, targetSize.height);
      dataUrl = outputCanvas.toDataURL(
        options?.format === 'jpeg' ? 'image/jpeg' : 'image/png',
        options?.quality ?? 1
      );
    } else {
      dataUrl = canvas.toDataURL({
        format: options?.format || 'png',
        quality: options?.quality ?? 1,
        multiplier,
        enableRetinaScaling: false,
      });
    }

    borders.forEach((border: any) => {
      border.visible = true;
    });
    canvas.renderAll();

    return dataUrl;
  }, []);

  const publishCanvas = useCallback((canvas: FabricCanvas) => {
    const currentWidth = displaySizeRef.current.width || canvas.getWidth();
    if (!currentWidth) return null;

    const multiplier = variantRef.current.printArea.width / currentWidth;
    const dataUrl = exportCanvasInternal(
      canvas,
      multiplier,
      { format: 'png', quality: 1 },
      variantRef.current.printArea
    );
    onCanvasUpdateRef.current(dataUrl);
    return dataUrl;
  }, [exportCanvasInternal]);

  const rebuildGuides = useCallback((canvas: FabricCanvas, width: number, height: number) => {
    const fabricModule = fabricModuleRef.current;
    if (!fabricModule) return;

    canvas.getObjects()
      .filter((obj: any) => obj.__isPrintAreaBorder === true)
      .forEach((obj: any) => canvas.remove(obj));

    const safeMargin = Math.max(6, Math.min(width, height) * SAFE_MARGIN_RATIO);
    const guideScale = Math.max(0.65, Math.min(1, width / MAX_CANVAS_WIDTH));

    const printAreaBorder = new fabricModule.Rect({
      left: 0,
      top: 0,
      width,
      height,
      fill: 'transparent',
      stroke: '#3b82f6',
      strokeWidth: 2 * guideScale,
      strokeDashArray: [8 * guideScale, 4 * guideScale],
      selectable: false,
      evented: false,
    });
    (printAreaBorder as any).__isPrintAreaBorder = true;

    const safeZone = new fabricModule.Rect({
      left: safeMargin,
      top: safeMargin,
      width: Math.max(0, width - safeMargin * 2),
      height: Math.max(0, height - safeMargin * 2),
      fill: 'transparent',
      stroke: '#22c55e',
      strokeWidth: guideScale,
      strokeDashArray: [4 * guideScale, 4 * guideScale],
      selectable: false,
      evented: false,
      opacity: 0.6,
    });
    (safeZone as any).__isPrintAreaBorder = true;

    const cornerSize = Math.min(20, width * 0.08, height * 0.18);
    const corners = [
      [[0, cornerSize], [0, 0], [cornerSize, 0]],
      [[width - cornerSize, 0], [width, 0], [width, cornerSize]],
      [[0, height - cornerSize], [0, height], [cornerSize, height]],
      [[width - cornerSize, height], [width, height], [width, height - cornerSize]],
    ];

    corners.forEach((points) => {
      const cornerLine = new fabricModule.Polyline(
        points.map(([x, y]) => ({ x, y })),
        {
          fill: 'transparent',
          stroke: '#3b82f6',
          strokeWidth: 3 * guideScale,
          selectable: false,
          evented: false,
        }
      );
      (cornerLine as any).__isPrintAreaBorder = true;
      canvas.add(cornerLine);
      canvas.sendObjectToBack(cornerLine);
    });

    canvas.add(printAreaBorder);
    canvas.add(safeZone);
    canvas.sendObjectToBack(safeZone);
    canvas.sendObjectToBack(printAreaBorder);
  }, []);

  const resizeFabricCanvas = useCallback((nextSize: { width: number; height: number }) => {
    const canvas = fabricRef.current;
    if (!canvas || nextSize.width <= 0 || nextSize.height <= 0) return;

    // The measured size may have been superseded before this animation frame ran.
    const requestedSize = displaySizeRef.current;
    const targetSize = requestedSize.width > 0 ? requestedSize : nextSize;
    const previousWidth = canvas.getWidth();
    const previousHeight = canvas.getHeight();
    if (previousWidth === targetSize.width && previousHeight === targetSize.height) return;

    const scaleX = previousWidth > 0 ? targetSize.width / previousWidth : 1;
    const scaleY = previousHeight > 0 ? targetSize.height / previousHeight : 1;

    canvas.discardActiveObject();
    canvas.getObjects().forEach((obj: any) => {
      if (obj.__isPrintAreaBorder === true) return;
      obj.set({
        left: (obj.left ?? 0) * scaleX,
        top: (obj.top ?? 0) * scaleY,
        scaleX: (obj.scaleX ?? 1) * scaleX,
        scaleY: (obj.scaleY ?? 1) * scaleY,
      });
      obj.setCoords();
    });

    canvas.setDimensions(targetSize);
    rebuildGuides(canvas, targetSize.width, targetSize.height);
    canvas.calcOffset();
    canvas.renderAll();
    publishCanvas(canvas);
  }, [publishCanvas, rebuildGuides]);

  // Measure the real canvas slot, including every orientation and responsive layout change.
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const measure = () => {
      const nextSize = calculateDisplaySize(container.getBoundingClientRect().width);
      const currentSize = displaySizeRef.current;
      if (nextSize.width === currentSize.width && nextSize.height === currentSize.height) return;

      displaySizeRef.current = nextSize;
      setDisplaySize(nextSize);
      resizeFabricCanvas(nextSize);
    };

    measure();

    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', measure);
      return () => window.removeEventListener('resize', measure);
    }

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      const observedWidth = entry?.contentRect.width || container.getBoundingClientRect().width;
      const nextSize = calculateDisplaySize(observedWidth);
      const currentSize = displaySizeRef.current;
      if (nextSize.width === currentSize.width && nextSize.height === currentSize.height) return;

      // Update immediately so Fabric's own DOM mutation cannot feed a stale width back into the observer.
      displaySizeRef.current = nextSize;
      setDisplaySize(nextSize);
      if (resizeFrameRef.current !== null) cancelAnimationFrame(resizeFrameRef.current);
      resizeFrameRef.current = requestAnimationFrame(() => resizeFabricCanvas(nextSize));
    });
    observer.observe(container);

    return () => {
      observer.disconnect();
      if (resizeFrameRef.current !== null) {
        cancelAnimationFrame(resizeFrameRef.current);
        resizeFrameRef.current = null;
      }
    };
  }, [calculateDisplaySize, resizeFabricCanvas]);

  // Initialize once the container has a measurable width. Resizing is handled in place.
  useEffect(() => {
    if (!canvasRef.current || initializingRef.current || displaySize.width <= 0) return;

    initializingRef.current = true;
    let mounted = true;
    let canvas: FabricCanvas | null = null;

    const initFabric = async () => {
      try {
        const fabricModule = await import('fabric');

        if (!mounted || !canvasRef.current) {
          initializingRef.current = false;
          return;
        }

        fabricModuleRef.current = fabricModule;
        const { width, height } = displaySizeRef.current;
        canvas = new fabricModule.Canvas(canvasRef.current, {
          width,
          height,
          backgroundColor: '#ffffff',
          selection: true,
          preserveObjectStacking: true,
        });

        fabricRef.current = canvas;
        rebuildGuides(canvas, width, height);

        const handleChange = () => {
          if (fabricRef.current && mounted) publishCanvas(fabricRef.current);
        };

        canvas.on('object:modified', handleChange);
        canvas.on('object:added', handleChange);
        canvas.on('object:removed', handleChange);

        if (mounted) setIsReady(true);
      } catch (error) {
        console.error('Failed to initialize Fabric canvas:', error);
        initializingRef.current = false;
      }
    };

    initFabric();

    return () => {
      mounted = false;
      if (canvas) void canvas.dispose();
      fabricRef.current = null;
      fabricModuleRef.current = null;
      initializingRef.current = false;
      setIsReady(false);
      setHasImage(false);
    };
  }, [displaySize.width > 0, publishCanvas, rebuildGuides]);

  // A variant changes the print specification while retaining the same editable artwork.
  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    const nextSize = calculateDisplaySize(containerRef.current?.getBoundingClientRect().width || MAX_CANVAS_WIDTH);
    const currentSize = displaySizeRef.current;
    if (nextSize.width !== currentSize.width || nextSize.height !== currentSize.height) {
      displaySizeRef.current = nextSize;
      setDisplaySize(nextSize);
      resizeFabricCanvas(nextSize);
      return;
    }

    publishCanvas(canvas);
  }, [variant, calculateDisplaySize, publishCanvas, resizeFabricCanvas]);

  const exportCanvas = useCallback((options?: Partial<CanvasExportOptions>): string | null => {
    const canvas = fabricRef.current;
    if (!canvas) return null;

    const currentWidth = displaySizeRef.current.width || canvas.getWidth();
    const multiplier = options?.multiplier ?? (variantRef.current.printArea.width / currentWidth);
    const dataUrl = exportCanvasInternal(
      canvas,
      multiplier,
      options,
      options?.multiplier === undefined ? variantRef.current.printArea : undefined
    );
    onCanvasUpdateRef.current(dataUrl);
    return dataUrl;
  }, [exportCanvasInternal]);

  const addImage = useCallback(async (imageUrl: string): Promise<void> => {
    if (!fabricRef.current || !fabricModuleRef.current) return;

    const fabricModule = fabricModuleRef.current;
    const canvas = fabricRef.current;
    const { width, height } = displaySizeRef.current;

    try {
      const img = await fabricModule.FabricImage.fromURL(imageUrl, { crossOrigin: 'anonymous' });
      const imgAspect = img.width! / img.height!;
      const canvasAspect = width / height;
      const scale = imgAspect > canvasAspect
        ? (width * 0.9) / img.width!
        : (height * 0.9) / img.height!;

      img.set({
        left: width / 2,
        top: height / 2,
        originX: 'center',
        originY: 'center',
        scaleX: scale,
        scaleY: scale,
        cornerSize: 14,
        cornerColor: '#3b82f6',
        cornerStrokeColor: '#ffffff',
        borderColor: '#3b82f6',
        transparentCorners: false,
        borderScaleFactor: 2,
      });

      canvas.getObjects().forEach((obj: any) => {
        if (obj.type === 'image') canvas.remove(obj);
      });

      canvas.add(img);
      canvas.setActiveObject(img);
      canvas.renderAll();
      setHasImage(true);
      publishCanvas(canvas);
    } catch (error) {
      console.error('Failed to load image:', error);
    }
  }, [publishCanvas]);

  const removeSelected = useCallback(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    const activeObject = canvas.getActiveObject();
    if (activeObject && activeObject.__isPrintAreaBorder !== true) {
      canvas.remove(activeObject);
      canvas.renderAll();
      setHasImage(canvas.getObjects().some((obj: any) => obj.type === 'image'));
      publishCanvas(canvas);
    }
  }, [publishCanvas]);

  const clearCanvas = useCallback(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    [...canvas.getObjects()].forEach((obj: any) => {
      if (obj.__isPrintAreaBorder !== true) canvas.remove(obj);
    });
    canvas.renderAll();
    setHasImage(false);
    publishCanvas(canvas);
  }, [publishCanvas]);

  const centerSelected = useCallback(() => {
    const canvas = fabricRef.current;
    const activeObject = canvas?.getActiveObject();
    if (!canvas || !activeObject) return;

    const { width, height } = displaySizeRef.current;
    activeObject.set({
      left: width / 2,
      top: height / 2,
      originX: 'center',
      originY: 'center',
    });
    activeObject.setCoords();
    canvas.renderAll();
    publishCanvas(canvas);
  }, [publishCanvas]);

  const rotateSelected = useCallback((degrees: number) => {
    const canvas = fabricRef.current;
    const activeObject = canvas?.getActiveObject();
    if (!canvas || !activeObject) return;

    activeObject.rotate((activeObject.angle || 0) + degrees);
    activeObject.setCoords();
    canvas.renderAll();
    publishCanvas(canvas);
  }, [publishCanvas]);

  const scaleSelected = useCallback((factor: number) => {
    const canvas = fabricRef.current;
    const activeObject = canvas?.getActiveObject();
    if (!canvas || !activeObject) return;

    activeObject.set({
      scaleX: (activeObject.scaleX || 1) * factor,
      scaleY: (activeObject.scaleY || 1) * factor,
    });
    activeObject.setCoords();
    canvas.renderAll();
    publishCanvas(canvas);
  }, [publishCanvas]);

  const getPrintReadyExport = useCallback((): string | null => {
    const canvas = fabricRef.current;
    if (!canvas) return null;

    const currentWidth = displaySizeRef.current.width || canvas.getWidth();
    return exportCanvasInternal(
      canvas,
      variantRef.current.printArea.width / currentWidth,
      { format: 'png', quality: 1 },
      variantRef.current.printArea
    );
  }, [exportCanvasInternal]);

  return {
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
    exportCanvas,
    getPrintReadyExport,
    getCanvasDisplaySize,
  };
}
