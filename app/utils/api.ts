const WORKFLOW_ID = '7461917058494726180';
const API_TOKEN = 'pat_hm3RF3EdI6wwInPJHq58kBGgfOC0zf8TaUVIYlz8ofGtAcSxhxTvzEHZIsidhmzA';

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