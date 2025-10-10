<?php
namespace App\Http\Controllers;

use App\Models\RedeemCode;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class RedeemCodeController extends Controller
{
    public function index() {
        return RedeemCode::orderBy('created_at', 'desc')->get();
    }

    public function store(Request $request) {
        $request->validate([
            'reward' => 'required|string',
            'expires_at' => 'nullable|date'
        ]);

        $code = strtoupper(Str::random(10));

        $redeem = RedeemCode::create([
            'code' => $code,
            'reward' => $request->reward,
            'expires_at' => $request->expires_at
        ]);

        return response()->json($redeem);
    }

    public function destroy($id) {
        RedeemCode::findOrFail($id)->delete();
        return response()->json(['success' => true]);
    }

    public function redeem(Request $request)
    {
        $request->validate([
            'code' => 'required|string',
        ]);

        $redeemCode = RedeemCode::where('code', $request->code)
            ->where('is_used', false)
            ->where(function ($q) {
                $q->whereNull('expires_at')
                ->orWhere('expires_at', '>', now());
            })
            ->first();

        if (! $redeemCode) {
            return response()->json(['message' => 'Invalid or expired code'], 400);
        }

        $user = $request->user(); // Authenticated user


        // Example: reward is numeric (money amount)
        if (is_numeric($redeemCode->reward)) {
            $user->balance += (float) $redeemCode->reward;
            $user->save();
        }

        // mark code as used
        $redeemCode->is_used = true;
        $redeemCode->user_id = $user->id;
        $redeemCode->save();

        return response()->json([
            'message' => 'Code redeemed successfully' + $user,
            'new_balance' => $user->balance,
        ]);
    }

}
?>