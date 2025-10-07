<?php

use App\Http\Controllers\AuthController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\DzivnieksController;

Route::post('/register', [AuthController::class, 'register']);

Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout']);

Route::get('/authuser', [AuthController::class, 'authuser']);

Route::get('/dzivnieki', [DzivnieksController::class, 'index']);
Route::post('/dzivnieki', [DzivnieksController::class, 'store']);
Route::delete('/dzivnieki/{id}', [DzivnieksController::class, 'destroy']);
