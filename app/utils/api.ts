const WORKFLOW_ID = '7461917058494726180';
const API_TOKEN = 'pat_hm3RF3EdI6wwInPJHq58kBGgfOC0zf8TaUVIYlz8ofGtAcSxhxTvzEHZIsidhmzA';

// 故事缓存字典
interface StoryCache {
  [title: string]: string;
}

// 使用 localStorage 持久化存储故事缓存
const STORY_CACHE_KEY = 'story_cache_v1';
let storyCache: StoryCache = {};

// 初始化时从 localStorage 加载缓存
try {
  const savedCache = localStorage.getItem(STORY_CACHE_KEY);
  if (savedCache) {
    storyCache = JSON.parse(savedCache);
    console.log('Loaded story cache:', Object.keys(storyCache).length, 'entries');
  }
} catch (error) {
  console.error('Failed to load story cache:', error);
}

// 保存缓存到 localStorage
function saveCache() {
  try {
    localStorage.setItem(STORY_CACHE_KEY, JSON.stringify(storyCache));
  } catch (error) {
    console.error('Failed to save story cache:', error);
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
    console.log('API Response:', data);

    if (data.code === 0 && data.data) {
      // 解析字符串形式的数据
      const parsedData = JSON.parse(data.data);
      console.log('Parsed data:', parsedData);
      
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
  // 标准化标题（去除多余空格等）
  const normalizedTitle = title.trim();
  
  // 如果启用缓存且缓存中存在，直接返回缓存的故事
  if (useCache && normalizedTitle in storyCache) {
    console.log('Story cache hit:', normalizedTitle);
    return storyCache[normalizedTitle];
  }

  // 查找相似标题
  if (useCache) {
    const similarTitle = Object.keys(storyCache).find(
      cachedTitle => cachedTitle.includes(normalizedTitle) || normalizedTitle.includes(cachedTitle)
    );
    if (similarTitle) {
      console.log('Found similar story:', similarTitle);
      return storyCache[similarTitle];
    }
  }

  let lastError;
  let retryDelay = 2000; // 初始重试延迟

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

      // 处理流量限制错误
      if (response.status === 429) {
        console.log('Rate limit reached, waiting before retry...');
        const retryAfter = data.retryAfter || 60;
        await delay(retryAfter * 1000);
        continue;
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}, details: ${data.details || 'Unknown error'}`);
      }

      if (data.error) {
        throw new Error(data.error);
      }

      if (data.code === 0 && data.data) {
        const parsedData = JSON.parse(data.data);
        console.log('Parsed story data:', parsedData);
        
        const story = parsedData.output || '无法生成相关故事';
        // 将故事存入缓存并持久化
        storyCache[normalizedTitle] = story;
        saveCache();
        return story;
      }
      
      throw new Error('Unexpected API response format');
    } catch (error) {
      console.error(`Attempt ${i + 1} failed:`, error);
      lastError = error;
      
      if (i < retries - 1) {
        // 使用指数退避策略
        await delay(retryDelay);
        retryDelay = Math.min(retryDelay * 2, 10000); // 最大延迟10秒
        continue;
      }
    }
  }

  // 如果所有重试都失败了，返回一个友好的错误消息
  return '抱歉，由于系统繁忙，暂时无法生成故事。请稍后再试。';
}

// 预加载故事
export async function preloadStory(title: string) {
  const normalizedTitle = title.trim();
  
  // 检查是否已经有缓存或相似标题
  if (normalizedTitle in storyCache || 
      Object.keys(storyCache).some(
        cachedTitle => cachedTitle.includes(normalizedTitle) || normalizedTitle.includes(cachedTitle)
      )) {
    return;
  }

  try {
    // 预加载时使用较少的重试次数
    await generateStory(normalizedTitle, true, 2);
  } catch (error) {
    console.error('Failed to preload story:', error);
    // 预加载失败不抛出错误，让用户点击时再次尝试
  }
} 