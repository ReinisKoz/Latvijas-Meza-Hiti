<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Dzivnieks extends Model
{
    use HasFactory;

    protected $table = 'dzivnieki';

    protected $fillable = [
        'nosaukums',
        'bilde',
        'audio',
    ];
}
