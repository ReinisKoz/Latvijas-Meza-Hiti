<?php

use App\Http\Controllers\AuthController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\DzivnieksController;
use Illuminate\Support\Facades\Storage;

Route::post('/register', [AuthController::class, 'register']);

Route::post('/login', [AuthController::class, 'login']);

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
