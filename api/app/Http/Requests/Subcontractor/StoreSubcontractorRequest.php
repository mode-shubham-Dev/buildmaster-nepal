<?php

namespace App\Http\Requests\Subcontractor;

use Illuminate\Foundation\Http\FormRequest;

class StoreSubcontractorRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name'           => ['required', 'string', 'max:255'],
            'specialty'      => ['nullable', 'string', 'max:255'],
            'contact_person' => ['nullable', 'string', 'max:255'],
            'phone'          => ['nullable', 'string', 'max:50'],
            'email'          => ['nullable', 'email', 'max:255'],
            'pan_vat_no'     => ['nullable', 'string', 'max:100'],
            'address'        => ['nullable', 'string'],
            'rating'         => ['nullable', 'integer', 'min:1', 'max:5'],
            'is_active'      => ['boolean'],
        ];
    }
}