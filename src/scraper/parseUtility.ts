import * as fs from 'fs';
import * as path from 'path';
import * as moment from 'moment';
// import 'moment-timezone'
import * as cheerio from 'cheerio';

export class ParseUtility {

    public parseFile(file: string) {
        const yyyy = this.parseYearFromFilename(file);
        console.log('file=' + file);
        console.log('year=' + yyyy);
        const html: string = fs.readFileSync(file).toString();
        // console.log('html='+html);
        const scrapeData = this.parseHtml(html, yyyy);

        return scrapeData;
    }

    public parseHtml(html: string, yyyy: any) {
        console.log('parseHtml');

        const $ = cheerio.load(html);
        const h = $.html();

        let period = $('.highlight').filter('.light').text();
        period = period.replace('This Week: ', '');
        const scrapeData = {
            calendarData: []
        };

        let prevDate = '';
        let prevTime = '';
        let title = '';
        let impactStr = '';

        $('.calendar__row').filter(function(index, element: CheerioElement) {
            const children = $(this).children();

            if($(children).length > 2) {
                let isAllDay = false;
                // release date fixup
                $(children[0]).text($(children[0]).text().trim());
    
                if ($(children[0]).text().trim() !== '') {
                    prevDate = $(children[0]).text().trim();
                } else {
                    $(children[0]).text(prevDate);
                }
    
                if ($(children[1]).text().trim() !== '') {
                    prevTime = $(children[1]).text();
                } else {
                    $(children[1]).text(prevTime);
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
    
                const origDate = $(children[0]).text().substring(3);
                const origTime = $(children[1]).text().replace('am', ' AM').replace('pm', ' PM').trim();
    
                let dt = moment(new Date(yyyy + origDate + ' ' + origTime));
    
                if (!dt.isValid()) {
                    dt = moment(new Date(yyyy + origDate));
                    if (origTime === 'All Day') {
                        isAllDay = true;
                    }
                }
                
                if (dt.isDST()) {
                    dt.add(1, 'hour');
                }
                // let dtt = dt.clone().tz('America/New_York');
                // let utc = dt.utc();
                let rt = dt.format('h:mm A');
                if (isAllDay) {
                    rt = origTime;
                } 
    
                if (eventId) {
                    scrapeData.calendarData.push({
                        eventid: eventId,
                        releaseDateTime: dt.format(),
                        releaseDate: origDate.trim() + ', ' + yyyy,
                        // releaseTime: origTime.trim(), 
                        releaseTime: rt, // dt.format('h:mm A'),
                        currency: $(children[2]).text().replace('\n','').replace('\n',''),
                        impact: impactStr,
                        indicator: $(children[4]).text().trim(),
                        actual: $(children[6]).text(),
                        forecast: $(children[7]).text(),
                        previous: $(children[8]).text(),
                    });
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
