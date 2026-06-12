import classNames from "classnames";
import dayjs from "dayjs";

interface Props {
  name: string;
  label: string;
  defaultValue?: Date | string;
  value?: Date | string | null;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  readOnly?: boolean;
  disabled?: boolean;
  required?: boolean;
  min?: string;
  max?: string;
}

function toDateInputValue(date: Date | string | null | undefined) {
  if (
    date === null ||
    date === undefined ||
    (typeof date === "string" && date.trim() === "")
  ) {
    return "";
  }

  return dayjs(date).format("YYYY-MM-DD");
}

export function DateInput({
  label,
  name,
  defaultValue,
  value,
  onChange,
  required,
  disabled,
  ...props
}: Props) {
  // Controlled when `value` is provided, otherwise uncontrolled via defaultValue.
  const isControlled = value !== undefined;

  const valueProps = isControlled
    ? { value: toDateInputValue(value), onChange }
    : {
        defaultValue:
          defaultValue !== undefined
            ? toDateInputValue(defaultValue)
            : undefined,
      };

  return (
    <>
      <label htmlFor={name} className="fieldset-label">
        {label}
      </label>
      <div className="indicator w-full">
        {required && (
          <span className="indicator-item badge text-error text-xl">*</span>
        )}
        <input
          data-testid="dateinput"
          type="date"
          id={name}
          name={name}
          placeholder={label}
          className={classNames("input input-bordered w-full", {
            validator: required,
          })}
          {...valueProps}
          required={required}
          disabled={disabled}
          {...props}
        />
      </div>
    </>
  );
}
