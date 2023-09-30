const format = (from, to) => {
  let [fromDate, fromMonth, fromYear, fromTime] = from.split(' ');
  let [ toDate, toMonth, toYear, toTime ] = to.split(' ');
  
  // removing brackets
  fromTime = fromTime.replaceAll('(', '');
  fromTime = fromTime.replaceAll(')', '');
  toTime = toTime.replaceAll('(', '');
  toTime = toTime.replaceAll(')', '');
  fromTime = fromTime.trim();
  toTime = toTime.trim();

  // splitting time string
  const [fromHour, fromMinute] = fromTime.split(':');
  const [toHour, toMinute] = toTime.split(':');
  return `${fromDate} ${fromMonth} ${fromYear} (${fromHour}:${fromMinute}) to ${toDate} ${toMonth} ${toYear} (${toHour}:${toMinute})`;

}

module.exports = { format }