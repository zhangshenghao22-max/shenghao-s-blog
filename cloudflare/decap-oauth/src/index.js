const DEFAULT_ALLOWED_LOGIN = 'zhangshenghao22-max';
const DEFAULT_CMS_ORIGIN = 'https://www.zhangshenghao.com';
const TOKEN_COOKIE = 'decap_oauth_state';
const COOKIE_MAX_AGE = 600;
const GITHUB_SCOPES = new Set(['public_repo', 'repo']);

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders(env) });
    }

    try {
      if (url.pathname === '/' || url.pathname === '/health') {
        return json({ ok: true, service: 'decap-oauth' }, 200, env);
      }

      if (url.pathname === '/auth') {
        return handleAuth(request, env);
      }

      if (url.pathname === '/callback') {
        return handleCallback(request, env);
      }

      return json({ error: 'Not found' }, 404, env);
    } catch (error) {
      return authPopup('error', { message: error.message || 'Unexpected OAuth error.' }, env, true);
    }
  },
};

function handleAuth(request, env) {
  requireEnv(env, 'GITHUB_CLIENT_ID');
  requireEnv(env, 'GITHUB_CLIENT_SECRET');

  const url = new URL(request.url);
  const provider = url.searchParams.get('provider') || 'github';
  if (provider !== 'github') {
    return authPopup('error', { message: 'Only GitHub login is supported.' }, env);
  }

  const scope = normalizeScope(url.searchParams.get('scope'));
  const state = crypto.randomUUID();
  const redirectUri = callbackUrl(request);
  const authorizeUrl = new URL(env.GITHUB_AUTHORIZE_URL || 'https://github.com/login/oauth/authorize');

  authorizeUrl.searchParams.set('client_id', env.GITHUB_CLIENT_ID);
  authorizeUrl.searchParams.set('redirect_uri', redirectUri);
  authorizeUrl.searchParams.set('scope', scope);
  authorizeUrl.searchParams.set('state', state);

  return new Response(null, {
    status: 302,
    headers: {
      Location: authorizeUrl.toString(),
      'Set-Cookie': buildStateCookie(state, request),
      ...corsHeaders(env),
    },
  });
}

async function handleCallback(request, env) {
  requireEnv(env, 'GITHUB_CLIENT_ID');
  requireEnv(env, 'GITHUB_CLIENT_SECRET');

  const url = new URL(request.url);
  const error = url.searchParams.get('error');
  if (error) {
    return authPopup('error', { message: `${error}: ${url.searchParams.get('error_description') || ''}` }, env);
  }

  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const cookieState = readCookie(request.headers.get('Cookie') || '', TOKEN_COOKIE);

  if (!code || !state || !cookieState || state !== cookieState) {
    return authPopup('error', { message: 'GitHub login state is invalid or expired.' }, env, true);
  }

  const tokenData = await exchangeCodeForToken(code, callbackUrl(request), env);
  if (!tokenData.access_token) {
    return authPopup('error', { message: tokenData.error_description || tokenData.error || 'GitHub did not return an access token.' }, env, true);
  }

  const user = await getGitHubUser(tokenData.access_token, env);
  const allowedLogin = (env.ALLOWED_GITHUB_LOGIN || DEFAULT_ALLOWED_LOGIN).toLowerCase();

  if (!user.login || user.login.toLowerCase() !== allowedLogin) {
    return authPopup('error', { message: `GitHub user ${user.login || 'unknown'} is not allowed to publish this site.` }, env, true);
  }

  return authPopup(
    'success',
    {
      token: tokenData.access_token,
      provider: 'github',
      login: user.login,
      name: user.name || user.login,
      avatar_url: user.avatar_url,
    },
    env,
    true,
  );
}

async function exchangeCodeForToken(code, redirectUri, env) {
  const response = await fetch(env.GITHUB_TOKEN_URL || 'https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'User-Agent': 'decap-oauth-worker',
    },
    body: JSON.stringify({
      client_id: env.GITHUB_CLIENT_ID,
      client_secret: env.GITHUB_CLIENT_SECRET,
      code,
      redirect_uri: redirectUri,
    }),
  });

  return response.json();
}

async function getGitHubUser(token, env) {
  const response = await fetch(env.GITHUB_USER_URL || 'https://api.github.com/user', {
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'User-Agent': 'decap-oauth-worker',
      'X-GitHub-Api-Version': '2022-11-28',
    },
  });

  if (!response.ok) {
    throw new Error(`Unable to load GitHub user: ${response.status}`);
  }

  return response.json();
}

function authPopup(type, payload, env, clearCookie = false) {
  const origin = env.CMS_ORIGIN || DEFAULT_CMS_ORIGIN;
  const message = `authorization:github:${type}:${JSON.stringify(payload)}`;
  const headers = new Headers({
    'Content-Type': 'text/html; charset=utf-8',
    'Referrer-Policy': 'no-referrer',
    'X-Robots-Tag': 'noindex',
    ...corsHeaders(env),
  });

  if (clearCookie) {
    headers.append('Set-Cookie', clearStateCookie());
  }

  return new Response(
    `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>GitHub 登录授权</title>
  <style>
    body { margin: 0; min-height: 100vh; display: grid; place-items: center; font-family: ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; background: #fffaf1; color: #222029; }
    main { width: min(460px, calc(100vw - 40px)); padding: 28px; border-radius: 28px; background: rgba(255,255,255,.72); box-shadow: 0 24px 80px rgba(72,54,36,.12); text-align: center; }
    p { color: #7d7785; }
  </style>
</head>
<body>
  <main>
    <h1>${type === 'success' ? '登录成功' : '登录失败'}</h1>
    <p>${type === 'success' ? '正在回到文章发布后台。' : escapeHtml(payload.message || '请关闭窗口后重试。')}</p>
  </main>
  <script>
    (function () {
      var origin = ${JSON.stringify(origin)};
      var message = ${JSON.stringify(message)};
      function receiveHandshake(event) {
        if (event.origin !== origin || event.data !== 'authorizing:github') return;
        window.removeEventListener('message', receiveHandshake, false);
        event.source.postMessage(message, event.origin);
      }
      window.addEventListener('message', receiveHandshake, false);
      if (window.opener) {
        window.opener.postMessage('authorizing:github', origin);
      }
    })();
  </script>
</body>
</html>`,
    { headers },
  );
}

function buildStateCookie(state, request) {
  const secure = new URL(request.url).protocol === 'https:' ? ' Secure;' : '';
  return `${TOKEN_COOKIE}=${encodeURIComponent(state)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${COOKIE_MAX_AGE};${secure}`;
}

function clearStateCookie() {
  return `${TOKEN_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0; Secure;`;
}

function readCookie(cookieHeader, name) {
  return cookieHeader
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`))
    ?.slice(name.length + 1);
}

function callbackUrl(request) {
  const url = new URL(request.url);
  url.pathname = '/callback';
  url.search = '';
  return url.toString();
}

function normalizeScope(scope) {
  if (!scope) return 'public_repo';
  const values = scope.split(/[\s,]+/).filter(Boolean);
  const safeValues = values.filter((value) => GITHUB_SCOPES.has(value));
  return safeValues.length > 0 ? safeValues.join(' ') : 'public_repo';
}

function corsHeaders(env) {
  return {
    'Access-Control-Allow-Origin': env.CMS_ORIGIN || DEFAULT_CMS_ORIGIN,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

function json(data, status, env) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...corsHeaders(env),
    },
  });
}

function requireEnv(env, key) {
  if (!env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
