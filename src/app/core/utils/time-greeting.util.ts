export function getGreetingByTime(): string {
  const currentHour = new Date().getHours();

  if (currentHour < 12) {
    return 'chúc buổi sáng 🌤️';
  } else if (currentHour < 18) {
    return 'chúc buổi chiều ☀️';
  } else {
    return 'chúc buổi tối 🌙';
  }
}
