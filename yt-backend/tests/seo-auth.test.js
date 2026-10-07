import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import jwt from 'jsonwebtoken';
import { verifyErpToken } from '../erp/middleware/erpAuth.js';
import verifyRoles from '../erp/middleware/verifyRoles.js';
import clientRoutes from '../erp/routes/client.routes.js';
import techleadRoutes from '../erp/routes/techlead.routes.js';
import projectRoutes from '../erp/routes/project.routes.js';
import adminRoutes from '../erp/routes/admin.routes.js';
import managerRoutes from '../erp/routes/manager.routes.js';
import productUserRoutes from '../erp/routes/productUser.routes.js';

test('private ERP endpoints reject anonymous requests before reaching data handlers', async () => {
  const app = express();
  app.use('/client', clientRoutes);
  app.use('/techlead', techleadRoutes);
  app.use('/projects', projectRoutes);
  app.use('/admin', adminRoutes);
  app.use('/manager', managerRoutes);
  app.use('/product-user', productUserRoutes);
  const server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  try {
    const origin = `http://127.0.0.1:${server.address().port}`;
    for (const route of ['/admin/stats', '/admin/project-analytics', '/manager/profile', '/product-user/dashboard', '/client/dashboard', '/client/projects', '/techlead/stats', '/techlead/profile', '/projects']) {
      assert.equal((await fetch(origin + route)).status, 401, route);
      assert.equal((await fetch(origin + route, { headers: { Authorization: 'Bearer invalid' } })).status, 401, route);
    }
  } finally { await new Promise(resolve => server.close(resolve)); }
});

test('verified tokens still require the allowed role', () => {
  const previousSecret = process.env.JWT_SECRET;
  process.env.JWT_SECRET = 'isolated-test-secret-not-for-production';
  try {
    let status;
    let reached = false;
    const res = { status(value) { status = value; return this; }, json() {} };
    const req = { headers: { authorization: `Bearer ${jwt.sign({ id: 'test-client', role: 'client' }, process.env.JWT_SECRET, { expiresIn: '1m' })}` } };
    verifyErpToken(req, res, () => verifyRoles('manager')(req, res, () => { reached = true; }));
    assert.equal(status, 403);
    assert.equal(reached, false);
  } finally {
    if (previousSecret === undefined) delete process.env.JWT_SECRET;
    else process.env.JWT_SECRET = previousSecret;
  }
});
