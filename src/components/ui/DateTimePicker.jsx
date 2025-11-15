import React, { useState, useRef, useEffect } from "react";
import { Calendar, Clock, ChevronLeft, ChevronRight, X } from "lucide-react";
import { format } from "date-fns";

export default function DateTimePicker({ 
  value, 
  onChange, 
  placeholder = "Select date and time",
  label,
  required = false,
  minDate,
  maxDate,
  className = ""
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(value ? new Date(value) : new Date());
  const [selectedDate, setSelectedDate] = useState(value ? new Date(value) : null);
  const [hours, setHours] = useState(value ? new Date(value).getHours() : 12);
  const [minutes, setMinutes] = useState(value ? new Date(value).getMinutes() : 0);
  const [ampm, setAmpm] = useState(value ? (new Date(value).getHours() >= 12 ? 'PM' : 'AM') : 'AM');
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const daysInMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0
  ).getDate();

  const firstDayOfMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    1
  ).getDay();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const handleDateSelect = (day) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    
    if (minDate && date < new Date(minDate)) return;
    if (maxDate && date > new Date(maxDate)) return;

    setSelectedDate(date);
  };

  const handleTimeConfirm = () => {
    if (!selectedDate) return;

    const finalHours = ampm === 'PM' && hours !== 12 ? hours + 12 : (ampm === 'AM' && hours === 12 ? 0 : hours);
    const dateTime = new Date(selectedDate);
    dateTime.setHours(finalHours, minutes, 0, 0);
    
    onChange(dateTime.toISOString());
    setIsOpen(false);
  };

  const clearDateTime = (e) => {
    e.stopPropagation();
    onChange("");
    setSelectedDate(null);
    setIsOpen(false);
  };

  const isDateDisabled = (day) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    if (minDate && date < new Date(minDate)) return true;
    if (maxDate && date > new Date(maxDate)) return true;
    return false;
  };

  const isToday = (day) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentMonth.getMonth() === today.getMonth() &&
      currentMonth.getFullYear() === today.getFullYear()
    );
  };

  const isSelected = (day) => {
    if (!selectedDate) return false;
    return (
      day === selectedDate.getDate() &&
      currentMonth.getMonth() === selectedDate.getMonth() &&
      currentMonth.getFullYear() === selectedDate.getFullYear()
    );
  };

  const days = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(<div key={`empty-${i}`} />);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(day);
  }

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {label && (
        <label className="block text-sm font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
          {label} {required && <span style={{ color: "#FCA5A5" }}>*</span>}
        </label>
      )}
      
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="glass-input px-4 py-3 rounded-2xl cursor-pointer flex items-center justify-between gap-2"
        style={{ color: value ? "var(--text-primary)" : "var(--text-muted)" }}
      >
        <div className="flex items-center gap-2 flex-1">
          <Calendar className="w-4 h-4" style={{ color: "var(--text-muted)", strokeWidth: 2 }} />
          <span className="text-sm">
            {value ? format(new Date(value), 'MMM dd, yyyy h:mm a') : placeholder}
          </span>
        </div>
        {value && (
          <button
            onClick={clearDateTime}
            className="w-6 h-6 rounded-full flex items-center justify-center hover:opacity-70 transition-opacity"
            style={{ color: "var(--text-muted)" }}
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {isOpen && (
        <div 
          className="absolute z-50 mt-2 glass-card rounded-3xl p-5 shadow-2xl"
          style={{
            boxShadow: "0 20px 50px rgba(32, 24, 51, 0.8), inset 0 1px 1px rgba(255, 255, 255, 0.2)",
            minWidth: "320px",
            maxWidth: "400px",
            border: "1px solid rgba(227, 201, 255, 0.3)"
          }}
        >
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-5">
            <button
              onClick={goToPreviousMonth}
              className="glass-button w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ color: "var(--text-secondary)" }}
            >
              <ChevronLeft className="w-5 h-5" style={{ strokeWidth: 2 }} />
            </button>
            
            <h3 className="text-lg font-bold" style={{ 
              color: "var(--text-primary)",
              fontFamily: "'Playfair Display', Georgia, serif"
            }}>
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </h3>
            
            <button
              onClick={goToNextMonth}
              className="glass-button w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ color: "var(--text-secondary)" }}
            >
              <ChevronRight className="w-5 h-5" style={{ strokeWidth: 2 }} />
            </button>
          </div>

          {/* Day Names */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {dayNames.map(day => (
              <div
                key={day}
                className="text-center text-xs font-semibold py-2"
                style={{ color: "var(--text-muted)", opacity: 0.8 }}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1 mb-4">
            {days.map((day, idx) => {
              if (typeof day !== 'number') {
                return <div key={`empty-${idx}`} />;
              }

              const disabled = isDateDisabled(day);
              const selected = isSelected(day);
              const today = isToday(day);

              return (
                <button
                  key={day}
                  onClick={() => !disabled && handleDateSelect(day)}
                  disabled={disabled}
                  className={`
                    w-full aspect-square rounded-xl text-sm font-semibold
                    transition-all duration-200
                    ${disabled ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}
                    ${selected ? 'glass-accent-lavender' : today ? 'glass-accent-moss' : 'glass-button hover:scale-105'}
                  `}
                  style={{
                    color: selected ? "#F0EBFF" : today ? "#A7F3D0" : "var(--text-secondary)"
                  }}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* Time Picker */}
          {selectedDate && (
            <div className="glass-card-dark rounded-2xl p-4 mb-4">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-4 h-4" style={{ color: "var(--text-muted)" }} />
                <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                  Select Time
                </span>
              </div>
              
              <div className="flex items-center gap-3">
                <select
                  value={hours}
                  onChange={(e) => setHours(Number(e.target.value))}
                  className="glass-input px-3 py-2 rounded-xl text-center"
                  style={{ color: "var(--text-primary)" }}
                >
                  {[...Array(12)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>{String(i + 1).padStart(2, '0')}</option>
                  ))}
                </select>
                
                <span className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>:</span>
                
                <select
                  value={minutes}
                  onChange={(e) => setMinutes(Number(e.target.value))}
                  className="glass-input px-3 py-2 rounded-xl text-center"
                  style={{ color: "var(--text-primary)" }}
                >
                  {[...Array(60)].map((_, i) => (
                    <option key={i} value={i}>{String(i).padStart(2, '0')}</option>
                  ))}
                </select>
                
                <div className="glass-button rounded-xl p-1 flex gap-1">
                  <button
                    onClick={() => setAmpm('AM')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      ampm === 'AM' ? 'glass-accent-lavender' : ''
                    }`}
                    style={{ color: ampm === 'AM' ? "#F0EBFF" : "var(--text-secondary)" }}
                  >
                    AM
                  </button>
                  <button
                    onClick={() => setAmpm('PM')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      ampm === 'PM' ? 'glass-accent-lavender' : ''
                    }`}
                    style={{ color: ampm === 'PM' ? "#F0EBFF" : "var(--text-secondary)" }}
                  >
                    PM
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            {selectedDate ? (
              <button
                onClick={handleTimeConfirm}
                className="flex-1 glass-accent-lavender px-4 py-3 rounded-2xl text-sm font-semibold"
                style={{ color: "#F0EBFF" }}
              >
                Confirm
              </button>
            ) : (
              <button
                onClick={() => {
                  const now = new Date();
                  setSelectedDate(now);
                  setHours(now.getHours() > 12 ? now.getHours() - 12 : (now.getHours() || 12));
                  setMinutes(now.getMinutes());
                  setAmpm(now.getHours() >= 12 ? 'PM' : 'AM');
                }}
                className="flex-1 glass-button px-4 py-3 rounded-2xl text-sm font-semibold"
                style={{ color: "var(--text-secondary)" }}
              >
                Now
              </button>
            )}
            <button
              onClick={() => setIsOpen(false)}
              className="flex-1 glass-button px-4 py-3 rounded-2xl text-sm font-semibold"
              style={{ color: "var(--text-secondary)" }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}