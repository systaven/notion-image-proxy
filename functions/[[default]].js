const ROUTES = {
  '/notion': 'https://www.notion.so',
  '/unsplash': 'https://images.unsplash.com',
};

const REFERERS = {
  '/notion': 'https://www.notion.so',
  '/unsplash': 'https://unsplash.com',
};

async function handleRequest(request) {
  const url = new URL(request.url);
  const pathname = url.pathname;

  // 匹配前缀
  const prefix = Object.keys(ROUTES).find(p => pathname.startsWith(p + '/') || pathname === p);
  if (!prefix) {
    return new Response('Not Found', { status: 404 });
  }

  const targetOrigin = ROUTES[prefix];
  const referer = REFERERS[prefix];
  const targetPath = pathname.slice(prefix.length) || '/';
  const targetUrl = `${targetOrigin}${targetPath}${url.search}`;

  const res = await fetch(targetUrl, {
    headers: {
      'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      'referer': referer,
      'accept': request.headers.get('accept') || '*/*',
      'accept-encoding': request.headers.get('accept-encoding') || 'gzip, deflate, br',
    },
    redirect: 'follow',
  });

  const headers = new Headers();
  headers.set('content-type', res.headers.get('content-type') || 'image/jpeg');
  headers.set('cache-control', 'public, max-age=86400');
  headers.set('access-control-allow-origin', '*');
  // 透传图片大小，有助于浏览器提前分配空间
  const cl = res.headers.get('content-length');
  if (cl) headers.set('content-length', cl);

  return new Response(res.body, { status: res.status, headers });
}

// CF Pages _worker.js 的导出格式
export default {
  async fetch(request) {
    return handleRequest(request);
  }
};

// EdgeOne Pages Functions 的导出格式
export async function onRequest(context) {
  return handleRequest(context.request);
}
