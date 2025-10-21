<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use App\Models\Animal;
use App\Models\UserAnimal;

class WheelController extends Controller
{
    public function unlockableAnimals()
    {
        $user = Auth::user();

        // Get animals that are marked as unlockable and the user has not unlocked yet
        $unlockedIds = UserAnimal::where('user_id', $user->id)
            ->pluck('animal_id')
            ->toArray();

        $animals = Animal::where('is_unlockable', 1)
            ->whereNotIn('id', $unlockedIds)
            ->get();

        return response()->json($animals);
    }

    public function unlockAnimal(Request $request)
    {
        $user = Auth::user();
        $animal = Animal::where('nosaukums', $request->name)->first();
        if (!$animal) {
            return response()->json(['message' => 'Animal not found'], 404);
        }

        // Check if already unlocked
        if (!UserAnimal::where('user_id', $user->id)->where('animal_id', $animal->id)->exists()) {
            UserAnimal::create([
                'user_id' => $user->id,
                'animal_id' => $animal->id,
            ]);
        }

        return response()->json(['message' => 'Animal unlocked!']);
    }

    public function updateBalance(Request $request)
    {
        $user = Auth::user();
        $change = $request->input('change');

        if ($change === 'reset') {
            $user->balance = 0;
        } else {
            $user->balance += floatval($change);
        }

        $user->save();

        return response()->json(['balance' => $user->balance]);
    }
}
