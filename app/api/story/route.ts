import { NextResponse } from 'next/server';

// 硬编码配置
const API_URL = 'https://api.coze.cn/v1/workflow/run';
const STORY_WORKFLOW_ID = '7461984524705316915';
const API_TOKEN = 'pat_hm3RF3EdI6wwInPJHq58kBGgfOC0zf8TaUVIYlz8ofGtAcSxhxTvzEHZIsidhmzA';

// 流量控制
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 2000;

export async function POST(request: Request) {
  try {
    const now = Date.now();
    if (now - lastRequestTime < MIN_REQUEST_INTERVAL) {
      return NextResponse.json(
        {
          error: 'Rate limit',
          details: 'Please wait before making another request'
        },
        { status: 429 }
      );
    }
    lastRequestTime = now;

    const { title } = await request.json();
    
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_TOKEN}`
      },
      body: JSON.stringify({
        parameters: {
          input: title
        },
        workflow_id: STORY_WORKFLOW_ID
      })
    });

    const data = await response.json();

    // 处理 Coze API 的流量限制错误
    if (data.code === 4009) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          details: data.msg,
          retryAfter: 60
        },
        { status: 429 }
      );
    }

    if (data.code !== 0 || !data.data) {
      return NextResponse.json(
        {
          error: 'API error',
          details: data.msg || 'Unknown error'
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      code: 0,
      data: data.data
    });
  } catch (error) {
    console.error('Story API Error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
} 