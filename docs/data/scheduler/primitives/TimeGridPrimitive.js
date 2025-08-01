import * as React from 'react';
import { DateTime } from 'luxon';
import { TimeGrid } from '@mui/x-scheduler/primitives/time-grid';
import classes from './TimeGridPrimitive.module.css';
import { initialEvents, groupEventsByDay } from './time-grid-events';

const days = groupEventsByDay(initialEvents);

export default function TimeGridPrimitive() {
  const { scrollableRef, scrollerRef } = useInitialScrollPosition();

  return (
    <div className={classes.Container}>
      <TimeGrid.Root className={classes.Root}>
        <div className={classes.Header}>
          <div className={classes.TimeAxisHeaderCell} aria-hidden="true" />
          {days.map((day) => (
            <div key={day.date.toString()} className={classes.HeaderCell}>
              {day.date.toFormat('EEE, dd')}
            </div>
          ))}
        </div>
        <div className={classes.Body} ref={scrollerRef}>
          <TimeGrid.ScrollableContent
            className={classes.ScrollableContent}
            ref={scrollableRef}
            style={{ '--duration': 24 }}
            role="row"
          >
            <div className={classes.TimeAxis} aria-hidden="true">
              {Array.from({ length: 24 }, (_, hour) => (
                <div
                  key={hour}
                  className={classes.TimeAxisCell}
                  style={{ '--hour-index': hour }}
                >
                  {hour === 0
                    ? null
                    : `${DateTime.now().set({ hour }).toFormat('hh a')}`}
                </div>
              ))}
            </div>
            {days.map((day) => (
              <TimeGrid.Column
                key={day.date.toString()}
                start={day.date.startOf('day')}
                end={day.date.endOf('day')}
                className={classes.Column}
              >
                {day.events.map((event) => (
                  <TimeGrid.Event
                    key={event.id}
                    start={event.start}
                    end={event.end}
                    eventId={event.id}
                    data-resource={event.resource}
                    className={classes.Event}
                  >
                    <div className={classes.EventInformation}>
                      <div className={classes.EventStartTime}>
                        {event.start.toFormat('hh a')}
                      </div>
                      <div className={classes.EventTitle}>{event.title}</div>
                    </div>
                  </TimeGrid.Event>
                ))}
              </TimeGrid.Column>
            ))}
          </TimeGrid.ScrollableContent>
        </div>
      </TimeGrid.Root>
    </div>
  );
}

function useInitialScrollPosition() {
  // TODO: Should the automatic scrolling be built-in?
  const scrollableRef = React.useRef(null);
  const scrollerRef = React.useRef(null);

  React.useLayoutEffect(() => {
    if (!scrollableRef.current || !scrollerRef.current) {
      return;
    }

    let earliestStart = null;
    for (const day of days) {
      for (const event of day.events) {
        const startMinute = event.start.hour * 60 + event.start.minute;

        if (event.start < day.date.startOf('day')) {
          earliestStart = 0;
        } else if (earliestStart == null || startMinute < earliestStart) {
          earliestStart = startMinute;
        }
      }
    }

    if (earliestStart == null) {
      return;
    }

    const clientHeight = scrollableRef.current.clientHeight;

    const earliestStartPx = earliestStart * (clientHeight / (24 * 60)) - 24;
    scrollerRef.current.scrollTop = earliestStartPx;
  }, []);

  return { scrollableRef, scrollerRef };
}
