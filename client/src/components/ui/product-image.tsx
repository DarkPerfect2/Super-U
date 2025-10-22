import { useState } from 'react';
import { Image as ImageIcon } from 'lucide-react';

interface ProductImageProps {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
}

export function ProductImage({ src, alt, className = '', priority = false }: ProductImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const getOptimizedUrl = (url: string): string => {
    if (!url) return '';
    if (url.includes('cloudinary.com')) {
      if (url.includes('/image/upload/')) {
        return url.replace(
          '/image/upload/',
          '/image/upload/w_600,h_600,c_fill,q_auto,f_auto/'
        );
      }
    }
    return url;
  };

  const optimizedUrl = getOptimizedUrl(src);

  return (
    <div className={`relative overflow-hidden bg-muted ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <ImageIcon className="h-8 w-8 text-muted-foreground opacity-50 animate-pulse" />
        </div>
      )}
      {hasError ? (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <ImageIcon className="h-8 w-8 text-muted-foreground opacity-50" />
        </div>
      ) : (
        <img
          src={optimizedUrl}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false);
            setHasError(true);
          }}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            isLoading ? 'opacity-0' : 'opacity-100'
          }`}
        />
      )}
    </div>
  );
}
