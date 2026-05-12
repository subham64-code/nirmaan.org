"use client";

import Image from "next/image";
import { useState } from "react";

interface ImageWithFallbackProps {
  src: string;
  alt: string;
  fallbackText?: string;
  fallbackClassName?: string;
  className?: string;
  width?: number;
  height?: number;
  fill?: boolean;
  sizes?: string;
  priority?: boolean;
}

export default function ImageWithFallback({
  src,
  alt,
  fallbackText,
  fallbackClassName = "",
  className = "",
  width,
  height,
  fill = false,
  sizes,
  priority = false
}: ImageWithFallbackProps) {
  const [imageError, setImageError] = useState(false);

  if (imageError) {
    // Render fallback
    if (fill) {
      return (
        <div className={`flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold ${fallbackClassName} ${className}`}>
          {fallbackText || alt.charAt(0).toUpperCase()}
        </div>
      );
    }
    
    return (
      <div className={`flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold ${fallbackClassName} ${className}`}>
        {fallbackText || alt.charAt(0).toUpperCase()}
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      fill={fill}
      sizes={sizes}
      priority={priority}
      className={className}
      onError={() => setImageError(true)}
    />
  );
}
