<?php

namespace App\Http\Requests\Stock;

use Illuminate\Foundation\Http\FormRequest;

class RecordMovementRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'warehouse_id' => ['required', 'exists:warehouses,id'],
            'material_id'  => ['required', 'exists:materials,id'],
            'type'         => ['required', 'in:in,out'],
            'quantity'     => ['required', 'numeric', 'gt:0'],   // must be positive
            'unit_cost'    => ['nullable', 'numeric', 'min:0'],
            'reason'       => ['required', 'in:purchase,issue_to_project,return,adjustment,transfer'],
            'project_id'   => ['nullable', 'exists:projects,id'],
            'reference'    => ['nullable', 'string', 'max:255'],
            'remarks'      => ['nullable', 'string'],
        ];
    }
}