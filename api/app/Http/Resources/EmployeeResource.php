<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EmployeeResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'              => $this->id,
            'employee_code'   => $this->employee_code,
            'first_name'      => $this->first_name,
            'last_name'       => $this->last_name,
            'full_name'       => $this->full_name,
            'email'           => $this->email,
            'phone'           => $this->phone,
            'date_of_birth'   => $this->date_of_birth?->toDateString(),
            'gender'          => $this->gender,
            'address'         => $this->address,
            'job_title'       => $this->job_title,
            'employment_type' => $this->employment_type,
            'joining_date'    => $this->joining_date?->toDateString(),
            'basic_salary'    => $this->basic_salary,
            'status'          => $this->status,

            // Related info — only included when loaded (whenLoaded avoids extra queries)
            'department'      => $this->whenLoaded('department', fn () => [
                'id'   => $this->department?->id,
                'name' => $this->department?->name,
            ]),
            'skills'               => $this->whenLoaded('skills'),
            'certifications'       => $this->whenLoaded('certifications'),
            'emergency_contacts'   => $this->whenLoaded('emergencyContacts'),

            'created_at'      => $this->created_at,
        ];
    }
}