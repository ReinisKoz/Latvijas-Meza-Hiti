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
            'data' => $request->data,
        ]);

        return response()->json($project);
    }

    public function update(Request $request, $id)
    {
        $project = Project::where('user_id', Auth::id())->findOrFail($id);
        $project->update(['data' => $request->data]);
        return response()->json(['message' => 'Project updated']);
    }

    public function destroy($id)
    {
        $project = Project::where('user_id', Auth::id())->findOrFail($id);
        $project->delete();
        return response()->json(['message' => 'Deleted']);
    }
}
?>
