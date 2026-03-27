import { Hono } from "hono";
import type { Env } from './core-utils';
import { UserEntity, ClassSessionEntity, GradingEventEntity } from "./entities";
import { ok, bad, notFound } from './core-utils';
import { MOCK_BADGES } from "@shared/mock-data";
import { Badge } from "@shared/types";
async function hashPin(pin: string): Promise<string> {
  const msgUint8 = new TextEncoder().encode(pin);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
export function userRoutes(app: Hono<{ Bindings: Env }>) {
  const validateInstructor = async (c: any) => {
    const instructorId = c.req.header("X-Instructor-Id");
    const providedPinHash = c.req.header("X-Instructor-Pin"); // Client sends hash or raw if legacy, but we expect hash now
    if (!instructorId || !providedPinHash) {
      throw new Error("Instructor credentials required");
    }
    const userEnt = new UserEntity(c.env, instructorId);
    if (!await userEnt.exists()) throw new Error("Instructor profile not found");
    const user = await userEnt.getState();
    if (user.role !== 'instructor') throw new Error("Unauthorized role");
    // For backwards compatibility during phase transition or if the client sends raw PIN '1234'
    const legacyHash = await hashPin("1234");
    if (user.pinHash) {
      if (user.pinHash !== providedPinHash) throw new Error("Invalid Instructor PIN");
    } else {
      // Fallback for seeded instructors who haven't set a PIN yet
      if (providedPinHash !== legacyHash) throw new Error("Invalid Instructor PIN");
    }
  };
  app.get('/api/init', async (c) => {
    await UserEntity.ensureSeed(c.env);
    await ClassSessionEntity.ensureSeed(c.env);
    await GradingEventEntity.ensureSeed(c.env);
    return ok(c, { message: 'Seeded' });
  });
  app.post('/api/auth/verify-pin', async (c) => {
    const { userId, pin } = await c.req.json();
    if (!userId || !pin) return bad(c, 'userId and pin required');
    const userEnt = new UserEntity(c.env, userId);
    if (!await userEnt.exists()) return notFound(c, 'User not found');
    const user = await userEnt.getState();
    const providedHash = await hashPin(pin);
    const storedHash = user.pinHash || (await hashPin("1234"));
    if (providedHash === storedHash) {
      return ok(c, { verified: true, hash: providedHash });
    }
    return bad(c, 'Invalid PIN');
  });
  app.post('/api/instructors/register', async (c) => {
    const body = await c.req.json();
    const { name, belt, avatar, pin, id } = body;
    if (!name || !belt || !pin) return bad(c, 'Name, belt, and PIN required');
    const pinHash = await hashPin(pin);
    const userId = id || crypto.randomUUID();
    const instructorData = {
      id: userId,
      name,
      belt,
      avatar: avatar || '🥋',
      role: 'instructor' as const,
      streak: 0,
      totalSessions: 0,
      badges: [],
      pinHash
    };
    await UserEntity.create(c.env, instructorData);
    return ok(c, instructorData);
  });
  app.get('/api/classes', async (c) => {
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
    try { await validateInstructor(c); } catch (e) { return bad(c, (e as Error).message); }
    const { userId } = await c.req.json();
    const session = new ClassSessionEntity(c.env, c.req.param('id'));
    const currentState = await session.getState();
    const isAlreadyConfirmed = currentState.confirmedCheckIns.includes(userId);
    const updatedSession = await session.approveCheckIn(userId);
    if (!isAlreadyConfirmed) {
      const userEnt = new UserEntity(c.env, userId);
      if (await userEnt.exists()) {
        await userEnt.mutate(u => {
          const nextTotal = (u.totalSessions ?? 0) + 1;
          const nextStreak = (u.streak ?? 0) + 1;
          const newBadges = [...(u.badges ?? [])];
          if (nextTotal === 5 && !newBadges.some(b => b.id === 'b3')) {
            const b = MOCK_BADGES.find(x => x.id === 'b3');
            if (b) newBadges.push(b);
          }
          if (nextTotal === 10 && !newBadges.some(b => b.id === 'b2')) {
            const b = MOCK_BADGES.find(x => x.id === 'b2');
            if (b) newBadges.push(b);
          }
          return { ...u, totalSessions: nextTotal, streak: nextStreak, badges: newBadges };
        });
      }
    }
    return ok(c, updatedSession);
  });
  app.post('/api/classes/:id/deny', async (c) => {
    try { await validateInstructor(c); } catch (e) { return bad(c, (e as Error).message); }
    const { userId } = await c.req.json();
    const session = new ClassSessionEntity(c.env, c.req.param('id'));
    const updated = await session.denyCheckIn(userId);
    return ok(c, updated);
  });
  app.post('/api/classes/:id/end', async (c) => {
    try { await validateInstructor(c); } catch (e) { return bad(c, (e as Error).message); }
    const session = new ClassSessionEntity(c.env, c.req.param('id'));
    const updated = await session.endSession();
    return ok(c, updated);
  });
  app.get('/api/gradings', async (c) => {
    const data = await GradingEventEntity.list(c.env);
    return ok(c, data.items);
  });
  app.post('/api/gradings', async (c) => {
    try { await validateInstructor(c); } catch (e) { return bad(c, (e as Error).message); }
    const body = await c.req.json();
    const grading = await GradingEventEntity.create(c.env, { ...body, id: crypto.randomUUID() });
    return ok(c, grading);
  });
  app.get('/api/users', async (c) => {
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
    const ent = new UserEntity(c.env, body.id || crypto.randomUUID());
    const updated = await ent.mutate(u => ({
      ...u,
      name: body.name || u.name,
      belt: body.belt || u.belt,
      avatar: body.avatar || u.avatar,
      biometricsEnabled: body.biometricsEnabled !== undefined ? body.biometricsEnabled : u.biometricsEnabled,
      webAuthnCredentialId: body.webAuthnCredentialId || u.webAuthnCredentialId
    }));
    if (!body.id) await UserEntity.removeFromIndex(c.env, ent.id); // clean up if logic weird
    return ok(c, updated);
  });
}