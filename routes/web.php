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

