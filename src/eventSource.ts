import moment from 'moment';
import fetch from 'node-fetch';
import HTMLParser, { Node } from 'node-html-parser';

import { Event, EventHandler, EventSource } from './core/interface';

const WATER_URL = 'http://water.gov.ge/page/full/107';
const REFRESHING_PAUSE = 5 * 60 * 1000;

let eventHandler: EventHandler;
let recentEvents: Event[] = [];

export async function EventSourceService(): Promise<EventSource> {
  //constructor
  pullRecentRepeatedly();
  return {
    onEvent,
  };
}

async function pullRecentRepeatedly(): Promise<void> {
  const exit = false;
  let firstPull = true;
  while (!exit) {
    try {
      const events = await pullPageEvents(0);
      const freshEvents = events.filter(
        (le) => !recentEvents.find((re) => !isEventsEqual(re, le)),
      );
      if (!firstPull) await Promise.all(freshEvents.map(eventHandler));
      else firstPull = false;
      if (freshEvents.length !== 0) {
        recentEvents = freshEvents.concat(recentEvents);
      }
      await new Promise((resolve) => {
        setTimeout(resolve, REFRESHING_PAUSE);
      });
    } catch (e) {
      console.log(e);
    }
  }
}

function isEventsEqual(event1: Event, event2: Event): boolean {
  return event1.start === event2.start && event1.end === event2.end;
}

function onEvent(handler: EventHandler): void {
  eventHandler = handler;
}

async function pullPageEvents(pageNumber: number): Promise<Event[]> {
  const waterUrl = `${WATER_URL}/${pageNumber > 0 ? `${pageNumber - 1}0` : ''}`;
  const firstPageHTML = await (await fetch(waterUrl)).text();
  return parseEvents(firstPageHTML) as Event[];
}

function parseEvents(pageHTML: string): Event[] {
  return HTMLParser.parse(pageHTML)
    .querySelectorAll('.col-sm-12')
    .filter((article) => article.childNodes.length === 15)
    .map((article) => {
      const addresses = article.childNodes[9].text.trim().split('   ');
      return {
        start: dateHTMLNodeToMoment(article.childNodes[3]),
        end: dateHTMLNodeToMoment(article.childNodes[5]),
        addresses,
      } as Event;
    });
}

function dateHTMLNodeToMoment(htmlNode: Node): moment.Moment {
  return moment(htmlNode.text.slice(31).trim(), 'DD/MM/YYYY HH:mm:ss');
}
