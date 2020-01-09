import { ScraperService } from './scraper.service';
import { Controller, Get, Param, Body, UseFilters, Req, Res } from '@nestjs/common';
import * as request from 'request';
import * as moment from 'moment';
import { ParseUtility } from './parseUtility';
import {Response, Request, Router } from 'express';

@Controller('scraper')
export class ScraperController {
    periodsList = [];
    url = 'https://www.forexfactory.com/calendar.php';

    constructor(private scrapeService: ScraperService) {
        this.periodsListLoad();
    }

    periodsListLoad() {
        this.periodsList = [];
        this.periodsList.push('day=today');
        this.periodsList.push('day=tomorrow');
        this.periodsList.push('day=yesterday');
        this.periodsList.push('day=?');
        this.periodsList.push('week=this');
        this.periodsList.push('week=next');
        this.periodsList.push('week=last');
        this.periodsList.push('week=?');
        this.periodsList.push('month=this');
        this.periodsList.push('month=next');
        this.periodsList.push('month=last');
        this.periodsList.push('week=?');
    }

    /* periods list
        periods:
            today    : day=today
            tomorrow : day=tomorrow
            yesterday: day=yesterday
            specfic  : day=dec1.2019

            this week: week=this
            next week: week=next
            last week: week=last
            specfic  : week=dec29.2019

            this month: month=this
            next month: month=next
            last month: month=last
            specfic   : month=dec.2019
    */

    // scrape ff website: day
    @Get('day/:period')
    scrapeDayPeriod(@Param() params, @Req() req: Request, @Res() res: Response) {
        const period: string = params.period.toLowerCase();
        this.doPeriodScrape(res, 'day', period);
    }

    // scrape ff website: week
    @Get('week/:period')
    scrapeWeekPeriod(@Param() params, @Req() req: Request, @Res() res: Response) {
        const period: string = params.period.toLowerCase();
        this.doPeriodScrape(res, 'week', period);
    } 

    // scrape ff website: month
    @Get('month/:period')
    scrapeMonthPeriod(@Param() params, @Req() req: Request, @Res() res: Response) {
        const period: string = params.period.toLowerCase();
        this.doPeriodScrape(res, 'week', period);
    }

   // test the scrape parse code - parse a file on disk
    @Get('file')
    scrapeFile() {
        const scrapeData = this.scrapeService.parseFile('../../data/ffhtml/ff-2019.06.html');
        return scrapeData;
    }

    doPeriodScrape(res: Response, timePeriod: string, period: string) {
        this.url = 'https://www.forexfactory.com/calendar.php?' + timePeriod + '=' + period;
        const yyyy = this.getYear(period);
        this.doScrape(res,this.url, yyyy);
    }

    doScrape(res: Response, url: string, yyyy: string) {
        request(url, (error: any, response: any, html: string) => {
            const scrapeData = this.scrapeService.parseHtml(html, yyyy);
            res.send(scrapeData);
        });
    }

    getYear(period: string) {
        const temp = period.split('.');
        if (temp.length === 1) {
            return moment().format('YYYY');
        } else {
            return temp[1];
        }
    }
}
