export function getStatusColor(status: string | number): string {
  const code = typeof status === 'string' ? parseInt(status.replace(/[()]/g, ''), 10) : status;

  if (code >= 200 && code < 300) return '#4FBF67';
  if (code >= 300 && code < 400) return '#FF9F38';
  if (code >= 400 && code < 600) return '#C00D49';
  return 'transparent';
}
