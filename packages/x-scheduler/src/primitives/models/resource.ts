import type { CalendarEventColor } from './event';

export type CalendarResourceId = string;

export interface CalendarResource {
  /**
   * The unique identifier of the resource.
   * This is the value that must be set in the `resource` property of the events.
   */
  id: CalendarResourceId;
  /**
   * The name of the resource.
   */
  name: string;
  /**
   * The color palette to use.
   * @default "mauve"
   */
  color?: CalendarEventColor;
}
