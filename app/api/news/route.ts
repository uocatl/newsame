import { NextResponse } from 'next/server';

const WORKFLOW_ID = '7461917058494726180';
const API_TOKEN = 'pat_hm3RF3EdI6wwInPJHq58kBGgfOC0zf8TaUVIYlz8ofGtAcSxhxTvzEHZIsidhmzA';

export async function POST() {
  try {
    console.log('Fetching from Coze API...');
    
    const response = await fetch('https://api.coze.cn/v1/workflow/run', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_TOKEN}`
      },
      body: JSON.stringify({
        parameters: {},
        workflow_id: WORKFLOW_ID
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Raw API Response:', data);

    if (!data.data) {
      throw new Error('No data in API response');
    }

    // 返回原始的字符串数据
    return NextResponse.json({
      code: 0,
      data: data.data
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch news', 
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
} 