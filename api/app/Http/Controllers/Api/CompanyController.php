<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Company\UpdateCompanyRequest;
use App\Models\Company;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CompanyController extends Controller
{
    public function show():JsonResponse
    {
        $company = Company::first() ?? Company::create(['name' => 'My Company']);

        return response()->json(['company' => $company]);
    }

    public function update(UpdateCompanyRequest $request):JsonResponse
    {
        $company = Company::first() ?? new Company();
        $company->fill($request->validated());
        $company->save();

        return response()->json([
            'message' => 'Company updated successfully.', 
            'company' => $company,
        ]);
    }
}
