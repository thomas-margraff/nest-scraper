import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as moment from 'moment';
// import 'moment-timezone'
import * as cheerio from 'cheerio';

@Injectable()
export class ScraperService {

    public parseFile(file: string) {
        const yyyy = this.parseYearFromFilename(file);
        const html: string = fs.readFileSync(file).toString();
        const scrapeData = this.parseHtml(html, yyyy);

        return scrapeData;
    }

    public parseHtml(html: string, yyyy: any) {

        const $ = cheerio.load(html);
        const h = $.html();
    
        // "Dec 29 - Jan 4"
        let period = $('.highlight').filter('.light').text();
        period = period.replace('This Week: ', '')
                        .replace('Next Week: ', '')
                        .replace('Last Week: ', '');

        const scrapeData = {
            calendarData: [],
        };


        let prevDate = '';
        let prevTime = '';
        let title = '';
        let impactStr = '';
        let prevDateTime = moment();

        $('.calendar__row').filter(function(index, element: CheerioElement) {
            const children = $(this).children();
            let ccy = '';
            let indicatorName = '';
            let act = '';
            let fst = '';
            let prv = '';
            let origDateScrape = '';
            let origTimeScrape = '';

            if($(children).length > 2) {
                let isAllDay = false;
                let isTentative = false;

                // scrape fields
                ccy = $(children[2]).text().replace('\n','').replace('\n','');
                indicatorName= $(children[4]).text().trim();
                act =  $(children[6]).text(),
                fst = $(children[7]).text(),
                prv = $(children[8]).text(),

                // release date fixup
                $(children[0]).text($(children[0]).text().trim());
                origDateScrape = $(children[0]).text();
                origTimeScrape = $(children[1]).text();

                if (origDateScrape.trim() !== '') {
                    prevDate = origDateScrape.trim();
                } else {
                    origDateScrape = prevDate;
                }

                if (origTimeScrape.trim() !== '') {
                    prevTime = origTimeScrape;
                } else {
                    origTimeScrape = prevTime;
                }

                $('.calendar__impact-icon--screen').filter( function() {
                    impactStr = $(this).find('span').first().attr('title');
                    return true;
                });

                $('.calendar__event-title').filter(function() {
                    title = $(this).find('span').first().attr('title');
                    return true;
                });
                const eventId = $(this).data('eventid');
                const origDate = origDateScrape.substring(3);
                const origTime = origTimeScrape.replace('am', ' AM').replace('pm', ' PM').trim();

                let dt = moment(new Date(yyyy + origDate + ' ' + origTime));

                if (!dt.isValid()) {
                    dt = moment(new Date(yyyy + origDate));
                    if (origTime === 'All Day') {
                        isAllDay = true;
                    }
                    if (origTime === 'Tentative') {
                        isTentative = true;
                    }

                }

                if (dt.isDST()) {
                    dt.add(1, 'hour');
                }
                // let dtt = dt.clone().tz('America/New_York');
                // let utc = dt.utc();
                let rt = dt.format('h:mm A');
                if (isAllDay || isTentative) {
                    rt = origTime;
                }
    
                // for year change
                if (eventId) {
                    console.log(ccy + ' ' + origDate.trim() + ', ' + yyyy + ' ' + indicatorName);
                    if (prevDateTime) {
                        if (prevDateTime.month() > dt.month()) {
                            dt.add(1, 'year');
                            yyyy = (+yyyy + 1).toString();
                        }
                    }
                    scrapeData.calendarData.push({
                        eventid: eventId,
                        releaseDateTime: dt.format(),
                        releaseDate: origDate.trim() + ', ' + yyyy,
                        releaseTime: rt,
                        currency: ccy,
                        impact: impactStr,
                        indicator: indicatorName,
                        actual: act, 
                        forecast: fst,
                        previous: prv,
                    });

                    prevDateTime = dt;
                }
            }

            return $(element.children).length > 2;
        });

        return scrapeData;
    }

    public parseYearFromFilename(filename: string) {
        const ff = path.parse(filename).base;
        const dd = ff.replace('ff-', '').replace('.html', '');
        const yyyy = +dd.substring(0, 4);
        return yyyy;
    }

}
