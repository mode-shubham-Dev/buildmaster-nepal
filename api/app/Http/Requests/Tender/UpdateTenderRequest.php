<?php

namespace App\Http\Requests\Tender;

use Illuminate\Foundation\Http\FormRequest;

class UpdateTenderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'client_id'           => ['nullable', 'exists:clients,id'],
            'title'               => ['required', 'string', 'max:255'],
            'reference_no'        => ['nullable', 'string', 'max:255'],
            'issuing_authority'   => ['nullable', 'string', 'max:255'],
            'estimated_value'     => ['nullable', 'numeric', 'min:0'],
            'bid_amount'          => ['nullable', 'numeric', 'min:0'],
            'bid_security'        => ['nullable', 'numeric', 'min:0'],
            'published_date'      => ['nullable', 'date'],
            'submission_deadline' => ['nullable', 'date'],
            'submitted_date'      => ['nullable', 'date'],
            'status'              => ['required', 'in:identified,preparing,submitted,won,lost,cancelled'],
            'scope'               => ['nullable', 'string'],
            'notes'               => ['nullable', 'string'],
        ];
    }
}