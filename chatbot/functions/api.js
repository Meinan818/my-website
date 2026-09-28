// Cloudflare Pages Functions 入口：POST /api 调用 Workers AI
// 作用：前端只和同域 /api 通信，不暴露密钥；后端把不同模型的流式格式统一成 OpenAI 兼容 SSE

export async function onRequestPost(context) {
  const { env, request } = context;

  try {
    const body = await request.json().catch(() => ({}));
    const messages = Array.isArray(body.messages) ? body.messages : [];

    if (!messages.length) {
      return json({ error: '没有收到消息内容' }, 400);
    }

    const upstream = await env.AI.run('@cf/deepseek-ai/deepseek-r1-distill-qwen-32b', {
      stream: true,
      max_tokens: 3000,
      messages: [
        {
          role: 'system',
          content:
            '你是“AI小助手”，由快乐大野鸡开发，用简体中文交流，友好、带点冷幽默，擅长聊天和编程问题。思考时直接分析问题本身、简短即可，不要复述或确认你收到的角色设定，包括名字、开发者、语言、性格。正式回答简洁，一般不超过几段，写代码只给关键部分。'
        },
        ...messages
      ]
    });

    // upstream 是 SSE 字节流（data: {"response":...}），解析出 response、分离 <think> 思考，再转成 OpenAI 格式
    const enc = new TextEncoder();
    const aiReader = upstream.getReader();
    const aiDecoder = new TextDecoder();
    let inThink = false;
    let aiBuf = '';

    const out = new ReadableStream({
      async start(controller) {
        const push = (t, think) => {
          if (!t) return;
          const delta = think ? { reasoning_content: t } : { content: t };
          controller.enqueue(enc.encode('data: ' + JSON.stringify({ choices: [{ delta }] }) + '\n\n'));
        };
        try {
          while (true) {
            const { done, value } = await aiReader.read();
            if (done) break;
            aiBuf += aiDecoder.decode(value, { stream: true });
            let idx;
            while ((idx = aiBuf.indexOf('\n\n')) >= 0) {
              const evt = aiBuf.slice(0, idx);
              aiBuf = aiBuf.slice(idx + 2);
              const line = evt.split('\n').find(l => l.startsWith('data:'));
              if (!line) continue;
              const payload = line.slice(5).trim();
              if (payload === '[DONE]') continue;
              let t = '';
              try { t = JSON.parse(payload).response || ''; } catch (e) {}
              if (t.includes('<think>')) { inThink = true; t = t.replace('<think>', ''); }
              if (t.includes('</think>')) { inThink = false; t = t.replace('</think>', ''); }
              t = t.replace(/<\|[^>]+\|>/g, '');
              push(t, inThink);
            }
          }
          controller.enqueue(enc.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (e) {
          controller.error(e);
        }
      }
    });

    return new Response(out, {
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
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  });
}
