<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class WorkspaceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasVerifiedEmail() ?? false;
    }

    public function rules(): array
    {
        return ['name' => ['required', 'string', 'max:100'], 'region' => ['required', 'in:US,UK,CA,AU,PK'], 'timezone' => ['required', 'timezone', 'max:100'], 'terms_accepted' => ['required', 'accepted']];
    }
}
