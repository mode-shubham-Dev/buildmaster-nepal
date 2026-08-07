<?php

namespace App\Http\Requests\Project;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateProjectRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $projectId = $this->route('project')->id;

        return [
            'client_id'          => ['nullable', 'exists:clients,id'],
            'tender_id'          => ['nullable', 'exists:tenders,id'],
            'project_manager_id' => ['nullable', 'exists:employees,id'],
            'project_code'       => [
                'required', 'string', 'max:50',
                Rule::unique('projects', 'project_code')->ignore($projectId),
            ],
            'name'               => ['required', 'string', 'max:255'],
            'description'        => ['nullable', 'string'],
            'budget'             => ['nullable', 'numeric', 'min:0'],
            'contract_value'     => ['nullable', 'numeric', 'min:0'],
            'start_date'         => ['nullable', 'date'],
            'end_date'           => ['nullable', 'date'],
            'site_location'      => ['nullable', 'string', 'max:255'],
            'latitude'           => ['nullable', 'string', 'max:50'],
            'longitude'          => ['nullable', 'string', 'max:50'],
            'status'             => ['required', 'in:planning,approval,execution,monitoring,completion,archived'],
        ];
    }
}