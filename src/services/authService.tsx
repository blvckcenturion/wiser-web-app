import axios, { AxiosResponse } from 'axios';
import { UserResponse } from '@/types/auth';

// AuthService class for handling authentication operations
export class AuthService {

    // Login method for authenticating user
    static async login(email: string, password: string): Promise<string> {
        // Trim and validate email
        email = email.trim();
        // Regex for email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        // Check if email is valid
        if (!emailRegex.test(email)) {
            // Throw error if email is invalid
            throw new Error('Invalid email format.');
        }
        
        // Validate password
        if (password.length < 8) {
            // Throw error if password is invalid
            throw new Error('Incorrect email or password.');
        }
        
        // Form url endpoint for login
        const url = `${process.env.NEXT_PUBLIC_API_URL}/auth/token`;
        // Set headers for login
        const headers = {
            // Accept json
            'Accept': 'application/json',
            // Set content type to form url encoded
            'Content-Type': 'application/x-www-form-urlencoded'
        };
        // Set data for login request
        const data = `grant_type=&username=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}&scope=&client_id=&client_secret=`;

        try {
            // Send login request
            const response: AxiosResponse = await axios.post(url, data, { headers });
            // Check if response data is valid and contains access token
            if (response.data && response.data.access_token) {
                // Store credentials in local storage
                await AuthService.storeCredentials(response.data.access_token);    
                // Return access token
                return response.data.access_token;
            } else {
                // Throw error if response data is invalid
                throw new Error("Invalid response data");
            }
        } catch (error) {
            throw error;
        }
    }
    
    // Signup method for registering user
    static async signup(email: string, password: string, confirmPassword: string): Promise<UserResponse> {
        // Trim and validate email
        email = email.trim();
        // Regex for email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        // Check if email is valid
        if (!emailRegex.test(email)) {
            // Throw error if email is invalid
            throw new Error('Invalid email format.');
        }
        
        // Validate password
        if (password.length < 8) {
            // Throw error if password is invalid
            throw new Error('Password must be at least 8 characters long.');
        }
        
        // Validate password confirmation
        if (password !== confirmPassword) {
            // Throw error if password confirmation is not equal to password
            throw new Error('Password and password confirmation do not match.');
        }

        // Form url endpoint for signup
        const url = `${process.env.NEXT_PUBLIC_API_URL}/user/`;
        // Set headers for signup
        const headers = {
            // Accept json
            'Accept': 'application/json',
            // Set content type to json
            'Content-Type': 'application/json'
        };

        // Set data for signup request
        const data = {
            email,
            password,
            password_confirmation: confirmPassword
        };
        
        try {
            // Send signup request
            const response: AxiosResponse = await axios.post<UserResponse>(url, data, { headers });
            // Check if response data is valid
            if (response.data) {
                // Return response data as UserResponse
                return response.data;
            } else {
                // Throw error if response data is invalid
                throw new Error("Invalid response data");
            }
        } catch (error) {
            throw error;
        }
    }

    // Store credentials in local storage
    static async storeCredentials(token: string): Promise<void> {
        try {
            // Store token using local storage
            localStorage.setItem('token', token);
        } catch (error) {
            // Throw error if token is invalid
            throw error;
        }
    }

    // Get credentials from local storage
    static async getCredentials(): Promise<string | null> {
        try {
            // Get token from local storage
            const token = localStorage.getItem('token');

            // Verify if token is valid
            if (!token) {
                // Return null if token is invalid
                return null;
            }
            
            // Verify token exp date
            const tokenParts = JSON.parse(atob(token.split('.')[1]));
            // Convert exp date to date object
            const expiresAt = new Date(tokenParts.exp * 1000);
            // Check if token is expired
            if (expiresAt < new Date()) {
                // Remove credentials if token is expired
                await AuthService.removeCredentials();
                // Return null if token is expired
                return null;
            }

            // Return token if token is valid
            return token;
        } catch (error) {
            throw error;
        }
    }

    // Remove credentials from local storage
    static async removeCredentials(): Promise<void> {
        try {
            // Remove token from local storage
            localStorage.removeItem('token');
        } catch (error) {
            throw error;
        }
    }

}