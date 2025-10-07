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
        return response()->json([
            'isAuthenticated' => false,
            'error' => 'Authentication failed'
        ], 500);
    }
}
    
    public function register(Request $request)
    {
        Log::info("User Login request", [
        'data' => $request->all()
        ]);

        // $validator = Validator::make($request->all(), [
        //     'name' => 'required|string|max:255',
        //     'email' => 'required|string|email|max:255|unique:users',
        //     'password' => 'required|string|min:8|confirmed',
        // ]);

        // if ($validator->fails()) {
        //     return response()->json([
        //         'errors' => $validator->errors()
        //     ], 422);
        // }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        // $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Lietotājs veikmiģi reģistrēts',
            'user' => $user,
        ], 201);
    }

    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors()
            ], 422);
        }

        if (Auth::attempt($request->only('email', 'password'))) {
            $user = User::where('email', $request->email)->firstOrFail();
            
            return response()->json([
            'message' => 'Veiksmīga pieteikšanās',
            'user' => $user,
        ]);
        }

        return response()->json([
                'message' => 'Nepareizs e-pasts vai parole'
            ], 401);
    }

    public function logout(Request $request)
    {
        Auth::logout();
        return response()->json([
            'message' => 'Veiksmīgi atslēgts'
        ]);
    }


}