<?php

namespace App\Http\Requests\Employee;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateEmployeeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $employeeId = $this->route('employee')->id;

        return [
            'department_id'   => ['nullable', 'exists:departments,id'],
            'user_id'         => ['nullable', 'exists:users,id'],
            'employee_code'   => [
                'required', 'string', 'max:50',
                Rule::unique('employees', 'employee_code')->ignore($employeeId),
            ],
            'first_name'      => ['required', 'string', 'max:255'],
            'last_name'       => ['required', 'string', 'max:255'],
            'email'           => ['nullable', 'email', 'max:255'],
            'phone'           => ['nullable', 'string', 'max:50'],
            'date_of_birth'   => ['nullable', 'date'],
            'gender'          => ['nullable', 'in:male,female,other'],
            'address'         => ['nullable', 'string'],
            'job_title'       => ['nullable', 'string', 'max:255'],
            'employment_type' => ['required', 'in:full_time,part_time,contract,daily_wage'],
            'joining_date'    => ['nullable', 'date'],
            'basic_salary'    => ['nullable', 'numeric', 'min:0'],
            'status'          => ['required', 'in:active,inactive,terminated'],
        ];
    }
}