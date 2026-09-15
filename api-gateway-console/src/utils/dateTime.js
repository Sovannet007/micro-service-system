import dayjs from "dayjs";

export const formatDateTime = (timestamp, format = "DD/MM/YYYY hh:mm A") => {
  if (!timestamp) return "-";

  return dayjs(Number(timestamp)).format(format);
};
