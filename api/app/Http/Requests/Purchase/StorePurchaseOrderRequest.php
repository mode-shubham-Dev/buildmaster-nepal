<?php

namespace App\Http\Requests\Purchase;

use Illuminate\Foundation\Http\FormRequest;

class StorePurchaseOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'po_number'         => ['required', 'string', 'max:50', 'unique:purchase_orders,po_number'],
            'supplier_id'       => ['nullable', 'exists:suppliers,id'],
            'warehouse_id'      => ['nullable', 'exists:warehouses,id'],
            'project_id'        => ['nullable', 'exists:projects,id'],
            'vat_percentage'    => ['nullable', 'numeric', 'min:0', 'max:100'],
            'order_date'        => ['nullable', 'date'],
            'expected_delivery' => ['nullable', 'date'],
            'notes'             => ['nullable', 'string'],

            // Line items — required, at least one
            'items'                => ['required', 'array', 'min:1'],
            'items.*.material_id'  => ['required', 'exists:materials,id'],
            'items.*.quantity'     => ['required', 'numeric', 'gt:0'],
            'items.*.rate'         => ['required', 'numeric', 'min:0'],
        ];
    }
}