<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SettingController extends Controller
{
    /** Anyone logged in can READ settings (the UI needs currency, company name...). */
    public function show(): JsonResponse
    {
        return response()->json(['settings' => Setting::current()]);
    }

    /** Only settings.manage can UPDATE. */
    public function update(Request $request): JsonResponse
    {
        $data = $request->validate([
            'company_name'                  => ['required', 'string', 'max:255'],
            'company_address'               => ['nullable', 'string', 'max:255'],
            'pan_vat_no'                    => ['nullable', 'string', 'max:100'],
            'phone'                         => ['nullable', 'string', 'max:50'],
            'email'                         => ['nullable', 'email', 'max:255'],
            'default_vat_percentage'        => ['required', 'numeric', 'min:0', 'max:100'],
            'default_retention_percentage'  => ['required', 'numeric', 'min:0', 'max:100'],
            'currency_symbol'               => ['required', 'string', 'max:10'],
            'fiscal_year_start_month'       => ['required', 'integer', 'min:1', 'max:12'],
            'fiscal_year_start_day'         => ['required', 'integer', 'min:1', 'max:32'],
        ]);

        $settings = Setting::current();
        $settings->update($data);

        return response()->json(['message' => 'Settings updated.', 'settings' => $settings]);
    }
}