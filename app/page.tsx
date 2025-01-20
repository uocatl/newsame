'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import NewsCard from './components/NewsCard';
import { generateNews } from './utils/api';

export default function Home() {
  const [news, setNews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nextNews, setNextNews] = useState<any>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout>();

  // 预加载下一条新闻
  const preloadNextNews = useCallback(async () => {
    try {
      const newsItem = await generateNews();
      if (newsItem && newsItem.title && newsItem.image) {
        setNextNews({
          id: Math.random().toString(36).substr(2, 9),
          title: newsItem.title,
          imageUrl: newsItem.image,
        });
      }
    } catch (error) {
      console.error('Failed to preload next news:', error);
    }
  }, []);

  // 加载新闻
  const loadOneNews = useCallback(async () => {
    if (isLoading) return;
    setIsLoading(true);
    setError(null);

    try {
      if (nextNews) {
        setNews(prev => [...prev, nextNews]);
        setNextNews(null);
        preloadNextNews();
      } else {
        const newsItem = await generateNews();
        if (newsItem && newsItem.title && newsItem.image) {
          setNews(prev => [...prev, {
            id: Math.random().toString(36).substr(2, 9),
            title: newsItem.title,
            imageUrl: newsItem.image,
          }]);
          preloadNextNews();
        } else {
          throw new Error('无法加载新闻内容');
        }
      }
    } catch (error) {
      console.error('Failed to load news:', error);
      setError('加载失败，请稍后重试');
      
      // 清除之前的重试计时器
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
      
      // 设置新的重试计时器
      retryTimeoutRef.current = setTimeout(() => {
        loadOneNews();
      }, 5000); // 5秒后自动重试
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, nextNews, preloadNextNews]);

  // 清理函数
  useEffect(() => {
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

  // 初始加载
  useEffect(() => {
    loadOneNews();
  }, []);

  // 监听滚动加载
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoading) {
          loadOneNews();
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [loadOneNews, isLoading]);

  return (
    <main className="min-h-screen bg-gray-100">
      <div className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-sm z-10 border-b">
        <h1 className="text-2xl sm:text-3xl font-bold text-center py-3">
          让人清醒的小报
        </h1>
      </div>
      
      {error && (
        <div className="fixed top-16 left-1/2 transform -translate-x-1/2 z-50 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-lg">
          {error}
          <button 
            onClick={() => loadOneNews()} 
            className="ml-4 text-red-700 hover:text-red-900 underline"
          >
            重试
          </button>
        </div>
      )}
      
      <div className="snap-y snap-mandatory h-screen overflow-y-auto pt-14">
        {news.map((item, index) => (
          <div key={item.id} className="snap-start h-screen">
            <NewsCard
              title={item.title}
              imageUrl={item.imageUrl}
              index={index + 1}
            />
          </div>
        ))}
        
        {news.length === 0 && !error && (
          <div className="h-screen flex items-center justify-center">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mb-2" />
              <div className="text-gray-600">正在加载第一条新闻...</div>
            </div>
          </div>
        )}
        
        <div 
          ref={loadMoreRef} 
          className="h-20 flex items-center justify-center"
        >
          {isLoading && (
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mb-2" />
              <div className="text-gray-600">正在加载下一条...</div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
