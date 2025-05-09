import React from 'react';

const MultiSelect = ({ options, selected, onChange }) => {
  const toggleOption = (option) => {
    if (selected.includes(option)) {
      onChange(selected.filter((item) => item !== option));
    } else {
      onChange([...selected, option]);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <button
          type="button"
          key={option}
          onClick={() => toggleOption(option)}
          className={`px-3 py-1 rounded-full border ${
            selected.includes(option) ? 'bg-primary text-white' : 'bg-gray-200'
          }`}
        >
          {option}
        </button>
      ))}
    </div>
  );
};

export default MultiSelect;
