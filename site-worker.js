// Static-asset Cloudflare Worker for iamfatness.us.
// Serves the contents of ./public with hardened security headers,
// trailing-slash normalization, and a custom 404 page.

const SECURITY_HEADERS = {
  "content-security-policy":
    "default-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; script-src 'self'; connect-src 'self'; font-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'",
  "referrer-policy": "strict-origin-when-cross-origin",
  "x-content-type-options": "nosniff",
  "strict-transport-security": "max-age=63072000; includeSubDomains; preload",
};

function withHeaders(response) {
  const headers = new Headers(response.headers);
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    headers.set(key, value);
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

function fetchAsset(request, env, pathname) {
  const url = new URL(request.url);
  url.pathname = pathname;
  return env.ASSETS.fetch(new Request(url, request));
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    let response = await env.ASSETS.fetch(request);
    if (response.status !== 404) {
      return withHeaders(response);
    }

    // Redirect extension-less paths to their trailing-slash form.
    if (!url.pathname.endsWith("/") && !url.pathname.includes(".")) {
      url.pathname += "/";
      return Response.redirect(url.toString(), 301);
    }

    // Serve directory index documents.
    if (url.pathname.endsWith("/")) {
      response = await fetchAsset(request, env, `${url.pathname}index.html`);
      if (response.status !== 404) {
        return withHeaders(response);
      }
    }

    response = await fetchAsset(request, env, "/404.html");
    return withHeaders(new Response(response.body, {
      status: 404,
      headers: response.headers,
    }));
  },
};
