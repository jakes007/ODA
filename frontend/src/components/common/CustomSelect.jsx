import { useEffect, useRef, useState } from 'react';
import { FiChevronDown } from 'react-icons/fi';

export default function CustomSelect({
  options = [],
  value,
  onChange,
  placeholder = 'Select option'
}) {
  const [open, setOpen] = useState(false);
  const selectRef = useRef(null);

  const selected = options.find((opt) => opt.value === value);

  useEffect(() => {
    function handleClickOutside(event) {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  function handleSelect(option) {
    onChange(option.value);
    setOpen(false);
  }

  return (
    <div ref={selectRef} className={`custom-select ${open ? 'open' : ''}`}>
      <button
        type="button"
        className="custom-select-trigger"
        onClick={() => setOpen((current) => !current)}
      >
        <span>{selected?.label || placeholder}</span>
        <FiChevronDown className="custom-select-arrow" />
      </button>

      {open ? (
        <div className="custom-select-dropdown">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`custom-select-option ${
                value === option.value ? 'selected' : ''
              }`}
              onClick={() => handleSelect(option)}
            >
              {option.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}