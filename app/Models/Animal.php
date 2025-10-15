<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Animal extends Model
{
    use HasFactory;

    protected $table = 'dzivnieki';

    protected $fillable = [
        'nosaukums',
        'bilde',
        'audio',
    ];

    public function users()
    {
        return $this->belongsToMany(User::class)->withTimestamps();
    }

    

}
