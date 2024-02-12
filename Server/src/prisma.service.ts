import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const createPrismaExtended = (prisma: PrismaService) =>
  prisma.$extends({
    result: {
      user: {
        password: {
          needs: {},
          compute: () => undefined,
        },
        refreshToken: {
          needs: {},
          compute: () => undefined,
        },
        email: {
          needs: {},
          compute: () => undefined,
        },
        createdAt: {
          needs: {},
          compute: () => undefined,
        },
        updatedAt: {
          needs: {},
          compute: () => undefined,
        },
      },
    },
  });

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private _prisma: ReturnType<typeof createPrismaExtended>;

  constructor() {
    super();
  }

  get extended() {
    if (!this._prisma) {
      this._prisma = createPrismaExtended(this);
    }

    return this._prisma;
  }

  async onModuleInit() {
    await this.$connect();
    // await this.$runCommandRaw({
    //   createIndexes: 'users',
    //   indexes: [
    //     {
    //       key: {
    //         guestExpireAt: 1,
    //       },
    //       name: 'guestExpireAt',
    //       expireAfterSeconds: 0,
    //     },
    //   ],
    // });

    /*
    // await this.$runCommandRaw({
    //   dropIndexes: 'users',
    //   index: 'guestExpireAt',
    // });
    */
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
