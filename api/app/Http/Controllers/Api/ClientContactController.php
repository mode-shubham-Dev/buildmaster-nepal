<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Client;
use App\Models\ClientContact;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ClientContactController extends Controller
{
    public function store(Request $request, Client $client): JsonResponse
    {
        $data = $request->validate([
            'name'        => ['required', 'string', 'max:255'],
            'designation' => ['nullable', 'string', 'max:255'],
            'email'       => ['nullable', 'email', 'max:255'],
            'phone'       => ['nullable', 'string', 'max:50'],
            'is_primary'  => ['boolean'],
        ]);

        $contact = $client->contacts()->create($data);

        return response()->json([
            'message' => 'Contact added successfully.',
            'contact' => $contact,
        ], 201);
    }

    public function destroy(ClientContact $clientContact): JsonResponse
    {
        $clientContact->delete();

        return response()->json(['message' => 'Contact removed successfully.']);
    }
}