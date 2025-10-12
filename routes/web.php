<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/{any}', function () {
    return view('welcome');
});

<<<<<<< HEAD
=======

>>>>>>> 50f0d1becdcd53efbe2eb92da127cefad57f569f
