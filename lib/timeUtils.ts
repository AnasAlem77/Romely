export function getCityLocalTime(timezone: string, date: Date = new Date()): {
  formattedTime: string;
  formattedDate: string;
  timeOfDay: string;
  isNight: boolean;
} {
  try {
    const timeFormatter = new Intl.DateTimeFormat('en-GB', {
      timeZone: timezone,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });

    const hourFormatter = new Intl.DateTimeFormat('en-GB', {
      timeZone: timezone,
      hour: 'numeric',
      hour12: false,
    });

    const dateFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });

    const formattedTime = timeFormatter.format(date);
    const formattedDate = dateFormatter.format(date);
    const hour = parseInt(hourFormatter.format(date), 10);

    let timeOfDay = 'Day';
    let isNight = false;

    if (hour >= 5 && hour < 8) {
      timeOfDay = 'Dawn Light';
    } else if (hour >= 8 && hour < 12) {
      timeOfDay = 'Morning Sun';
    } else if (hour >= 12 && hour < 17) {
      timeOfDay = 'Afternoon';
    } else if (hour >= 17 && hour < 20) {
      timeOfDay = 'Golden Hour';
    } else if (hour >= 20 && hour < 22) {
      timeOfDay = 'Twilight';
    } else {
      timeOfDay = 'Night Stillness';
      isNight = true;
    }

    return {
      formattedTime,
      formattedDate,
      timeOfDay,
      isNight,
    };
  } catch (error) {
    return {
      formattedTime: '12:00',
      formattedDate: 'Today',
      timeOfDay: 'Day',
      isNight: false,
    };
  }
}
