<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\AnimalController;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/{any}', function () {
    return view('welcome');
});


Route::middleware('authuser')->get('/api/user/animals', [AnimalController::class, 'userAnimals']);

Route::middleware(['web'])->group(function () {
    Route::get('/authuser', [AuthController::class, 'authuser']);
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/logout', [AuthController::class, 'logout']);
});