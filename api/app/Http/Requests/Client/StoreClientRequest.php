<?php

namespace App\Http\Requests\Client;

use Illuminate\Foundation\Http\FormRequest;

class StoreClientRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name'       => ['required', 'string', 'max:255'],
            'type'       => ['required', 'in:individual,company'],
            'email'      => ['nullable', 'email', 'max:255'],
            'phone'      => ['nullable', 'string', 'max:50'],
            'pan_vat_no' => ['nullable', 'string', 'max:255'],
            'website'    => ['nullable', 'string', 'max:255'],
            'address'    => ['nullable', 'string'],
            'status'     => ['required', 'in:active,inactive'],
            'notes'      => ['nullable', 'string'],
        ];
    }
}