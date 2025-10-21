<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Project;
use Illuminate\Support\Facades\Auth;

class ProjectController extends Controller
{
    public function index()
    {
        return Project::where('user_id', Auth::id())->get();
    }

    public function show($id)
    {
        $project = Project::where('user_id', Auth::id())->findOrFail($id);
        return response()->json($project);
    }

    public function store(Request $request)
    {
        $project = Project::create([
            'user_id' => Auth::id(),
            'name' => $request->name,
            'data' => json_decode('{"timeline":{"bpm":60,"length":10,"volume":1},"positions":{}}'),
        ]);

        return response()->json($project);
    }

    public function update(Request $request, $id)
    {
        $project = Project::where('user_id', Auth::id())->findOrFail($id);

        // Only update fields that were actually sent
        $data = $request->only(['name', 'bpm', 'data']);

        // Preserve existing data if not provided
        if (!isset($data['data'])) {
            $data['data'] = $project->data;
        }

        $project->update($data);

        return response()->json($project);
    }


    public function destroy($id)
    {
        $project = Project::where('user_id', Auth::id())->findOrFail($id);
        $project->delete();
        return response()->json(['message' => 'Deleted']);
    }
}
?>
