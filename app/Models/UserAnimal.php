<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserAnimal extends Model
{
    use HasFactory;

    protected $table = 'animal_user'; // match your table name
    protected $fillable = ['user_id', 'animal_id']; // adjust columns as needed

    public $timestamps = true;

    // Optional: define relation to User
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Optional: define relation to Animal
    public function animal()
    {
        return $this->belongsTo(Animal::class);
    }
}
