// Install with: npm install react-datepicker
// Or: yarn add react-datepicker

import React from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import dateIcon from '../assets/date.svg';

export default function CustomDatePicker({ startDate, endDate, onChange }) {
  const handleDateChange = (date, name) => {
    const now = new Date();
    const tomorrow = new Date();
    tomorrow.setHours(0, 0, 0, 0);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const selected = date ? new Date(date) : tomorrow;

    if (name === 'end' && (!date || selected.toDateString() === new Date().toDateString())) {
      const start = new Date(startDate);
      start.setDate(start.getDate() + 1);
      start.setHours(selected.getHours(), selected.getMinutes(), 0, 0);
      selected.setTime(start.getTime());
    }

    // Check if only time was selected (same day as today)
    if (selected.toDateString() === new Date().toDateString()) {
      selected.setDate(selected.getDate() + 1);
    }

    const syntheticEvent = {
      target: {
        name: name,
        value: selected.toISOString()
      }
    };
    onChange(syntheticEvent);
  };

  return (
    <div className="self-stretch pt-3 pb-4 border-t border-b border-slate-200 inline-flex justify-start items-start gap-3">
      {[
        { label: "Start date", value: startDate, name: "start" },
        { label: "End date", value: endDate, name: "end" }
      ].map((field) => (
        <div key={field.name} className="flex-1 inline-flex flex-col justify-start items-start gap-2">
          <div className="self-stretch justify-center">
            <span className="text-neutral-500 text-lg font-normal font-['Arial'] leading-7 tracking-tight">{field.label}</span>
            <span className="text-red-500 text-lg font-normal font-['Arial'] leading-7 tracking-tight">*</span>
            <span className="text-neutral-500 text-lg font-normal font-['Arial'] leading-7 tracking-tight">:</span>
          </div>
          <div className="self-stretch h-12 rounded-lg outline outline-1 outline-offset-[-1px] outline-zinc-200 flex items-center overflow-hidden">
            <div className="w-12 h-full bg-[rgba(231,170,76,1)] flex justify-center items-center">
              <img src={dateIcon} alt="Calendar Icon" className="w-5 h-5" />
            </div>
            <DatePicker
              selected={field.value ? new Date(field.value) : null}
              onChange={(date) => handleDateChange(date, field.name)}
              showTimeSelect
              timeFormat="HH:mm"
              timeIntervals={15}
              dateFormat="dd MMM yyyy, HH:mm"
              className="w-full h-full px-3 text-zinc-700 text-base font-normal font-['Arial'] leading-snug tracking-tight border-none outline-none"
              placeholderText="dd/mm/yyyy, --:--"
              minDate={
                field.name === 'start'
                  ? new Date(new Date().setDate(new Date().getDate() + 1))
                  : startDate
                  ? new Date(new Date(startDate).getTime() + 24 * 60 * 60 * 1000)
                  : new Date(new Date().setDate(new Date().getDate() + 1))
              }
            />
          </div>
        </div>
      ))}
    </div>
  );
}
