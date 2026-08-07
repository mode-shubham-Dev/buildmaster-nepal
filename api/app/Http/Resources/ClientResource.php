<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ClientResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'         => $this->id,
            'name'       => $this->name,
            'type'       => $this->type,
            'email'      => $this->email,
            'phone'      => $this->phone,
            'pan_vat_no' => $this->pan_vat_no,
            'website'    => $this->website,
            'address'    => $this->address,
            'status'     => $this->status,
            'notes'      => $this->notes,

            // counts (lightweight, for the list)
            'contacts_count'       => $this->whenCounted('contacts'),
            'contracts_count'      => $this->whenCounted('contracts'),
            'communications_count' => $this->whenCounted('communications'),

            // full relations (only when loaded, for the profile)
            'contacts'       => $this->whenLoaded('contacts'),
            'contracts'      => $this->whenLoaded('contracts'),
            'communications' => $this->whenLoaded('communications'),

            'created_at' => $this->created_at,
        ];
    }
}