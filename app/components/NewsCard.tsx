import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import StoryModal from './StoryModal';
import { generateStory, preloadStory } from '../utils/api';

interface NewsCardProps {
  title: string;
  imageUrl: string;
  index: number;
}

const NewsCard: React.FC<NewsCardProps> = ({ title, imageUrl, index }) => {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [story, setStory] = useState('');
  const [isLoadingStory, setIsLoadingStory] = useState(false);

  // 当新闻卡片加载完成后预加载故事
  useEffect(() => {
    if (title) {
      preloadStory(title).catch(console.error);
    }
  }, [title]);

  const handleClick = async () => {
    if (!title || isLoadingStory) return;
    
    setIsModalOpen(true);
    setIsLoadingStory(true);
    
    try {
      const storyText = await generateStory(title);
      setStory(storyText);
    } catch (error) {
      console.error('Failed to load story:', error);
      setStory('抱歉，无法加载故事内容。请稍后重试。');
    } finally {
      setIsLoadingStory(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6">
      <div 
        className="w-full max-w-lg bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow duration-300"
        onClick={handleClick}
      >
        <div className="p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-bold mb-4 text-gray-800">
            {title || '加载中...'}
          </h2>
          <div className="relative w-full aspect-square bg-gray-100 rounded-lg overflow-hidden">
            {!imageError && imageUrl ? (
              <Image
                src={imageUrl}
                alt={title || `新闻图片 ${index}`}
                fill
                className={`object-contain transition-opacity duration-300 ${
                  isLoading ? 'opacity-0' : 'opacity-100'
                }`}
                onError={() => {
                  console.error('Image load error');
                  setImageError(true);
                }}
                onLoad={() => setIsLoading(false)}
                unoptimized
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
                <span className="text-gray-500">
                  {imageError ? '图片加载失败' : '加载中...'}
                </span>
              </div>
            )}
            {isLoading && !imageError && imageUrl && (
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

      <StoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        story={story}
        isLoading={isLoadingStory}
      />
    </div>
  );
};

export default NewsCard; 