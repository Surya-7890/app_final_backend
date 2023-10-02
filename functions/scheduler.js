const { months } = require('../utils/month')

const scheduler = async (room, allocatedTime) => {
  console.log(allocatedTime);
  const from = allocatedTime.split('to')[0]
    const to = allocatedTime.split('to')[1]
    let [ fromDate, fromMonth, fromYear, fromTime] = from.split(' ');
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
    console.log(fromTime, toTime);
    room.AddScheduler({
        hour: Number(toHour),
        minute: Number(toMinute),
        date: Number(toDate),
        month: months[toMonth],
        year: Number(toYear)
    })
}

module.exports = { scheduler }