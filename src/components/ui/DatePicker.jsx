import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Calendar, ChevronLeft, ChevronRight, X } from "lucide-react";
import { format } from "date-fns";

export default function DatePicker({ 
  value, 
  onChange, 
  placeholder = "Select date",
  label,
  required = false,
  minDate,
  maxDate,
  className = ""
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(value ? new Date(value) : new Date());
  const containerRef = useRef(null);
  const triggerRef = useRef(null);
  const dropdownRef = useRef(null);
  const [portalTarget, setPortalTarget] = useState(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });

  useEffect(() => {
    setPortalTarget(typeof document !== "undefined" ? document.body : null);
  }, []);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      const clickedOutsideContainer = containerRef.current && !containerRef.current.contains(event.target);
      const clickedOutsideDropdown = dropdownRef.current ? !dropdownRef.current.contains(event.target) : true;

      if (clickedOutsideContainer && clickedOutsideDropdown) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const updateDropdownPosition = () => {
    if (!triggerRef.current) return;
    const triggerRect = triggerRef.current.getBoundingClientRect();
    setDropdownPosition({
      top: triggerRect.bottom + 8,
      left: triggerRect.left,
      width: triggerRect.width,
    });
  };

  useEffect(() => {
    if (!isOpen) return;
    updateDropdownPosition();

    const handleResizeOrScroll = () => updateDropdownPosition();
    window.addEventListener('resize', handleResizeOrScroll);
    window.addEventListener('scroll', handleResizeOrScroll, true);

    return () => {
      window.removeEventListener('resize', handleResizeOrScroll);
      window.removeEventListener('scroll', handleResizeOrScroll, true);
    };
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
    const selectedDate = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day
    );
    
    // Check if date is within bounds
    if (minDate && selectedDate < new Date(minDate)) return;
    if (maxDate && selectedDate > new Date(maxDate)) return;

    const formattedDate = format(selectedDate, 'yyyy-MM-dd');
    onChange(formattedDate);
    setIsOpen(false);
  };

  const clearDate = (e) => {
    e.stopPropagation();
    onChange("");
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
    if (!value) return false;
    const selectedDate = new Date(value);
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
        ref={triggerRef}
        style={{ color: value ? "var(--text-primary)" : "var(--text-muted)" }}
      >
        <div className="flex items-center gap-2 flex-1">
          <Calendar className="w-4 h-4" style={{ color: "var(--text-muted)", strokeWidth: 2 }} />
          <span className="text-sm">
            {value ? format(new Date(value), 'MMMM dd, yyyy') : placeholder}
          </span>
        </div>
        {value && (
          <button
            onClick={clearDate}
            className="w-6 h-6 rounded-full flex items-center justify-center hover:opacity-70 transition-opacity"
            style={{ color: "var(--text-muted)" }}
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {isOpen && portalTarget && createPortal(
        <div
          ref={dropdownRef}
          className="fixed z-[9999]"
          style={{
            top: dropdownPosition.top,
            left: dropdownPosition.left,
          }}
        >
          <div
            className="glass-card rounded-3xl p-5 shadow-2xl"
            style={{
              boxShadow: "0 20px 50px rgba(32, 24, 51, 0.8), inset 0 1px 1px rgba(255, 255, 255, 0.2)",
              minWidth: "320px",
              maxWidth: "400px",
              width: Math.max(dropdownPosition.width, 320),
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
          <div className="grid grid-cols-7 gap-1">
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

          {/* Quick Actions */}
          <div className="flex gap-2 mt-4 pt-4" style={{ borderTop: "1px solid rgba(227, 201, 255, 0.2)" }}>
            <button
              onClick={() => {
                const today = format(new Date(), 'yyyy-MM-dd');
                onChange(today);
                setIsOpen(false);
              }}
              className="flex-1 glass-button px-4 py-2 rounded-xl text-sm font-semibold"
              style={{ color: "var(--text-secondary)" }}
            >
              Today
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="flex-1 glass-button px-4 py-2 rounded-xl text-sm font-semibold"
              style={{ color: "var(--text-secondary)" }}
            >
              Close
            </button>
          </div>
          </div>
        </div>,
        portalTarget
      )}
    </div>
  );
}
