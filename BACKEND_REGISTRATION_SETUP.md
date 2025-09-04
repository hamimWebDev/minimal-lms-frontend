# Backend Registration Setup

To make the registration work, you need to add a registration endpoint to your backend.

## 1. Add Registration Route

Add this to your `minimal-lms-backend/src/app/modules/auth/auth.route.ts`:

```typescript
import { Router } from "express";
import { AuthController } from "./auth.controller";

const router = Router();

router.post("/register", AuthController.registerUser);  // Add this line
router.post("/login", AuthController.loginUser);
router.post('/refresh-token', AuthController.refreshToken);

export const AuthRoutes = router;
```

## 2. Add Registration Controller Method

Add this to your `minimal-lms-backend/src/app/modules/auth/auth.controller.ts`:

```typescript
import { Request, Response } from "express";
import { UserServices } from "../user/user.services";
import { sendResponse } from "../../../utils/sendResponse";

export const AuthController = {
  // ... existing methods

  registerUser: async (req: Request, res: Response) => {
    try {
      const { name, email, password } = req.body;

      // Validate required fields
      if (!name || !email || !password) {
        return sendResponse(res, {
          statusCode: 400,
          success: false,
          message: "Name, email, and password are required",
          data: null,
        });
      }

      // Create user with default role 'user' and status 'in-progress'
      const userData = {
        name,
        email,
        password,
        role: 'user' as const,
        status: 'in-progress' as const,
        isDeleted: false,
      };

      const user = await UserServices.createUser(userData, 'system');

      // Remove password from response
      const { password: _, ...userWithoutPassword } = user.toObject();

      return sendResponse(res, {
        statusCode: 201,
        success: true,
        message: "User registered successfully",
        data: userWithoutPassword,
      });
    } catch (error: any) {
      return sendResponse(res, {
        statusCode: 400,
        success: false,
        message: error.message || "Registration failed",
        data: null,
      });
    }
  },

  // ... existing methods
};
```

## 3. Update User Services (if needed)

Your existing `UserServices.createUser` method should work, but make sure it handles the case where no creator role is passed:

```typescript
const createUser = async (user: IUser, creatorRole?: string) => {
  // Check if user already exists
  const existingUser = await User.findOne({ email: user.email });
  if (existingUser) {
    throw new Error('User already exists');
  }

  // Only admin can create admin users
  if (user.role === 'admin' && creatorRole !== 'admin') {
    throw new Error('Only admins can create admin users');
  }

  const result = await User.create(user);
  return result;
};
```

## 4. Test the Endpoint

Once you've added the registration endpoint, you can test it with:

```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123"
  }'
```

## 5. Expected Response

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "_id": "user_id_here",
    "name": "Test User",
    "email": "test@example.com",
    "role": "user",
    "status": "in-progress",
    "isDeleted": false,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

## 6. Error Handling

The endpoint will return appropriate error messages for:
- Missing required fields
- User already exists
- Invalid email format
- Password too short

## 7. Security Notes

- Passwords are automatically hashed by your User model
- Users are created with role 'user' by default (not admin)
- Status is set to 'in-progress' by default
- Email uniqueness is enforced

After implementing this, your frontend registration should work properly!
