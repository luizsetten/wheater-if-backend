import { format } from "date-fns";
import { Record } from "../entities/Record";

export const groupByTime = (array: Array<Record>) => {
  return array.reduce((acc, obj) => {
    let key = format(obj.created_at, "yyyy-MM-dd-HH");

    if (!acc[key]) {
      acc[key] = [];
    }

    acc[key].push(obj);
    return acc;

  }, {} as any)
}