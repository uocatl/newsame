import React, { useState } from 'react';
import Image from 'next/image';

interface NewsCardProps {
  title: string;
  imageUrl: string;
  index: number;
}

const NewsCard: React.FC<NewsCardProps> = ({ title, imageUrl, index }) => {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className="h-full flex flex-col items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-lg bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-bold mb-4 text-gray-800">
            {title || '加载中...'}
          </h2>
          <div className="relative aspect-square w-full bg-gray-100 rounded-lg overflow-hidden">
            {!imageError ? (
              <Image
                src={imageUrl}
                alt={title || `新闻图片 ${index}`}
                fill
                className={`object-contain transition-opacity duration-300 ${
                  isLoading ? 'opacity-0' : 'opacity-100'
                }`}
                onError={(e) => {
                  console.error('Image load error:', e);
                  setImageError(true);
                }}
                onLoad={() => {
                  setIsLoading(false);
                }}
                unoptimized
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-200">
                <span className="text-gray-500">图片加载失败</span>
              </div>
            )}
            {isLoading && !imageError && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
            )}
          </div>
          <div className="mt-4 text-sm text-gray-500">小报 {index}</div>
        </div>
      </div>
      <div className="mt-4 text-sm text-gray-500 animate-bounce">
        ↓ 上滑查看下一条 ↓
      </div>
    </div>
  );
};

export default NewsCard; 