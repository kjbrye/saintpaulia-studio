/**
 * CareCalendar - Month grid showing care activity as colored dots per day.
 * Days are clickable; selection drives an external drawer rendered by the parent.
 */

import { useMemo, useState } from 'react';
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameDay,
  isSameMonth,
  format,
  addMonths,
  subMonths,
} from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { CARE_COLORS } from './CareLogItem';

const WEEKDAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const MAX_VISIBLE_DOTS = 4;

export default function CareCalendar({ logs = [], onDayClick, selectedDate }) {
  const [viewMonth, setViewMonth] = useState(() => startOfMonth(new Date()));

  const today = new Date();

  // Bucket logs by day (yyyy-MM-dd) for O(1) cell lookup.
  const logsByDay = useMemo(() => {
    const map = new Map();
    for (const log of logs) {
      const key = format(new Date(log.care_date), 'yyyy-MM-dd');
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(log);
    }
    return map;
  }, [logs]);

  const days = useMemo(() => {
    const gridStart = startOfWeek(startOfMonth(viewMonth));
    const gridEnd = endOfWeek(endOfMonth(viewMonth));
    return eachDayOfInterval({ start: gridStart, end: gridEnd });
  }, [viewMonth]);

  const goPrev = () => setViewMonth((m) => subMonths(m, 1));
  const goNext = () => setViewMonth((m) => addMonths(m, 1));
  const goToday = () => setViewMonth(startOfMonth(new Date()));

  return (
    <div className="card p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={goPrev}
          className="icon-container"
          aria-label="Previous month"
        >
          <ChevronLeft size={18} style={{ color: 'var(--sage-600)' }} />
        </button>
        <div className="flex items-center gap-3">
          <h3 className="heading heading-md">{format(viewMonth, 'MMMM yyyy')}</h3>
          <button
            onClick={goToday}
            className="px-3 py-1 rounded-lg text-small font-medium transition-all"
            style={{ background: 'var(--sage-100)', color: 'var(--sage-700)' }}
          >
            Today
          </button>
        </div>
        <button onClick={goNext} className="icon-container" aria-label="Next month">
          <ChevronRight size={18} style={{ color: 'var(--sage-600)' }} />
        </button>
      </div>

      {/* Weekday header */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {WEEKDAY_LABELS.map((d, i) => (
          <div
            key={`${d}-${i}`}
            className="text-center text-xs font-semibold py-1"
            style={{ color: 'var(--sage-500)' }}
          >
            {d}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const key = format(day, 'yyyy-MM-dd');
          const dayLogs = logsByDay.get(key) || [];
          const inMonth = isSameMonth(day, viewMonth);
          const isToday = isSameDay(day, today);
          const isSelected = selectedDate && isSameDay(day, selectedDate);

          // Unique care types in original log order, capped for display
          const uniqueTypes = [];
          for (const log of dayLogs) {
            if (!uniqueTypes.includes(log.care_type)) uniqueTypes.push(log.care_type);
          }
          const visibleTypes = uniqueTypes.slice(0, MAX_VISIBLE_DOTS);
          const overflow = uniqueTypes.length - visibleTypes.length;

          return (
            <button
              key={key}
              onClick={() => onDayClick?.(day)}
              className="text-left rounded-lg transition-colors flex flex-col p-1.5"
              style={{
                minHeight: 56,
                background: isToday ? 'var(--purple-100)' : 'transparent',
                outline: isSelected ? '2px solid var(--sage-600)' : 'none',
                outlineOffset: isSelected ? '-2px' : '0',
                opacity: inMonth ? 1 : 0.4,
                cursor: 'pointer',
              }}
            >
              <span
                className="text-small font-medium"
                style={{
                  color: isToday
                    ? 'var(--purple-500)'
                    : inMonth
                      ? 'var(--sage-700)'
                      : 'var(--sage-400)',
                }}
              >
                {format(day, 'd')}
              </span>
              {visibleTypes.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-auto pt-1">
                  {visibleTypes.map((type) => (
                    <span
                      key={type}
                      className="rounded-full"
                      style={{
                        width: 7,
                        height: 7,
                        background: CARE_COLORS[type]?.icon || 'var(--sage-400)',
                      }}
                    />
                  ))}
                  {overflow > 0 && (
                    <span
                      className="text-xs leading-none"
                      style={{ color: 'var(--sage-500)' }}
                    >
                      +{overflow}
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-4 pt-3 text-xs"
        style={{ borderTop: '1px solid var(--sage-200)', color: 'var(--sage-600)' }}>
        {Object.entries(CARE_COLORS).map(([type, colors]) => (
          <span key={type} className="inline-flex items-center gap-1.5 capitalize">
            <span
              className="rounded-full"
              style={{ width: 8, height: 8, background: colors.icon }}
            />
            {type}
          </span>
        ))}
      </div>
    </div>
  );
}
