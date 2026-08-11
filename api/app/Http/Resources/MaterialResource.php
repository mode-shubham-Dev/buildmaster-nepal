<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MaterialResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'            => $this->id,
            'code'          => $this->code,
            'name'          => $this->name,
            'description'   => $this->description,
            'unit'          => $this->unit,
            'unit_cost'     => $this->unit_cost,
            'reorder_level' => $this->reorder_level,
            'is_active'     => $this->is_active,
            'category'      => $this->whenLoaded('category', fn () => [
                'id'   => $this->category?->id,
                'name' => $this->category?->name,
            ]),
            'created_at'    => $this->created_at,
        ];
    }
}