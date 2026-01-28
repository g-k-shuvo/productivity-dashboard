import React, { useState, useEffect } from 'react';
import { apiService } from '../../../shared/services/api';
import './VisionBoardWidget.css';

interface VisionBoardImage {
  id: string;
  fileName: string;
  fileType?: string;
  createdAt: string;
}

const VisionBoardWidget: React.FC = () => {
  const [images, setImages] = useState<VisionBoardImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadImages();
  }, []);

  const loadImages = async () => {
    try {
      setLoading(true);
      const response = await apiService.get<{ success: boolean; data: VisionBoardImage[] }>('/files');
      if (response.success) {
        setImages(response.data);
      }
    } catch (error) {
      console.error('Failed to load images:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);

      await apiService.post('/files/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      await loadImages();
    } catch (error) {
      console.error('Failed to upload image:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (imageId: string) => {
    if (!confirm('Are you sure you want to delete this image?')) return;

    try {
      await apiService.delete(`/files/${imageId}`);
      await loadImages();
    } catch (error) {
      console.error('Failed to delete image:', error);
      alert('Failed to delete image. Please try again.');
    }
  };

  if (loading) {
    return <div className="vision-board-widget loading">Loading vision board...</div>;
  }

  return (
    <div className="vision-board-widget">
      <div className="vision-board-header">
        <h3>Vision Board</h3>
        <label className="upload-button">
          {uploading ? 'Uploading...' : 'Upload Image'}
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            disabled={uploading}
            style={{ display: 'none' }}
          />
        </label>
      </div>
      <div className="vision-board-grid">
        {images.length === 0 ? (
          <div className="empty-state">No images yet. Upload your first image to get started!</div>
        ) : (
          images.map((image) => (
            <div key={image.id} className="vision-board-item">
              <img
                src={`${process.env.VITE_API_URL || 'http://localhost:3000'}/api/v1/files/${image.id}`}
                alt={image.fileName}
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
              <button
                className="delete-button"
                onClick={() => handleDelete(image.id)}
                title="Delete image"
              >
                ×
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default VisionBoardWidget;

