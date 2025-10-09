<?php

use App\Http\Controllers\AuthController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\DzivnieksController;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use Illuminate\Support\Facades\Storage;
use App\Models\Animal;

Route::post('/register', [AuthController::class, 'register']);

Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout']);

Route::get('/authuser', [AuthController::class, 'authuser']);

Route::get('/dzivnieki', [DzivnieksController::class, 'index']);
Route::post('/dzivnieki', [DzivnieksController::class, 'store']);
Route::delete('/dzivnieki/{id}', [DzivnieksController::class, 'destroy']);

Route::get('/animal', function () {
    $animals = Animal::all()->map(function ($animal) {
        return [
            'name'  => $animal->nosaukums,
            'sound' => asset('storage/' . $animal->audio),
            'image' => asset('storage/' . $animal->bilde),
        ];
    });

    return response()->json($animals);
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