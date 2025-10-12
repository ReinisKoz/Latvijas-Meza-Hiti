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

    public function redeem(Request $request) {
        $request->validate(['code' => 'required|string']);
        $code = RedeemCode::where('code', strtoupper($request->code))->first();

        if (!$code) return response()->json(['success' => false, 'message' => 'Invalid code'], 400);
        if ($code->is_used) return response()->json(['success' => false, 'message' => 'Code already used'], 400);
        if ($code->expires_at && $code->expires_at->isPast()) {
            return response()->json(['success' => false, 'message' => 'Code expired'], 400);
        }

        $code->is_used = true;
        $code->user_id = auth()->id() ?? null;
        $code->save();

        return response()->json([
            'success' => true,
            'message' => 'Code redeemed successfully!',
            'reward' => $code->reward
        ]);
    }
}
?>