<?php

namespace App\Http\Requests\Equipment;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreEquipmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $id = $this->route('equipment')?->id;

        return [
            'code'          => ['required', 'string', 'max:50', Rule::unique('equipment', 'code')->ignore($id)],
            'name'          => ['required', 'string', 'max:255'],
            'category'      => ['nullable', 'string', 'max:255'],
            'ownership'     => ['required', 'in:owned,rented'],
            'purchase_cost' => ['nullable', 'numeric', 'min:0'],
            'rental_rate'   => ['nullable', 'numeric', 'min:0'],
            'purchase_date' => ['nullable', 'date'],
            'status'        => ['required', 'in:available,in_use,maintenance,retired'],
            'project_id'    => ['nullable', 'exists:projects,id'],
            'notes'         => ['nullable', 'string'],
            'is_active'     => ['boolean'],
        ];
    }
}