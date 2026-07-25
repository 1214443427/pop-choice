import React from "react";

function InputField({
  label,
  placeholder,
  name,
  radioOptions,
}: {
  label: string;
  placeholder?: string;
  name: string;
  radioOptions?: string[];
}) {
  return (
    <div className="input-field">
      <label htmlFor={name} className="label-text">
        {label}
      </label>
      {radioOptions ? (
        <div className="radio-buttons">
          {radioOptions.map((option, index) => (
            <div key={index} className="radio-button">
              <input name={name} id={`${name}-${index}`} type="radio" value={option} />
              <label htmlFor={`${name}-${index}`} className="label-text capitalize radio-label">
                {option}
              </label>
            </div>
          ))}
        </div>
      ) : (
        <textarea name={name} id={name} placeholder={placeholder} className="text-input"></textarea>
      )}
    </div>
  );
}

export default InputField;
