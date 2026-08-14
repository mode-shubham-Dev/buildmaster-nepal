<?php

namespace App\Http\Requests\Subcontractor;

use Illuminate\Foundation\Http\FormRequest;

class StoreWorkPackageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'subcontractor_id'    => ['required', 'exists:subcontractors,id'],
            'project_id'          => ['required', 'exists:projects,id'],
            'title'               => ['required', 'string', 'max:255'],
            'scope'               => ['nullable', 'string'],
            'contract_amount'     => ['required', 'numeric', 'min:0'],
            'start_date'          => ['nullable', 'date'],
            'end_date'            => ['nullable', 'date'],
            'progress_percentage' => ['nullable', 'integer', 'min:0', 'max:100'],
            'status'              => ['required', 'in:assigned,in_progress,completed,terminated'],
        ];
    }
}