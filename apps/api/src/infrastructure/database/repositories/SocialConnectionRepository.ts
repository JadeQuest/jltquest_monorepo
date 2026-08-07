export class SocialConnectionRepository {
  async findManyByUserId(tx: any, userId: string) {
    return tx.socialConnection.findMany({ where: { userId } });
  }

  async findByPlatformAndUserId(tx: any, platform: any, platformUserId: string) {
    return tx.socialConnection.findUnique({
      where: { platform_platformUserId: { platform, platformUserId } }
    });
  }

  async findByUserAndPlatform(tx: any, userId: string, platform: any) {
    return tx.socialConnection.findUnique({
      where: { userId_platform: { userId, platform } }
    });
  }

  async update(tx: any, id: string, data: any) {
    return tx.socialConnection.update({
      where: { id },
      data
    });
  }

  async create(tx: any, data: any) {
    return tx.socialConnection.create({ data });
  }
}
