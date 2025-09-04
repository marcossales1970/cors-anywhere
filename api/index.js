// api/index.js
// Importa a lógica principal do cors-anywhere que está na pasta 'lib'
const createCorsanywhere = require('../lib/cors-anywhere');

// Configura a instância do cors-anywhere
const cors_proxy = createCorsanywhere({
  originWhitelist: [], // Permite todas as origens (para testes, depois pode restringir)
  // originWhitelist: ['https://v0-brazilian-portuguese-prompts.vercel.app'], // Ou sua origem específica
  requireHeaders: ['origin', 'x-requested-with'], // Requer um desses cabeçalhos para evitar uso indevido
  removeHeaders: ['cookie', 'cookie2'], // Remove cabeçalhos de cookie por segurança
  redirectSameOrigin: true, // Opcional: útil para alguns casos
  httpProxyOptions: {
    xfwd: true, // Adiciona cabeçalhos X-Forwarded-For, X-Forwarded-Host, X-Forwarded-Proto
  }
});

// Esta é a função que o Vercel irá chamar para cada requisição Serverless
module.exports = (req, res) => {
  // Emite a requisição e resposta para a instância do cors-anywhere
  cors_proxy.emit('request', req, res);
};
