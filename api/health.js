/**
 * GET  /api/health   - Server health check
 */

const { handleCORS, success } = require('./_lib/helpers');

module.exports = async function handler(req, res) {
  if (handleCORS(req, res)) return;

  return success(res, {
    status: 'ok',
    service: 'AAA Real Estate API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: process.env.VERCEL ? 'vercel' : 'local'
  });
};

