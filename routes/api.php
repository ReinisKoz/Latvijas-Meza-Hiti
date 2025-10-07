<?php

use App\Http\Controllers\AuthController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\DzivnieksController;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use Illuminate\Support\Facades\Storage;

Route::post('/register', [AuthController::class, 'register']);

Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout']);

Route::get('/authuser', [AuthController::class, 'authuser']);

Route::get('/dzivnieki', [DzivnieksController::class, 'index']);
Route::post('/dzivnieki', [DzivnieksController::class, 'store']);
Route::delete('/dzivnieki/{id}', [DzivnieksController::class, 'destroy']);

Route::get('/animal-sounds', function () {
    // Look inside storage/app/public/dzivnieki/audio
    $files = Storage::disk('public')->files('/dzivnieki/audio');

    // Return them as public URLs
    return array_map(fn($f) => asset('storage/' . $f), $files);
});





Route::get('/user', function () {
    $user = Auth::user();

    return response()->json([
        'user' => $user ? [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
        ] : null,
    ]);
});