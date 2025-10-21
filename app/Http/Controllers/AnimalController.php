<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Animal;
use Illuminate\Support\Facades\Storage;

class AnimalController extends Controller
{
    public function index()
    {
        $dzivnieki = Animal::all()->map(function ($dz) {
            $dz->bilde_url = $dz->bilde ? asset('storage/' . $dz->bilde) : null;
            $dz->audio_url = $dz->audio ? asset('storage/' . $dz->audio) : null;
            return $dz;
        });

        return response()->json($dzivnieki);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nosaukums' => 'required|string|max:255',
            'bilde' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'audio' => 'nullable|mimes:mp3,wav,ogg|max:10240',
        ]);

        $bildePath = null;
        $audioPath = null;

        if ($request->hasFile('bilde')) {
            $bildePath = $request->file('bilde')->store('dzivnieki/bildes', 'public');
        }

        if ($request->hasFile('audio')) {
            $audioPath = $request->file('audio')->store('dzivnieki/audio', 'public');
        }

        Animal::create([
            'nosaukums' => $validated['nosaukums'],
            'bilde' => $bildePath,
            'audio' => $audioPath,
        ]);

        return response()->json(['message' => 'Dzīvnieks veiksmīgi pievienots!']);
    }

    public function destroy($id)
    {
        $dzivnieks = Animal::findOrFail($id);

        if ($dzivnieks->bilde) {
            Storage::disk('public')->delete($dzivnieks->bilde);
        }

        if ($dzivnieks->audio) {
            Storage::disk('public')->delete($dzivnieks->audio);
        }

        $dzivnieks->delete();

        return response()->json(['message' => 'Dzīvnieks izdzēsts!']);
    }

    public function userAnimals(Request $request)
    {
        $user = auth()->user();

        $animals = Animal::where('is_unlockable', false)
            ->orWhereHas('users', fn($q) => $q->where('users.id', $user->id))
            ->get();

        $animals = $animals->map(function ($animal) {
            return [
                'name'  => $animal->nosaukums,
                'sound' => asset('storage/' . $animal->audio),
                'image' => asset('storage/' . $animal->bilde),
            ];
        });

        return response()->json($animals);
    }

}
