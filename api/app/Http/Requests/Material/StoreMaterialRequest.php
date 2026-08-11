<?php

namespace App\Http\Requests\Material;

use Illuminate\Foundation\Http\FormRequest;

class StoreMaterialRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'material_category_id' => ['nullable', 'exists:material_categories,id'],
            'code'                 => ['required', 'string', 'max:50', 'unique:materials,code'],
            'name'                 => ['required', 'string', 'max:255'],
            'description'          => ['nullable', 'string'],
            'unit'                 => ['required', 'string', 'max:50'],
            'unit_cost'            => ['nullable', 'numeric', 'min:0'],
            'reorder_level'        => ['nullable', 'numeric', 'min:0'],
            'is_active'            => ['boolean'],
        ];
    }
}