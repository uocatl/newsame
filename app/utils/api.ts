// 检查是否在浏览器环境
const isBrowser = typeof window !== 'undefined';

// 故事缓存字典
interface StoryCache {
  [title: string]: string;
}

// 内存缓存
let storyCache: StoryCache = {};

// 初始化缓存
if (isBrowser) {
  try {
    const savedCache = localStorage.getItem('story_cache_v1');
    if (savedCache) {
      storyCache = JSON.parse(savedCache);
    }
  } catch (error) {
    console.error('Failed to load story cache:', error);
  }
}

// 保存缓存到 localStorage
function saveCache() {
  if (isBrowser) {
    try {
      localStorage.setItem('story_cache_v1', JSON.stringify(storyCache));
    } catch (error) {
      console.error('Failed to save story cache:', error);
    }
  }
}

async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function generateNews(retries = 3) {
  try {
    const response = await fetch('/api/news', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.code === 0 && data.data) {
      const parsedData = JSON.parse(data.data);
      return {
        image: parsedData.img,
        title: parsedData.output
      };
    }
    
    throw new Error('Unexpected API response format');
  } catch (error) {
    console.error('Failed to generate news:', error);
    throw error;
  }
}

export async function generateStory(title: string, useCache = true, retries = 3) {
  const normalizedTitle = title.trim();
  
  if (useCache && normalizedTitle in storyCache) {
    return storyCache[normalizedTitle];
  }

  if (useCache) {
    const similarTitle = Object.keys(storyCache).find(
      cachedTitle => cachedTitle.includes(normalizedTitle) || normalizedTitle.includes(cachedTitle)
    );
    if (similarTitle) {
      return storyCache[similarTitle];
    }
  }

  let retryDelay = 2000;

  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch('/api/story', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title: normalizedTitle })
      });

      const data = await response.json();

      if (response.status === 429) {
        await delay((data.retryAfter || 60) * 1000);
        continue;
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      if (data.code === 0 && data.data) {
        const parsedData = JSON.parse(data.data);
        const story = parsedData.output || '无法生成相关故事';
        if (isBrowser) {
          storyCache[normalizedTitle] = story;
          saveCache();
        }
        return story;
      }
      
      throw new Error('Unexpected API response format');
    } catch (error) {
      console.error(`Attempt ${i + 1} failed:`, error);
      
      if (i < retries - 1) {
        await delay(retryDelay);
        retryDelay = Math.min(retryDelay * 2, 10000);
        continue;
      }
    }
  }

  return '抱歉，由于系统繁忙，暂时无法生成故事。请稍后再试。';
}

export async function preloadStory(title: string) {
  if (!isBrowser) return;
  
  const normalizedTitle = title.trim();
  
  if (normalizedTitle in storyCache || 
      Object.keys(storyCache).some(
        cachedTitle => cachedTitle.includes(normalizedTitle) || normalizedTitle.includes(cachedTitle)
      )) {
    return;
  }

  try {
    await generateStory(normalizedTitle, true, 2);
  } catch (error) {
    console.error('Failed to preload story:', error);
  }
}