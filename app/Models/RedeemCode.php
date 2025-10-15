<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RedeemCode extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'reward',
        'is_used',
        'user_id',
        'expires_at',
    ];

    protected $casts = [
        'is_used' => 'boolean',
        'expires_at' => 'datetime',
    ];
}
