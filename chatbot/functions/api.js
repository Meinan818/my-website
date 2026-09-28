// Cloudflare Pages Functions 入口：访问 /api 时执行
// 作用：前端只和同域的 /api 通信，由这里调用 Workers AI，不暴露任何第三方密钥
// 流式输出（SSE）：模型一边生成一边把文字推给前端，实现打字机效果，体感更快

export async function onRequestPost(context) {
  const { env, request } = context;

  try {
    const body = await request.json().catch(() => ({}));
    const messages = Array.isArray(body.messages) ? body.messages : [];

    if (!messages.length) {
      return json({ error: '没有收到消息内容' }, 400);
    }

    // stream:true 边想边返回（reasoning_content 思考 + content 正文）；max_tokens 给足，避免思考未完被截断
    const upstream = await env.AI.run('@cf/zai-org/glm-4.7-flash', {
      stream: true,
      max_tokens: 3000,
      messages: [
        {
          role: 'system',
          content:
            '你是“AI小助手”，由快乐大野鸡开发。你用简体中文交流，性格友好、有点冷幽默，擅长聊天和解答编程问题。你可以先在思考里简短理一下思路，再给出正式回答；正式回答简洁清楚，一般不超过几段，写代码只给关键部分，除非用户明确要求详细。'
        },
        ...messages
      ]
    });

    // 该模型流式直接返回 OpenAI 兼容的 SSE 字节流，原样透传给前端（无需自行拼装）
    return new Response(upstream, {
      headers: {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (error) {
    return json({ error: '服务器开小差了：' + error.message }, 500);
  }
}

// 直接在浏览器打开 /api 时给个友好提示
export function onRequestGet() {
  return json({ ok: true, message: 'AI 接口正常，请在聊天页面发送消息。' });
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*'
    }
  });
}
