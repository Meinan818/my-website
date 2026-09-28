// Pages Function：部署后路由为 /api（与聊天页面同域，国内可访问）
// 需在 Pages 项目 → Settings → Bindings(Functions) 里绑定 Workers AI，变量名 AI

export async function onRequest(context) {
  const { request, env } = context;

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders() });
  }
  if (request.method !== 'POST') {
    return json({ error: '只支持 POST 请求' }, 405);
  }

  try {
    const body = await request.json();
    const messages = Array.isArray(body.messages) ? body.messages : [];

    const result = await env.AI.run('@cf/zai-org/glm-4.7-flash', {
      stream: false,
      messages: [
        {
          role: 'system',
          content:
            '你是“AI小助手”，由快乐大野鸡开发。你用简体中文交流，性格友好、有点冷幽默，擅长聊天和解答编程问题，回答简洁，一般不超过两三句话，除非用户明确要求详细。'
        },
        ...messages
      ]
    });

    return json({ reply: extractText(result) });
  } catch (err) {
    return json({ error: '服务器开小差了：' + (err && err.message ? err.message : String(err)) }, 500);
  }
}

function extractText(out) {
  if (out == null) return '';
  if (typeof out === 'string') return out;
  if (typeof out.response === 'string') return out.response;
  if (typeof out.text === 'string') return out.text;
  if (typeof out.output === 'string') return out.output;
  if (Array.isArray(out.choices) && out.choices[0]) {
    const c = out.choices[0];
    if (typeof c === 'string') return c;
    if (c && c.message && typeof c.message.content === 'string') return c.message.content;
    if (c && typeof c.text === 'string') return c.text;
  }
  try { return JSON.stringify(out); } catch (e) { return String(out); }
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: corsHeaders({ 'content-type': 'application/json; charset=utf-8' })
  });
}

function corsHeaders(extra = {}) {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    ...extra
  };
}
