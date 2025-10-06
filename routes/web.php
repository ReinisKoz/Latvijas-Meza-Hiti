<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/register', function () {
    return view('welcome');
});

Route::get('/gameview', function () {
    return view('welcome');
});

Route::get('/loggedview', function () {
    return view('welcome');
});


// POST krch router get /registerUse /register 
