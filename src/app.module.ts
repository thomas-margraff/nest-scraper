import { CatsController } from './cats/cats.controller';
import { LoggerMiddleware } from './logger.middleware';
import { Module, NestModule, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { CatsModule } from './cats/cats.module';
import { ScraperModule } from './scraper/scraper.module';

@Module({
  imports: [CatsModule, ScraperModule]
})
export class AppModule implements NestModule{
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      // .exclude(
      //   { path: 'cats', method: RequestMethod.GET },
      //   { path: 'cats', method: RequestMethod.POST }
      // );
      // .forRoutes('cats');
      // .forRoutes({ path: 'cats', method: RequestMethod.GET });
      .forRoutes(CatsController);
  }
}
