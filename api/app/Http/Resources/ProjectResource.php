<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProjectResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'             => $this->id,
            'project_code'   => $this->project_code,
            'name'           => $this->name,
            'description'    => $this->description,
            'budget'         => $this->budget,
            'contract_value' => $this->contract_value,
            'start_date'     => $this->start_date?->toDateString(),
            'end_date'       => $this->end_date?->toDateString(),
            'site_location'  => $this->site_location,
            'latitude'       => $this->latitude,
            'longitude'      => $this->longitude,
            'status'         => $this->status,

            'client' => $this->whenLoaded('client', fn () => [
                'id'   => $this->client?->id,
                'name' => $this->client?->name,
            ]),
            'tender' => $this->whenLoaded('tender', fn () => [
                'id'    => $this->tender?->id,
                'title' => $this->tender?->title,
            ]),
            'project_manager' => $this->whenLoaded('projectManager', fn () => [
                'id'        => $this->projectManager?->id,
                'full_name' => $this->projectManager?->full_name,
            ]),

            // team members with their pivot role
            'members' => $this->whenLoaded('members', fn () =>
                $this->members->map(fn ($m) => [
                    'id'              => $m->id,
                    'full_name'       => $m->full_name,
                    'employee_code'   => $m->employee_code,
                    'role_on_project' => $m->pivot->role_on_project,
                ])
            ),

            'members_count' => $this->whenCounted('members'),
            'created_at'    => $this->created_at,
        ];
    }
}