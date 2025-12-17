/**
 * Calculates a sharpness score for an image using a simplified 
 * edge detection method (approximation of Laplacian variance)
 * to maintain high performance in JS.
 */
export const calculateSharpness = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
): number => {
  try {
    // We only scan the center 60% of the image for performance and relevance
    const startX = Math.floor(width * 0.2);
    const startY = Math.floor(height * 0.2);
    const scanWidth = Math.floor(width * 0.6);
    const scanHeight = Math.floor(height * 0.6);

    const imageData = ctx.getImageData(startX, startY, scanWidth, scanHeight);
    const data = imageData.data;
    const rowWidth = scanWidth * 4; // 4 bytes per pixel
    let sumDifference = 0;
    
    // Check horizontal AND vertical differences
    // Stop early to avoid boundary errors
    for (let i = 0; i < data.length - rowWidth - 4; i += 4) {
      // Grayscale conversion: 0.299R + 0.587G + 0.114B
      const currentVal = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
      
      // Horizontal neighbor (i+4)
      const rightVal = data[i + 4] * 0.299 + data[i + 5] * 0.587 + data[i + 6] * 0.114;
      
      // Vertical neighbor (i+rowWidth)
      const bottomVal = data[i + rowWidth] * 0.299 + data[i + rowWidth + 1] * 0.587 + data[i + rowWidth + 2] * 0.114;
      
      // Add both gradients to sum
      sumDifference += Math.abs(currentVal - rightVal) + Math.abs(currentVal - bottomVal);
    }

    // Normalize score and scale up by 10 for better UX (0-100 feel)
    const pixelCount = scanWidth * scanHeight;
    const score = (sumDifference / pixelCount) * 10;
    
    return Math.floor(score);
  } catch (e) {
    console.error("Sharpness calc failed", e);
    return 0;
  }
};

export const resizeImage = (dataUrl: string, maxWidth: number = 1024): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = dataUrl;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const scale = maxWidth / img.width;
      
      if (scale >= 1) {
        resolve(dataUrl); // No resize needed
        return;
      }

      canvas.width = maxWidth;
      canvas.height = img.height * scale;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        // Compress to JPEG 0.8 for Gemini payload optimization
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      } else {
        resolve(dataUrl);
      }
    };
  });
};