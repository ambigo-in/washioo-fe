const DATE_ONLY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const TIME_ONLY_PATTERN = /^(\d{1,2}):(\d{2})(?::\d{2})?$/;

const pad2 = (value: number) => String(value).padStart(2, "0");

const parseDateOnly = (value: string) => {
  const match = DATE_ONLY_PATTERN.exec(value);
  if (!match) return null;

  const [, year, month, day] = match;
  return {
    year: Number(year),
    month: Number(month),
    day: Number(day),
  };
};

const parseTimeOnly = (value: string) => {
  const match = TIME_ONLY_PATTERN.exec(value);
  if (!match) return null;

  const [, hour, minute] = match;
  return {
    hour: Number(hour),
    minute: Number(minute),
  };
};

const getValidDate = (value?: string | null) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

export const getLocalDateInputValue = (value = new Date()) =>
  `${value.getFullYear()}-${pad2(value.getMonth() + 1)}-${pad2(value.getDate())}`;

export const getLocalTimeInputValue = (value = new Date()) =>
  `${pad2(value.getHours())}:${pad2(value.getMinutes())}`;

export const addLocalDays = (days: number, value = new Date()) => {
  const next = new Date(value);
  next.setDate(next.getDate() + days);
  return next;
};

export const formatDisplayDate = (
  value?: string | null,
  fallback = "N/A",
) => {
  if (!value) return fallback;

  const dateOnly = parseDateOnly(value);
  if (dateOnly) {
    return `${pad2(dateOnly.day)}-${pad2(dateOnly.month)}-${dateOnly.year}`;
  }

  const date = getValidDate(value);
  if (!date) return fallback;
  return `${pad2(date.getDate())}-${pad2(date.getMonth() + 1)}-${date.getFullYear()}`;
};

export const formatDisplayTime = (
  value?: string | null,
  fallback = "N/A",
) => {
  if (!value) return fallback;

  const timeOnly = parseTimeOnly(value);
  const date = timeOnly ? null : getValidDate(value);
  const hour24 = timeOnly?.hour ?? date?.getHours();
  const minute = timeOnly?.minute ?? date?.getMinutes();

  if (hour24 == null || minute == null) return fallback;

  const period = hour24 >= 12 ? "pm" : "am";
  const hour12 = hour24 % 12 || 12;
  return `${pad2(hour12)}:${pad2(minute)} ${period}`;
};

export const formatDisplayDateTime = (
  value?: string | null,
  fallback = "N/A",
) => {
  if (!value) return fallback;
  const date = getValidDate(value);
  if (!date) return fallback;
  return `${formatDisplayDate(value, fallback)} ${formatDisplayTime(value, fallback)}`;
};

export const formatScheduleDateTime = (
  date?: string | null,
  time?: string | null,
  fallback = "N/A",
) => {
  if (!date || !time) return fallback;
  return `${formatDisplayDate(date, fallback)} at ${formatDisplayTime(time, fallback)}`;
};

export const getScheduleDateTimeValue = (date: string, time: string) => {
  const dateOnly = parseDateOnly(date);
  const timeOnly = parseTimeOnly(time);
  if (!dateOnly || !timeOnly) return null;

  const value = new Date(
    dateOnly.year,
    dateOnly.month - 1,
    dateOnly.day,
    timeOnly.hour,
    timeOnly.minute,
    0,
    0,
  );

  return Number.isNaN(value.getTime()) ? null : value;
};

export const getDateValue = (date: string) => {
  const dateOnly = parseDateOnly(date);
  if (!dateOnly) return null;
  const value = new Date(dateOnly.year, dateOnly.month - 1, dateOnly.day);
  return Number.isNaN(value.getTime()) ? null : value;
};

export const isPastSchedule = (date: string, time: string) => {
  const schedule = getScheduleDateTimeValue(date, time);
  if (!schedule) return true;

  const currentMinute = new Date();
  currentMinute.setSeconds(0, 0);
  return schedule.getTime() < currentMinute.getTime();
};

export const getMinTimeForDate = (date: string) =>
  date === getLocalDateInputValue() ? getLocalTimeInputValue() : undefined;
