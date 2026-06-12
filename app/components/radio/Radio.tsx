interface RadioOption {
  label: string;
  value: string;
}

interface Props extends React.DetailedHTMLProps<
  React.InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
> {
  name: string;
  options: RadioOption[];
  label?: string;
  defaultValue?: string;
  required?: boolean;
  disabled?: boolean;
}

export function Radio({
  label,
  name,
  options,
  defaultValue,
  value,
  onChange,
  required,
  disabled,
}: Props) {
  // Controlled when `value` is provided, otherwise uncontrolled via defaultValue.
  const isControlled = value !== undefined;

  return (
    <>
      <label className="fieldset-label">{label}</label>
      <div data-testid={name} className="flex gap-8">
        {options.map((option) => (
          <label key={option.value} className="flex cursor-pointer gap-2">
            <input
              type="radio"
              name={name}
              value={option.value}
              {...(isControlled
                ? { checked: value === option.value, onChange }
                : { defaultChecked: defaultValue === option.value })}
              className="radio"
              required={required}
              disabled={disabled}
            />
            <span className="label-text">{option.label}</span>
          </label>
        ))}
      </div>
    </>
  );
}
