export interface LoginResponse {
  username: string;
  email: string;
  roles: string[];
  token: string;          // access token
  refreshToken: string;
}
