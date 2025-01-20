import { NextResponse } from 'next/server';

// 硬编码配置
const API_URL = 'https://api.coze.cn/v1/workflow/run';
const WORKFLOW_ID = '7461917058494726180';
const API_TOKEN = 'pat_hm3RF3EdI6wwInPJHq58kBGgfOC0zf8TaUVIYlz8ofGtAcSxhxTvzEHZIsidhmzA';

export async function POST() {
  try {
    const response = await fetch(API_URL, {
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

    const data = await response.json();
    
    if (!data.data) {
      throw new Error('No data in API response');
    }

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