<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TenderResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                  => $this->id,
            'title'               => $this->title,
            'reference_no'        => $this->reference_no,
            'issuing_authority'   => $this->issuing_authority,
            'estimated_value'     => $this->estimated_value,
            'bid_amount'          => $this->bid_amount,
            'bid_security'        => $this->bid_security,
            'published_date'      => $this->published_date?->toDateString(),
            'submission_deadline' => $this->submission_deadline?->toDateString(),
            'submitted_date'      => $this->submitted_date?->toDateString(),
            'status'              => $this->status,
            'scope'               => $this->scope,
            'notes'               => $this->notes,
            'client'              => $this->whenLoaded('client', fn () => [
                'id'   => $this->client?->id,
                'name' => $this->client?->name,
            ]),
            'created_at'          => $this->created_at,
        ];
    }
}