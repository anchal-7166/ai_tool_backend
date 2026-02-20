import { NestFactory } from '@nestjs/core';
import { SeedModule } from './seed.module';
import { SeedService } from './sedding.service';

if (process.env.NODE_ENV === 'production') {
  console.error(' Seeding is disabled in production');
  process.exit(1);
}

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(SeedModule);

  const seedService = app.get(SeedService);
  await seedService.run();

  await app.close();
}

bootstrap().catch((err) => {
  console.error(' Seeding failed:', err);
  process.exit(1);
});
