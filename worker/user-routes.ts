import { Hono } from "hono";
import type { Env } from './core-utils';
import { UserEntity, ClassSessionEntity, GradingEventEntity } from "./entities";
import { ok, bad, notFound } from './core-utils';
import { MOCK_BADGES } from "@shared/mock-data";
import { Badge } from "@shared/types";
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
    const sessionId = c.req.param('id');
    const session = new ClassSessionEntity(c.env, sessionId);
    if (!await session.exists()) return notFound(c, 'class not found');
    const updatedSession = await session.approveCheckIn(userId);
    const userEnt = new UserEntity(c.env, userId);
    if (await userEnt.exists()) {
      await userEnt.mutate(u => {
        const nextTotal = (u.totalSessions ?? 0) + 1;
        const nextStreak = (u.streak ?? 0) + 1;
        const currentBadges = u.badges ?? [];
        const newBadges = [...currentBadges];
        // Award Attendance Pro at 5 sessions
        if (nextTotal === 5 && !newBadges.some((b: Badge) => b.id === 'b3')) {
          const badge = MOCK_BADGES.find((b: Badge) => b.id === 'b3');
          if (badge) newBadges.push(badge);
        }
        // Award Power Kicker at 10 sessions
        if (nextTotal === 10 && !newBadges.some((b: Badge) => b.id === 'b2')) {
          const badge = MOCK_BADGES.find((b: Badge) => b.id === 'b2');
          if (badge) newBadges.push(badge);
        }
        return { 
          ...u, 
          totalSessions: nextTotal, 
          streak: nextStreak, 
          badges: newBadges 
        };
      });
    }
    return ok(c, updatedSession);
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
  app.get('/api/users/:id', async (c) => {
    const ent = new UserEntity(c.env, c.req.param('id'));
    if (!await ent.exists()) return notFound(c);
    return ok(c, await ent.getState());
  });
  app.post('/api/users/register', async (c) => {
    const body = await c.req.json();
    if (!body.name || !body.belt) return bad(c, 'name and belt required');
    const existingId = body.id;
    if (existingId) {
      const ent = new UserEntity(c.env, existingId);
      if (await ent.exists()) {
        const updated = await ent.mutate(u => ({
          ...u,
          name: body.name,
          belt: body.belt,
          avatar: body.avatar || u.avatar
        }));
        return ok(c, updated);
      }
    }
    const id = crypto.randomUUID();
    const newUser: UserEntity['state'] = {
      id,
      name: body.name,
      belt: body.belt,
      avatar: body.avatar || '🥋',
      role: 'student' as const,
      streak: 0,
      totalSessions: 0,
      badges: []
    };
    await UserEntity.create(c.env, newUser);
    return ok(c, newUser);
  });
}