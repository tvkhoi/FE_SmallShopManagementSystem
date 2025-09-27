export interface Permission {
  id: number;
  name: string;
  module: string;
  description: string;
  granted?: boolean;
}