import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { 
  ApiResponse, 
  AuthResponse, 
  User, 
  Course, 
  Module, 
  Lecture, 
  Blog,
  EnrollmentRequest,
  EnrollmentStatus,
  LoginCredentials,
  RegisterData,
  CourseFilters,
  ModuleFilters,
  LectureFilters
} from '@/types';

class ApiService {
  private api: AxiosInstance;
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (value: any) => void;
    reject: (error: any) => void;
  }> = [];

  constructor() {
    this.api = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1',
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true, // Important for cookies
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle token refresh
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        // Only attempt refresh on 401 errors and if not already retrying
        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.isRefreshing) {
            // If already refreshing, queue the request
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            }).then(() => {
              return this.api(originalRequest);
            }).catch((err) => {
              return Promise.reject(err);
            });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            // Create a separate axios instance for refresh token to avoid circular dependency
            const refreshAxios = axios.create({
              baseURL: this.api.defaults.baseURL,
              withCredentials: true,
              timeout: 10000
            });
            
            const response = await refreshAxios.post('/auth/refresh-token', {});

            // Check if response has the expected structure
            if (!response.data || !response.data.data) {
              throw new Error('Invalid response structure from refresh endpoint');
            }

            const { accessToken } = response.data.data;
            
            if (!accessToken) {
              throw new Error('No access token received from refresh endpoint');
            }
            
            // Update tokens in localStorage
            localStorage.setItem('accessToken', accessToken);
            
            // Process queued requests
            this.failedQueue.forEach(({ resolve }) => {
              resolve(undefined);
            });
            this.failedQueue = [];
            
            // Retry the original request with new token
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            return this.api(originalRequest);
          } catch (refreshError: any) {
            // Clear auth state
            localStorage.removeItem('accessToken');
            localStorage.removeItem('user');
            
            // Process queued requests with error
            this.failedQueue.forEach(({ reject }) => {
              reject(refreshError);
            });
            this.failedQueue = [];
            
            // Redirect to login
            if (typeof window !== 'undefined') {
              window.location.href = '/auth/login';
            }
          } finally {
            this.isRefreshing = false;
          }
        }

        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async register(userData: RegisterData): Promise<ApiResponse<User>> {
    const response: AxiosResponse<ApiResponse<User>> = await this.api.post('/auth/register', userData);
    return response.data;
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response: AxiosResponse<AuthResponse> = await this.api.post('/auth/login', credentials);
    return response.data;
  }

  async refreshToken(): Promise<AuthResponse> {
    // Use a separate axios instance to avoid circular dependency
    const refreshAxios = axios.create({
      baseURL: this.api.defaults.baseURL,
      withCredentials: true,
      timeout: 10000
    });
    
    const response: AxiosResponse<AuthResponse> = await refreshAxios.post('/auth/refresh-token', {});
    return response.data;
  }

  async logout(): Promise<ApiResponse<null>> {
    const response: AxiosResponse<ApiResponse<null>> = await this.api.post('/auth/logout');
    return response.data;
  }

  async logoutAll(): Promise<ApiResponse<null>> {
    const response: AxiosResponse<ApiResponse<null>> = await this.api.post('/auth/logout-all');
    return response.data;
  }

  // Course endpoints
  async getCourses(filters?: CourseFilters): Promise<ApiResponse<Course[]>> {
    const response: AxiosResponse<ApiResponse<Course[]>> = await this.api.get('/courses', { params: filters });
    return response.data;
  }

  async getCourseById(id: string): Promise<ApiResponse<Course>> {
    const response: AxiosResponse<ApiResponse<Course>> = await this.api.get(`/courses/${id}`);
    return response.data;
  }

  async createCourse(data: FormData): Promise<ApiResponse<Course>> {
    const response: AxiosResponse<ApiResponse<Course>> = await this.api.post('/courses', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async updateCourse(id: string, data: FormData): Promise<ApiResponse<Course>> {
    const response: AxiosResponse<ApiResponse<Course>> = await this.api.put(`/courses/${id}`, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async deleteCourse(id: string): Promise<ApiResponse<null>> {
    const response: AxiosResponse<ApiResponse<null>> = await this.api.delete(`/courses/${id}`);
    return response.data;
  }

  // Module endpoints
  async getModules(filters?: ModuleFilters): Promise<ApiResponse<Module[]>> {
    const response: AxiosResponse<ApiResponse<Module[]>> = await this.api.get('/modules', { params: filters });
    return response.data;
  }

  async getModuleById(id: string): Promise<ApiResponse<Module>> {
    const response: AxiosResponse<ApiResponse<Module>> = await this.api.get(`/modules/${id}`);
    return response.data;
  }

  async createModule(data: Partial<Module>): Promise<ApiResponse<Module>> {
    const response: AxiosResponse<ApiResponse<Module>> = await this.api.post('/modules', data);
    return response.data;
  }

  async updateModule(id: string, data: Partial<Module>): Promise<ApiResponse<Module>> {
    const response: AxiosResponse<ApiResponse<Module>> = await this.api.patch(`/modules/${id}`, data);
    return response.data;
  }

  async deleteModule(id: string): Promise<ApiResponse<null>> {
    const response: AxiosResponse<ApiResponse<null>> = await this.api.delete(`/modules/${id}`);
    return response.data;
  }

  async getModulesByCourse(courseId: string): Promise<ApiResponse<Module[]>> {
    const response: AxiosResponse<ApiResponse<Module[]>> = await this.api.get(`/modules/course/${courseId}`);
    return response.data;
  }

  // Lecture endpoints
  async getLectures(filters?: LectureFilters): Promise<ApiResponse<Lecture[]>> {
    const response: AxiosResponse<ApiResponse<Lecture[]>> = await this.api.get('/lectures', { params: filters });
    return response.data;
  }

  async getLectureById(id: string): Promise<ApiResponse<Lecture>> {
    const response: AxiosResponse<ApiResponse<Lecture>> = await this.api.get(`/lectures/${id}`);
    return response.data;
  }

  async createLecture(data: FormData | Partial<Lecture>): Promise<ApiResponse<Lecture>> {
    let response: AxiosResponse<ApiResponse<Lecture>>;
    
    if (data instanceof FormData) {
      const token = localStorage.getItem('accessToken');
      response = await axios.post(
        `${this.api.defaults.baseURL}/lectures`,
        data,
        {
          headers: {
            Authorization: `${token}`,
          },
        }
      );
    } else {
      response = await this.api.post('/lectures', data);
    }
    
    return response.data;
  }

  async updateLecture(id: string, data: FormData | Partial<Lecture>): Promise<ApiResponse<Lecture>> {
    let response: AxiosResponse<ApiResponse<Lecture>>;
    
    if (data instanceof FormData) {
      const token = localStorage.getItem('accessToken');
      response = await axios.put(
        `${this.api.defaults.baseURL}/lectures/${id}`,
        data,
        {
          headers: {
            Authorization: `${token}`,
          },
        }
      );
    } else {
      response = await this.api.patch(`/lectures/${id}`, data);
    }
    
    return response.data;
  }

  async deleteLecture(id: string): Promise<ApiResponse<null>> {
    const response: AxiosResponse<ApiResponse<null>> = await this.api.delete(`/lectures/${id}`);
    return response.data;
  }

  async getLecturesByModule(moduleId: string): Promise<ApiResponse<Lecture[]>> {
    const response: AxiosResponse<ApiResponse<Lecture[]>> = await this.api.get(`/lectures/module/${moduleId}`);
    return response.data;
  }



  // Blog endpoints
  async getBlogs(): Promise<ApiResponse<Blog[]>> {
    const response: AxiosResponse<ApiResponse<Blog[]>> = await this.api.get('/blogs');
    return response.data;
  }

  async getBlogById(id: string): Promise<ApiResponse<Blog>> {
    const response: AxiosResponse<ApiResponse<Blog>> = await this.api.get(`/blogs/${id}`);
    return response.data;
  }

  async createBlog(data: FormData | Partial<Blog>): Promise<ApiResponse<Blog>> {
    let response: AxiosResponse<ApiResponse<Blog>>;
    
    if (data instanceof FormData) {
      // For FormData, create a new axios instance without the default Content-Type header
      const token = localStorage.getItem('accessToken');
      response = await axios.post(
        `${this.api.defaults.baseURL}/blogs`,
        data,
        {
          headers: {
            Authorization: `${token}`,
          },
        }
      );
    } else {
      response = await this.api.post('/blogs', data);
    }
    
    return response.data;
  }

  async updateBlog(id: string, data: FormData | Partial<Blog>): Promise<ApiResponse<Blog>> {
    let response: AxiosResponse<ApiResponse<Blog>>;
    
    if (data instanceof FormData) {
      // For FormData, create a new axios instance without the default Content-Type header
      const token = localStorage.getItem('accessToken');
      response = await axios.put(
        `${this.api.defaults.baseURL}/blogs/${id}`,
        data,
        {
          headers: {
            Authorization: `${token}`,
          },
        }
      );
    } else {
      // If not FormData, convert to FormData to match backend expectations
      const formData = new FormData();
      formData.append('data', JSON.stringify(data));
      
      const token = localStorage.getItem('accessToken');
      response = await axios.put(
        `${this.api.defaults.baseURL}/blogs/${id}`,
        formData,
        {
          headers: {
            Authorization: `${token}`,
          },
        }
      );
    }
    
    return response.data;
  }

  async deleteBlog(id: string): Promise<ApiResponse<null>> {
    const response: AxiosResponse<ApiResponse<null>> = await this.api.delete(`/blogs/${id}`);
    return response.data;
  }

  // User endpoints
  async getUsers(): Promise<ApiResponse<User[]>> {
    const response: AxiosResponse<ApiResponse<User[]>> = await this.api.get('/users/all-user');
    return response.data;
  }

  async getAdmins(): Promise<ApiResponse<User[]>> {
    const response: AxiosResponse<ApiResponse<User[]>> = await this.api.get('/users/all-admin');
    return response.data;
  }

  async getUserById(id: string): Promise<ApiResponse<User>> {
    const response: AxiosResponse<ApiResponse<User>> = await this.api.get(`/users/${id}`);
    return response.data;
  }

  async changeUserRole(id: string, role: string): Promise<ApiResponse<User>> {
    const response: AxiosResponse<ApiResponse<User>> = await this.api.patch(`/users/${id}`, { role });
    return response.data;
  }

  async changeUserStatus(id: string, status: string): Promise<ApiResponse<User>> {
    const response: AxiosResponse<ApiResponse<User>> = await this.api.patch(`/users/status/${id}`, { status });
    return response.data;
  }

  async deleteUser(id: string): Promise<ApiResponse<User>> {
    const response: AxiosResponse<ApiResponse<User>> = await this.api.delete(`/users/${id}`);
    return response.data;
  }

  async deleteAdmin(id: string): Promise<ApiResponse<User>> {
    const response: AxiosResponse<ApiResponse<User>> = await this.api.delete(`/users/admin/${id}`);
    return response.data;
  }

  async createUser(data: Partial<User>): Promise<ApiResponse<User>> {
    const response: AxiosResponse<ApiResponse<User>> = await this.api.post('/users/create-user', data);
    return response.data;
  }

  async updateUser(id: string, data: Partial<User>): Promise<ApiResponse<User>> {
    const response: AxiosResponse<ApiResponse<User>> = await this.api.patch(`/users/user/${id}`, data);
    return response.data;
  }

  // Enrollment endpoints
  async createEnrollmentRequest(data: { courseId: string; requestMessage?: string }): Promise<ApiResponse<EnrollmentRequest>> {
    const response: AxiosResponse<ApiResponse<EnrollmentRequest>> = await this.api.post('/enrollment-requests', data);
    return response.data;
  }

  async getAllEnrollmentRequests(filters?: any): Promise<ApiResponse<EnrollmentRequest[]>> {
    const response: AxiosResponse<ApiResponse<EnrollmentRequest[]>> = await this.api.get('/enrollment-requests', { params: filters });
    return response.data;
  }

  async getUserEnrollmentRequests(): Promise<ApiResponse<EnrollmentRequest[]>> {
    const response: AxiosResponse<ApiResponse<EnrollmentRequest[]>> = await this.api.get('/enrollment-requests/my-requests');
    return response.data;
  }

  async checkEnrollmentStatus(courseId: string): Promise<ApiResponse<EnrollmentStatus>> {
    const response: AxiosResponse<ApiResponse<EnrollmentStatus>> = await this.api.get(`/enrollment-requests/status/${courseId}`);
    return response.data;
  }

  async updateEnrollmentRequest(id: string, data: { status: string; adminResponse?: string }): Promise<ApiResponse<EnrollmentRequest>> {
    const response: AxiosResponse<ApiResponse<EnrollmentRequest>> = await this.api.patch(`/enrollment-requests/${id}`, data);
    return response.data;
  }

  async deleteEnrollmentRequest(id: string): Promise<ApiResponse<null>> {
    const response: AxiosResponse<ApiResponse<null>> = await this.api.delete(`/enrollment-requests/${id}`);
    return response.data;
  }
}

export const apiService = new ApiService();
