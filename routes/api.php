<?php

use App\Http\Controllers\AuthController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AnimalController;
use App\Http\Controllers\RedeemCodeController;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use Illuminate\Support\Facades\Storage;
use App\Models\Animal;
use App\Http\Controllers\ProjectController;

Route::post('/register', [AuthController::class, 'register']);

Route::middleware(['web'])->group(function () {
    Route::post('/login', [AuthController::class, 'login']);
    Route::get('/authuser', [AuthController::class, 'authuser']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/projects', [ProjectController::class, 'index']);
    Route::post('/projects', [ProjectController::class, 'store']);
    Route::get('/projects/{id}', [ProjectController::class, 'show']);
    Route::put('/projects/{id}', [ProjectController::class, 'update']);
    Route::delete('/projects/{id}', [ProjectController::class, 'destroy']);
});




Route::apiResource('dzivnieki', AnimalController::class);
    

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


Route::get('/codes', [RedeemCodeController::class, 'index']);
Route::post('/codes', [RedeemCodeController::class, 'store']);
Route::delete('/codes/{id}', [RedeemCodeController::class, 'destroy']);
Route::post('/redeem', [RedeemCodeController::class, 'redeem']);

// Route::middleware('auth:sanctum')->group(function () {
//     Route::post('/redeem', [RedeemCodeController::class, 'redeem']);
//     Route::get('/balance', function (Request $request) {
//         return response()->json([
//             'balance' => $request->user()->balance
//         ]);
//     });
// });



