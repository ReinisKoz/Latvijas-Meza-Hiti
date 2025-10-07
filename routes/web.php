<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/{any}', function () {
    return view('welcome');
<<<<<<< HEAD
})->where('any', '^(?!api).*$'); // Excludes routes starting with "api"
=======
});

Route::get('/gameview', function () {
    return view('welcome');
});

Route::get('/loggedview', function () {
    return view('welcome');
});

Route::get('/wheel', function () {
    return view('welcome');
});

Route::get('/admindashboard', function () {
    return view('welcome');
});

// POST krch router get /registerUse /register 
>>>>>>> d8d95503e67f87a5b082548579b9f40a482cb0c9
