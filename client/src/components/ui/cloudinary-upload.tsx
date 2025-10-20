import { useState } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface CloudinaryUploadProps {
  onUpload: (imageUrl: string) => void;
  maxSize?: number; // in MB
  folder?: string;
}

export function CloudinaryUpload({ onUpload, maxSize = 5, folder = 'giantcasino/products' }: CloudinaryUploadProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const { toast } = useToast();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size
    const fileSizeInMB = file.size / (1024 * 1024);
    if (fileSizeInMB > maxSize) {
      toast({
        title: 'Fichier trop volumineux',
        description: `La taille maximale est ${maxSize}MB`,
        variant: 'destructive',
      });
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to Cloudinary
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET || '');
      formData.append('folder', folder);

      const cloudName = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;
      if (!cloudName) {
        throw new Error('Cloudinary configuration missing');
      }

      const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      onUpload(data.secure_url);

      toast({
        title: 'Image uploadée',
        description: 'L\'image a été uploadée avec succès',
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Erreur d\'upload',
        description: 'Impossible d\'uploader l\'image',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center w-full">
        <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-border rounded-lg cursor-pointer bg-muted/30 hover:bg-muted/50 transition">
          {preview ? (
            <div className="relative w-full h-full">
              <img
                src={preview}
                alt="Preview"
                className="w-full h-full object-cover rounded-lg"
              />
              <button
                onClick={(e) => {
                  e.preventDefault();
                  setPreview(null);
                }}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <ImageIcon className="h-12 w-12 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold">Cliquez pour télécharger</span> ou glissez une image
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                PNG, JPG jusqu'à {maxSize}MB
              </p>
            </div>
          )}
          <input
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleFileSelect}
            disabled={isLoading}
          />
        </label>
      </div>
      {isLoading && (
        <div className="flex items-center justify-center gap-2">
          <div className="h-4 w-4 rounded-full bg-primary animate-bounce"></div>
          <span className="text-sm text-muted-foreground">Upload en cours...</span>
        </div>
      )}
    </div>
  );
}
