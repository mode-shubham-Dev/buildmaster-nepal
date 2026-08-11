<?php

namespace App\Http\Requests\SiteReport;

use Illuminate\Foundation\Http\FormRequest;

class UpdateSiteReportRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'report_date'         => ['required', 'date'],
            'work_done'           => ['required', 'string'],
            'workers_present'     => ['nullable', 'integer', 'min:0'],
            'weather'             => ['nullable', 'string', 'max:50'],
            'progress_percentage' => ['nullable', 'integer', 'min:0', 'max:100'],
            'materials_used'      => ['nullable', 'string'],
            'issues'              => ['nullable', 'string'],
        ];
    }
}