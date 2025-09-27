export function getMethodColor(method: string): string {
  switch (method.toUpperCase()) {
    case 'GET':
      return '#4FBF67';
    case 'POST':
      return '#1E90FF';
    case 'PUT':
      return '#FF9F38';
    case 'DELETE':
      return '#C00D49';
    case 'PATCH':
      return '#8A2BE2';
    default:
      return '#808080';
  }
}
