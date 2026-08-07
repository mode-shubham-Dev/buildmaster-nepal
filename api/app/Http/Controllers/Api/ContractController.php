<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Client;
use App\Models\Contract;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ContractController extends Controller
{
    public function store(Request $request, Client $client): JsonResponse
    {
        $data = $request->validate([
            'title'       => ['required', 'string', 'max:255'],
            'contract_no' => ['nullable', 'string', 'max:255'],
            'value'       => ['nullable', 'numeric', 'min:0'],
            'start_date'  => ['nullable', 'date'],
            'end_date'    => ['nullable', 'date'],
            'status'      => ['required', 'in:draft,active,completed,terminated'],
            'description' => ['nullable', 'string'],
        ]);

        $contract = $client->contracts()->create($data);

        return response()->json([
            'message'  => 'Contract added successfully.',
            'contract' => $contract,
        ], 201);
    }

    public function destroy(Contract $contract): JsonResponse
    {
        $contract->delete();

        return response()->json(['message' => 'Contract removed successfully.']);
    }
}