/**
 * Custom Date Range Picker Calendar Component
 *
 * @since 1.0.0
 * @version 1.0.0
 *
 * @package @saskysamonte/custom-date-range-picker
 *
 * @requires react
 * @requires @mui/material
 * @requires @mui/icons-material
 * @requires ./styles/CustomDateRangePicker.css
 *
 * @author
 * Sasky Samonte
 */

import React, { useState, useEffect, useRef } from 'react';
import './styles/CustomDateRangePicker.css';

import DateRangeIcon from '@mui/icons-material/DateRange';
import { Button, FormControlLabel, Switch } from '@mui/material';

function CustomDateRangePicker({
  onDateRangeChange,
  initialStartDate,
  initialEndDate,
  selectedDates,
  compare = "no",
  disableFutureDates = false,
  enableCompareDates = false,
  autoOpen = false,
  onCancel,
  distinctDates = [],
  enableDistinctDates = false,
}) {
  const parseDate = (d) => (d ? new Date(d) : null);
  const today = new Date();

  const isFutureDate = (date) => date && date > today;

  const isSameDate = (a, b) =>
    a && b && a.toDateString() === b.toDateString();

  const changeMonth = (offset) => {
    const newDate = new Date(baseYear, baseMonth + offset);
    setBaseMonth(newDate.getMonth());
    setBaseYear(newDate.getFullYear());
  };

  const [alignLeft, setAlignLeft] = useState(false);

  const [startDate, setStartDate] = useState(parseDate(initialStartDate));
  const [endDate, setEndDate] = useState(parseDate(initialEndDate));
  const [compareByDates, setCompareByDates] = useState(compare === "yes");
  const [compareDates, setCompareDates] = useState(() => {
    if (compare === "yes" && Array.isArray(selectedDates) && selectedDates.length) {
      return selectedDates.map(d => new Date(d));
    }
    return [];
  });

  const [tempStartDate, setTempStartDate] = useState(startDate);
  const [tempEndDate, setTempEndDate] = useState(endDate);
  const [tempCompareDates, setTempCompareDates] = useState(compareDates);
  const [tempCompareByDates, setTempCompareByDates] = useState(compareByDates);

  const [isOpen, setIsOpen] = useState(autoOpen);
  const [selecting, setSelecting] = useState('start');
  const [baseMonth, setBaseMonth] = useState(today.getMonth());
  const [baseYear, setBaseYear] = useState(today.getFullYear());

  const pickerRef = useRef(null);

  /* Preset Ranges */
  const presets = [
    { label: 'Today', range: { start: new Date(), end: new Date() } },
    { label: 'Yesterday', range: { start: new Date(today.setDate(today.getDate() - 1)), end: new Date() } },
    { label: 'Past 7 Days', range: { start: new Date(today.setDate(today.getDate() - 6)), end: new Date() } },
    { label: 'Past 30 Days', range: { start: new Date(today.setDate(today.getDate() - 29)), end: new Date() } },
    { label: 'This Month', range: { start: new Date(today.getFullYear(), today.getMonth(), 1), end: new Date() } },
    { label: 'This Year', range: { start: new Date(today.getFullYear(), 0, 1), end: new Date() } },
  ];

  useEffect(() => {
    if (isOpen && pickerRef.current) {
      const dropdown = pickerRef.current.querySelector('.ssky-calendar-dropdown');
      if (dropdown) {
        const rect = dropdown.getBoundingClientRect();
        setAlignLeft(rect.right > window.innerWidth);
      }
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const generateCalendar = (month, year) => {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return [
      ...Array(firstDay).fill(null),
      ...Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1)),
    ];
  };

  const isDateValid = (date) => {
    if (!enableDistinctDates || !distinctDates.length) return true;
    const formatted = date.toISOString().split('T')[0];
    return distinctDates.includes(formatted);
  };

  const handleDateClick = (date) => {
    if (!date || (disableFutureDates && isFutureDate(date)) || !isDateValid(date)) return;

    if (tempCompareByDates) {
      const exists = tempCompareDates.some(d => isSameDate(d, date));
      setTempCompareDates(
        exists
          ? tempCompareDates.filter(d => !isSameDate(d, date))
          : [...tempCompareDates, date].sort((a, b) => a - b)
      );
    } else {
      if (selecting === 'start') {
        setTempStartDate(date);
        setTempEndDate(null);
        setSelecting('end');
      } else {
        setTempEndDate(date >= tempStartDate ? date : null);
        setSelecting('start');
      }
    }
  };

  const handleApplyDates = () => {
    setStartDate(tempStartDate);
    setEndDate(tempEndDate);
    setCompareDates(tempCompareDates);
    setCompareByDates(tempCompareByDates);

    onDateRangeChange(
      tempStartDate,
      tempEndDate,
      tempCompareByDates,
      tempCompareDates
    );

    setIsOpen(false);
  };

  const handleCancel = () => {
    setTempStartDate(startDate);
    setTempEndDate(endDate);
    setTempCompareDates(compareDates);
    setTempCompareByDates(compareByDates);
    setIsOpen(false);
    onCancel?.();
  };

  return (
    <div className="ssky-date-picker-wrapper" ref={pickerRef}>
      {!autoOpen && (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="ssky-date-range-picker-button"
        >
          <DateRangeIcon sx={{ fontSize: 16 }} />
          {tempCompareByDates
            ? tempCompareDates.length
              ? tempCompareDates.map(d => d.toDateString()).join(', ')
              : 'Select Dates'
            : `${tempStartDate?.toDateString() || 'Start Date'} - ${tempEndDate?.toDateString() || 'End Date'}`}
        </button>
      )}

      {isOpen && (
        <div className={`ssky-calendar-dropdown ${alignLeft ? 'ssky-align-left' : ''}`}>
          <div className="ssky-calendars">
            {[0, 1].map((offset) => {
              const month = baseMonth + offset;
              const year = baseYear + Math.floor(month / 12);
              const days = generateCalendar(month % 12, year);

              return (
                <div key={offset} className="ssky-calendar">
                  <div className="ssky-month-title">
                    {new Date(year, month).toLocaleString('default', {
                      month: 'long',
                      year: 'numeric',
                    })}
                  </div>

                  <div className="ssky-date-grid">
                    {days.map((date, idx) => {
                      const isSelected =
                        !tempCompareByDates &&
                        (isSameDate(date, tempStartDate) || isSameDate(date, tempEndDate));

                      const isInRange =
                        !tempCompareByDates &&
                        tempStartDate &&
                        tempEndDate &&
                        date >= tempStartDate &&
                        date <= tempEndDate;

                      const isCompareSelected =
                        tempCompareByDates &&
                        tempCompareDates.some(d => isSameDate(d, date));

                      const isDisabled =
                        !date ||
                        (disableFutureDates && isFutureDate(date)) ||
                        !isDateValid(date);

                      return (
                        <div
                          key={idx}
                          className={`ssky-date-cell
                            ${isSelected ? 'ssky-date-selected' : ''}
                            ${isInRange ? 'ssky-date-in-range' : ''}
                            ${isCompareSelected ? 'ssky-date-compare-selected' : ''}
                            ${isDisabled ? 'ssky-date-disabled' : ''}
                          `}
                          onClick={() => !isDisabled && handleDateClick(date)}
                        >
                          {date?.getDate()}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="ssky-date-presets">
            {presets.map(preset => (
              <button
                key={preset.label}
                className="ssky-date-preset-button"
                onClick={() => {
                  setTempStartDate(preset.range.start);
                  setTempEndDate(preset.range.end);
                }}
              >
                {preset.label}
              </button>
            ))}

            {enableCompareDates && (
              <FormControlLabel
                control={
                  <Switch
                    checked={tempCompareByDates}
                    onChange={() => setTempCompareByDates(!tempCompareByDates)}
                    size="small"
                  />
                }
                label="Compare by Dates"
              />
            )}

            <div className="ssky-apply-cancel-buttons">
              <Button className="ssky-cancel-button" onClick={handleCancel}>
                Cancel
              </Button>
              <Button
                className="ssky-apply-button"
                onClick={handleApplyDates}
                disabled={!tempCompareByDates && (!tempStartDate || !tempEndDate)}
              >
                Apply
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CustomDateRangePicker;
