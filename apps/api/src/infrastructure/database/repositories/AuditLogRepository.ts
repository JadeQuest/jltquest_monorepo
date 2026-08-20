import { prisma } from '../prisma';

export class AuditLogRepository {
  async log(tx: any, data: { userId?: string; action: string; ipAddress?: string; userAgent?: string; metadata?: any }) {
    const db = tx || prisma;
    return db.auditLog.create({
      data: {
        userId: data.userId,
        action: data.action,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        metadata: data.metadata
      }
    });
  }

  async findRefreshToken(tx: any, token: string) {
    const db = tx || prisma;
    return db.refreshToken.findUnique({
      where: { token },
      include: { user: true }
    });
  }

  async findLatestActiveRefreshToken(tx: any, userId: string) {
    const db = tx || prisma;
    return db.refreshToken.findFirst({
      where: { userId, isRevoked: false },
      orderBy: { createdAt: 'desc' }
    });
  }

  async createRefreshToken(tx: any, data: { token: string; userId: string; expiresAt: Date }) {
    const db = tx || prisma;
    return db.refreshToken.create({ data });
  }

  async revokeRefreshToken(tx: any, idOrToken: { id?: string; token?: string }) {
    const db = tx || prisma;
    if (idOrToken.id) {
      return db.refreshToken.update({
        where: { id: idOrToken.id },
        data: { isRevoked: true }
      });
    }
    if (idOrToken.token) {
      return db.refreshToken.update({
        where: { token: idOrToken.token },
        data: { isRevoked: true }
      });
    }
  }

  async revokeAllUserRefreshTokens(tx: any, userId: string) {
    const db = tx || prisma;
    return db.refreshToken.updateMany({
      where: { userId },
      data: { isRevoked: true }
    });
  }
}
