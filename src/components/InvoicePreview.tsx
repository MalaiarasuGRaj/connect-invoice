import { useState, useEffect, useRef, ReactNode } from "react";

interface InvoicePreviewProps {
  children: ReactNode;
}

export default function InvoicePreview({ children }: InvoicePreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [containerHeight, setContainerHeight] = useState<number | string>("auto");

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateScale = () => {
      const containerWidth = container.offsetWidth;
      // Total width of A4 template is 210mm
      // We convert 210mm to pixels roughly (794px is a common approximation for A4 @ 96dpi)
      // However, we can also use the actual element width if we can measure it.
      // Since A4InvoiceTemplate has style width: "210mm", we can measure it.
      const targetWidth = 794; // approx for 210mm
      
      if (containerWidth < targetWidth) {
        const newScale = containerWidth / targetWidth;
        setScale(newScale);
        // Adjust container height to match scaled content height to avoid extra space
        // A4 height is 297mm (approx 1123px)
        const targetHeight = 1123;
        setContainerHeight(targetHeight * newScale);
      } else {
        setScale(1);
        setContainerHeight("auto");
      }
    };

    const resizeObserver = new ResizeObserver(updateScale);
    resizeObserver.observe(container);
    updateScale();

    return () => resizeObserver.disconnect();
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="w-full flex justify-center overflow-hidden transition-all duration-300"
      style={{ height: containerHeight }}
    >
      <div 
        style={{ 
          transform: `scale(${scale})`, 
          transformOrigin: "top center",
          width: "210mm", // Match the fixed width of the template
        }}
      >
        {children}
      </div>
    </div>
  );
}
