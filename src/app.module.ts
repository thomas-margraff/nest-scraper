import { ScraperController } from './scraper/scraper.controller';
import { CatsController } from './cats/cats.controller';
import { LoggerMiddleware } from './logger.middleware';
import { Module, NestModule, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { CatsModule } from './cats/cats.module';
import { ScraperModule } from './scraper/scraper.module';

@Module({
  imports: [ScraperModule]
})
export class AppModule implements NestModule{
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes(ScraperController);
  }
}
