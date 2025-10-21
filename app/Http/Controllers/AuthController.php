<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class AuthController extends Controller
{
    /**
     * Get the currently authenticated user
     */
    public function authuser(Request $request)
    {
        try {
            $user = Auth::user();

            if (!$user) {
                return response()->json([
                    'isAuthenticated' => false,
                    'user' => null,
                ], 401);
            }

            return response()->json([
                'isAuthenticated' => true,
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                ],
            ]);
        } catch (\Exception $e) {
            Log::error('Auth user error: ' . $e->getMessage());

            return response()->json([
                'isAuthenticated' => false,
                'error' => 'Authentication failed'
            ], 500);
        }
    }

    /**
     * Register a new user
     */
    public function register(Request $request)
    {
        Log::info("Register request received", ['data' => $request->all()]);

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => [
                'required',
                'string',
                'min:8', // minimum 8 characters
                'confirmed', // must match password_confirmation
                'regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/'
            ],
        ], [
            'password.regex' => 'Password must include at least one uppercase letter, one lowercase letter, one number, and one special character.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors()
            ], 422);
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        return response()->json([
            'message' => 'User registered successfully',
            'user' => $user,
        ], 201);
    }

    /**
     * Login user
     */
    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors()
            ], 422);
        }

        if (Auth::attempt($request->only('email', 'password'))) {
            $user = Auth::user(); // we can now get the authenticated user

            return response()->json([
                'message' => 'Login successful',
                'user' => $user,
            ]);
        }

        return response()->json([
            'message' => 'Invalid email or password'
        ], 401);
    }

    /**
     * Logout user
     */
    public function logout(Request $request)
    {
        Auth::logout();

        return response()->json([
            'message' => 'Logged out successfully'
        ]);
    }

    public function balance(Request $request)
    {
        $user = auth()->user(); // works with "web" guard

        if (!$user) {
            return response()->json(['message' => 'Not authenticated'], 401);
        }

        return response()->json(['balance' => $user->balance]);
    }
}
