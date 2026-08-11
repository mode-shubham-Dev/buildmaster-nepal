<?php

namespace App\Http\Requests\Boq;

use Illuminate\Foundation\Http\FormRequest;

class UpdateBoqItemRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'category'    => ['nullable', 'string', 'max:255'],
            'item_code'   => ['nullable', 'string', 'max:50'],
            'description' => ['required', 'string'],
            'unit'        => ['required', 'string', 'max:50'],
            'quantity'    => ['required', 'numeric', 'min:0'],
            'rate'        => ['required', 'numeric', 'min:0'],
            'sort_order'  => ['nullable', 'integer'],
        ];
    }
}