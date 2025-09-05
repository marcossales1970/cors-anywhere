// api/proxy.js
import fetch from 'node-fetch'; // Certifique-se de que 'node-fetch' está instalado no seu projeto proxy (npm install node-fetch)

export default async function (req, res) {
  try {
    // A URL de destino é passada como parte do caminho após o domínio do proxy
    // Ex: https://seu-proxy.vercel.app/https://script.google.com/...
    // req.url será '/https://script.google.com/...'
    const targetUrl = req.url.slice(1); // Remove a barra inicial para obter a URL completa

    if (!targetUrl || (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://'))) {
        return res.status(400).send('URL de destino inválida. Deve começar com http:// ou https://.');
    }

    // --- Tratamento da Requisição de Pré-Voo (OPTIONS) ---
    if (req.method === 'OPTIONS') {
      res.setHeader('Access-Control-Allow-Origin', 'https://v0-brazilian-portuguese-prompts.vercel.app'); // Seu domínio da landing page
      res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type'); // Permite que a landing page envie Content-Type
      res.setHeader('Access-Control-Max-Age', '86400'); // Cacheia o pré-voo por 24 horas
      return res.status(204).end(); // Responde com 'No Content' para um pré-voo bem-sucedido
    }

    // --- Tratamento das Requisições Reais (GET, POST, etc.) ---
    const { method, headers, body } = req;

    // Filtra cabeçalhos que podem causar problemas ao serem reencaminhados
    const filteredHeaders = {};
    for (const key in headers) {
      if (!['host', 'connection', 'content-length', 'content-encoding'].includes(key.toLowerCase())) {
        filteredHeaders[key] = headers[key];
      }
    }

    // Encaminha a requisição para o Google Apps Script
    const response = await fetch(targetUrl, {
      method: method,
      headers: filteredHeaders,
      body: method === 'POST' || method === 'PUT' ? JSON.stringify(body) : undefined, // Garante que o corpo é JSON
    });

    // Define os cabeçalhos CORS na resposta do proxy para a sua landing page
    res.setHeader('Access-Control-Allow-Origin', 'https://v0-brazilian-portuguese-prompts.vercel.app'); // Seu domínio da landing page
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Reenvia os cabeçalhos da resposta original do Google Apps Script
    response.headers.forEach((value, name) => {
        // Evita duplicar ou sobrescrever cabeçalhos CORS que já definimos
        if (!['access-control-allow-origin', 'access-control-allow-methods', 'access-control-allow-headers', 'content-encoding'].includes(name.toLowerCase())) {
            res.setHeader(name, value);
        }
    });

    // Envia a resposta de volta para a sua landing page
    res.status(response.status).send(await response.buffer());

  } catch (error) {
    console.error('Erro no Proxy:', error);
    res.status(500).send('Erro interno do Proxy. Verifique os logs do Vercel.');
  }
}
