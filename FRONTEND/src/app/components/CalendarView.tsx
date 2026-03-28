import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Availability } from '../context/AppContext';

interface CalendarViewProps {
  selectedDate: Date | null;
  onDateSelect: (date: Date) => void;
  availability: Availability;
}

export function CalendarView({ selectedDate, onDateSelect, availability }: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek };
  };

  const isDayAvailable = (date: Date) => {
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const availabilityKey = dayName as keyof Availability;
    return availability[availabilityKey]?.length > 0;
  };

  const isPastDate = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentMonth);

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const renderCalendarDays = () => {
    const days = [];
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="min-h-11 tablet:aspect-square" />);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const isAvailable = isDayAvailable(date) && !isPastDate(date);
      const isSelected =
        selectedDate &&
        date.toDateString() === selectedDate.toDateString();

      days.push(
        <button
          key={day}
          type="button"
          onClick={() => isAvailable && onDateSelect(date)}
          disabled={!isAvailable}
          className={`flex min-h-11 min-w-0 items-center justify-center rounded-lg text-sm font-medium transition-colors tablet:aspect-square ${
            isSelected
              ? 'bg-[#006bff] text-white'
              : isAvailable
              ? 'text-gray-900 hover:bg-blue-50'
              : 'cursor-not-allowed text-gray-300'
          }`}
        >
          {day}
        </button>
      );
    }

    return days;
  };

  return (
    <div className="min-w-0">
      <div className="mb-4 flex min-w-0 items-center justify-between gap-2">
        <h3 className="truncate text-base font-medium text-gray-900 tablet:text-lg">
          {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </h3>
        <div className="flex shrink-0 gap-1">
          <button
            type="button"
            onClick={previousMonth}
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg hover:bg-gray-100"
            aria-label="Previous month"
          >
            <ChevronLeft className="size-5" />
          </button>
          <button
            type="button"
            onClick={nextMonth}
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg hover:bg-gray-100"
            aria-label="Next month"
          >
            <ChevronRight className="size-5" />
          </button>
        </div>
      </div>

      <div className="-mx-1 overflow-x-auto pb-1 tablet:mx-0 tablet:overflow-visible">
        <div className="min-w-[min(100%,18.5rem)] tablet:min-w-0">
          <div className="mb-2 grid grid-cols-7 gap-0.5 tablet:gap-1">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, i) => (
              <div
                key={day}
                className="px-0.5 py-2 text-center text-[10px] font-medium text-gray-600 tablet:text-xs"
                title={day}
              >
                <span className="tablet:hidden">{day.slice(0, 3)}</span>
                <span className="hidden tablet:inline">{day}</span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-0.5 tablet:gap-1">{renderCalendarDays()}</div>
        </div>
      </div>
    </div>
  );
}
