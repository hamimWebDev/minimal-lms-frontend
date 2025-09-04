# Minimal LMS Frontend

A modern, responsive Learning Management System (LMS) frontend built with Next.js 14, TypeScript, Redux Toolkit, Tailwind CSS, and shadcn/ui components.

## 🚀 Features

- **Modern UI/UX**: Clean, responsive design with dark mode support
- **Authentication**: Complete login/register system with JWT tokens
- **Course Management**: Browse, search, and filter courses
- **User Dashboard**: Track progress, view enrolled courses, and manage profile
- **Blog System**: Read and explore educational content
- **Progress Tracking**: Monitor learning progress and achievements
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **TypeScript**: Full type safety throughout the application
- **Redux State Management**: Centralized state management with Redux Toolkit
- **Form Validation**: Robust form validation with React Hook Form and Zod

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **State Management**: Redux Toolkit
- **Form Handling**: React Hook Form + Zod
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **Theme**: next-themes (dark/light mode)

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── auth/              # Authentication pages
│   ├── courses/           # Course-related pages
│   ├── dashboard/         # User dashboard
│   ├── profile/           # User profile
│   ├── blog/              # Blog pages
│   └── layout.tsx         # Root layout
├── components/            # Reusable components
│   ├── ui/               # shadcn/ui components
│   ├── layout/           # Layout components
│   ├── sections/         # Page sections
│   └── cards/            # Card components
├── lib/                  # Utility libraries
│   ├── api.ts           # API service
│   ├── store.ts         # Redux store
│   └── hooks.ts         # Custom hooks
├── store/               # Redux store
│   └── slices/          # Redux slices
└── types/               # TypeScript type definitions
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Backend API running (see minimal-lms-backend)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd minimal-lms-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📱 Pages & Features

### Public Pages
- **Home** (`/`): Landing page with hero section, featured courses, and testimonials
- **Courses** (`/courses`): Browse and search all available courses
- **Course Detail** (`/courses/[id]`): Detailed course information and enrollment
- **Blog** (`/blog`): Educational articles and insights
- **Login** (`/auth/login`): User authentication
- **Register** (`/auth/register`): User registration

### Protected Pages
- **Dashboard** (`/dashboard`): User's learning dashboard with progress tracking
- **Profile** (`/profile`): User profile management and settings

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:5000/api/v1` |

### API Integration

The frontend integrates with the Minimal LMS Backend API. Ensure the backend is running and accessible at the configured API URL.

## 🎨 Customization

### Styling
- Modify Tailwind CSS classes in components
- Update theme colors in `tailwind.config.js`
- Customize shadcn/ui components in `src/components/ui/`

### Components
- Add new components in `src/components/`
- Create new pages in `src/app/`
- Extend Redux slices in `src/store/slices/`

## 📦 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## 🔐 Authentication

The application uses JWT-based authentication with automatic token refresh:

- Access tokens are stored in localStorage
- Automatic token refresh on 401 responses
- Protected routes redirect to login
- User state managed in Redux

## 📊 State Management

Redux Toolkit is used for state management with the following slices:

- **auth**: User authentication and session management
- **course**: Course data and filtering
- **module**: Course module management
- **lecture**: Lecture content management
- **progress**: Learning progress tracking
- **blog**: Blog post management
- **ui**: UI state (theme, sidebar, notifications)

## 🎯 Key Features

### Course Management
- Browse courses with advanced filtering
- Search by title, category, level, and price
- Course details with curriculum and reviews
- Enrollment system

### User Experience
- Responsive design for all devices
- Dark/light theme toggle
- Loading states and error handling
- Form validation with helpful error messages

### Progress Tracking
- Visual progress indicators
- Course completion tracking
- Learning statistics and achievements

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the backend API documentation

## 🔄 Backend Integration

This frontend is designed to work with the Minimal LMS Backend. Ensure the backend is properly configured and running before using the frontend features.

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Other Platforms
- Build the project: `npm run build`
- Deploy the `out` directory to your hosting platform
- Configure environment variables on your hosting platform

---

Built with ❤️ using Next.js, TypeScript, and modern web technologies.
