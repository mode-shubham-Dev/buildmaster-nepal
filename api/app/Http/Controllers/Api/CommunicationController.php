<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Client;
use App\Models\Communication;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CommunicationController extends Controller
{
    public function store(Request $request, Client $client): JsonResponse
    {
        $data = $request->validate([
            'type'            => ['required', 'in:call,email,meeting,note'],
            'subject'         => ['required', 'string', 'max:255'],
            'body'            => ['nullable', 'string'],
            'communicated_at' => ['nullable', 'date'],
        ]);

        // auto-attach the logged-in user as who recorded this
        $data['user_id'] = $request->user()->id;

        $communication = $client->communications()->create($data);

        return response()->json([
            'message'       => 'Communication logged successfully.',
            'communication' => $communication->load('user'),
        ], 201);
    }

    public function destroy(Communication $communication): JsonResponse
    {
        $communication->delete();

        return response()->json(['message' => 'Communication removed successfully.']);
    }
}