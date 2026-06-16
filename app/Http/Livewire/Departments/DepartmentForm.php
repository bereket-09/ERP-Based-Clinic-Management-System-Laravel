<?php

namespace App\Http\Livewire\Departments;

use App\Models\Departement;
use Livewire\Component;

/**
 * REFERENCE FORM COMPONENT — copy this structure for create/edit screens.
 *
 *   - real-time validation (validateOnly on each field update)
 *   - save without a page refresh -> toast + reset/redirect
 *   - works for both create and edit (pass $departmentId to edit)
 *
 *   @livewire('departments.department-form')                    {{-- create --}}
 *   @livewire('departments.department-form', ['departmentId' => $id])  {{-- edit --}}
 */
class DepartmentForm extends Component
{
    public ?int $departmentId = null;

    public string $name = '';
    public string $desc = '';
    public string $status = 'Active';

    protected function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'desc' => 'required|string',
            'status' => 'required|in:Active,Inactive',
        ];
    }

    protected $messages = [
        'name.required' => 'Department name is required.',
        'desc.required' => 'Please add a short description.',
    ];

    public function mount(): void
    {
        if ($this->departmentId) {
            $dept = Departement::findOrFail($this->departmentId);
            $this->name = $dept->name;
            $this->desc = $dept->desc;
            $this->status = $dept->status ?: 'Active';
        }
    }

    public function updated($field): void
    {
        $this->validateOnly($field);
    }

    public function save()
    {
        $data = $this->validate();

        $dept = $this->departmentId ? Departement::findOrFail($this->departmentId) : new Departement();
        $dept->name = $data['name'];
        $dept->desc = $data['desc'];
        $dept->status = $data['status'];
        $dept->save();

        $this->dispatchBrowserEvent('notify', [
            'type' => 'success',
            'message' => $this->departmentId ? 'Department updated.' : 'Department created.',
        ]);

        // brief pause so the toast is visible, then go to the list
        $this->dispatchBrowserEvent('redirect-after', ['url' => '/view-departement']);
    }

    public function render()
    {
        return view('livewire.departments.department-form');
    }
}
