<?php

namespace App\Http\Controllers;

use App\Models\User; 
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;


class AuthController extends Controller
{
    // user::create
    $user = User::create([
        'username' => $request->username,
        'email'=> $request->email,
        'password'=> Hash::make($request->password)
    ]);
}
