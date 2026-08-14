<?php

namespace App\Http\Requests\Vehicle;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreVehicleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $id = $this->route('vehicle')?->id;

        return [
            'registration_no' => ['required', 'string', 'max:100', Rule::unique('vehicles', 'registration_no')->ignore($id)],
            'make'            => ['nullable', 'string', 'max:255'],
            'model'           => ['nullable', 'string', 'max:255'],
            'type'            => ['nullable', 'string', 'max:255'],
            'ownership'       => ['required', 'in:owned,rented'],
            'purchase_cost'   => ['nullable', 'numeric', 'min:0'],
            'rental_rate'     => ['nullable', 'numeric', 'min:0'],
            'status'          => ['required', 'in:available,in_use,maintenance,retired'],
            'project_id'      => ['nullable', 'exists:projects,id'],
            'notes'           => ['nullable', 'string'],
            'is_active'       => ['boolean'],
        ];
    }
}