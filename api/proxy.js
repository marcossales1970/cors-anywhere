// api/proxy.js
import fetch from 'node-fetch';

export default async function (req, res) {
  try {
    // Pega o caminho da URL após o domínio do proxy e o decodifica
    // Ex: /https%3A%2F%2Fwww.google.com se torna https://www.google.com
    const decodedUrlPath = decodeURIComponent(req.url.slice(1)); 
    const targetUrl = decodedUrlPath;

    if (!targetUrl || (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://'))) {
        // Se ainda ocorrer este erro, o console.error abaixo será útil nos logs do Vercel
        console.error('Invalid target URL detected:', targetUrl); 
        return res.status(400).send('URL de destino inválida. Deve começar com http:// ou https://.');
    }

    // --- Tratamento da Requisição de Pré-Voo (OPTIONS) ---
    if (req.method === 'OPTIONS') {
      res.setHeader('Access-Control-Allow-Origin', 'https://v0-brazilian-portuguese-prompts.vercel.app');
      res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
      res.setHeader('Access-Control-Max-Age', '86400');
      return res.status(204).end();
    }

    // --- Restante do seu código (sem alterações a partir daqui) ---
    const { method, headers, body } = req;

    const filteredHeaders = {};
    for (const key in headers) {
      if (!['host', 'connection', 'content-length', 'content-encoding'].includes(key.toLowerCase())) {
        filteredHeaders[key] = headers[key];
      }
    }

    const response = await fetch(targetUrl, {
      method: method,
      headers: filteredHeaders,
      body: method === 'POST' || method === 'PUT' ? JSON.stringify(body) : undefined,
    });

    res.setHeader('Access-Control-Allow-Origin', 'https://v0-brazilian-portuguese-prompts.vercel.app');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    response.headers.forEach((value, name) => {
        if (!['access-control-allow-origin', 'access-control-allow-methods', 'access-control-allow-headers', 'content-encoding'].includes(name.toLowerCase())) {
            res.setHeader(name, value);
        }
    });

    res.status(response.status).send(await response.buffer());

  } catch (error) {
    console.error('Erro no Proxy:', error);
    res.status(500).send('Erro interno do Proxy. Verifique os logs do Vercel.');
  }
}
