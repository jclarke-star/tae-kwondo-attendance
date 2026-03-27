import { Hono } from "hono";
import type { Env } from './core-utils';
import { UserEntity, ClassSessionEntity, GradingEventEntity } from "./entities";
import { ok, bad, notFound } from './core-utils';
export function userRoutes(app: Hono<{ Bindings: Env }>) {
  // SEED ON START
  app.get('/api/init', async (c) => {
    await UserEntity.ensureSeed(c.env);
    await ClassSessionEntity.ensureSeed(c.env);
    await GradingEventEntity.ensureSeed(c.env);
    return ok(c, { message: 'Seeded' });
  });
  // CLASSES
  app.get('/api/classes', async (c) => {
    await ClassSessionEntity.ensureSeed(c.env);
    const data = await ClassSessionEntity.list(c.env);
    return ok(c, data.items);
  });
  app.post('/api/classes/:id/checkin', async (c) => {
    const { userId } = await c.req.json();
    if (!userId) return bad(c, 'userId required');
    const session = new ClassSessionEntity(c.env, c.req.param('id'));
    if (!await session.exists()) return notFound(c, 'class not found');
    const updated = await session.checkIn(userId);
    return ok(c, updated);
  });
  app.post('/api/classes/:id/approve', async (c) => {
    const { userId } = await c.req.json();
    if (!userId) return bad(c, 'userId required');
    const session = new ClassSessionEntity(c.env, c.req.param('id'));
    if (!await session.exists()) return notFound(c, 'class not found');
    const updated = await session.approveCheckIn(userId);
    return ok(c, updated);
  });
  app.post('/api/classes/:id/deny', async (c) => {
    const { userId } = await c.req.json();
    if (!userId) return bad(c, 'userId required');
    const session = new ClassSessionEntity(c.env, c.req.param('id'));
    const updated = await session.denyCheckIn(userId);
    return ok(c, updated);
  });
  // GRADINGS
  app.get('/api/gradings', async (c) => {
    await GradingEventEntity.ensureSeed(c.env);
    const data = await GradingEventEntity.list(c.env);
    return ok(c, data.items);
  });
  app.post('/api/gradings', async (c) => {
    const body = await c.req.json();
    if (!body.title || !body.date) return bad(c, 'title and date required');
    const grading = await GradingEventEntity.create(c.env, {
      ...body,
      id: crypto.randomUUID()
    });
    return ok(c, grading);
  });
  // USERS
  app.get('/api/users', async (c) => {
    await UserEntity.ensureSeed(c.env);
    const data = await UserEntity.list(c.env);
    return ok(c, data.items);
  });
}