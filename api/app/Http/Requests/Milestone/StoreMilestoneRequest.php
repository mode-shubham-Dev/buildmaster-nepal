<?php

namespace App\Http\Requests\Milestone;

use Illuminate\Foundation\Http\FormRequest;

class StoreMilestoneRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title'                 => ['required', 'string', 'max:255'],
            'description'           => ['nullable', 'string'],
            'budget'                => ['nullable', 'numeric', 'min:0'],
            'deadline'              => ['nullable', 'date'],
            'completion_percentage' => ['nullable', 'integer', 'min:0', 'max:100'],
            'status'                => ['required', 'in:pending,in_progress,completed,delayed'],
            'sort_order'            => ['nullable', 'integer'],
        ];
    }
}