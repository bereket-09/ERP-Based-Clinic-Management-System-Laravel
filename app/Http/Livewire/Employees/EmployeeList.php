<?php

namespace App\Http\Livewire\Employees;

use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Livewire\Component;
use Livewire\WithPagination;

/**
 * Employees (all staff users) list — search / sort / paginate / delete, all no-refresh.
 */
class EmployeeList extends Component
{
    use WithPagination;

    protected $paginationTheme = 'bootstrap';

    public string $search = '';
    public string $sortField = 'name';
    public string $sortDirection = 'asc';
    public int $perPage = 10;

    protected $queryString = [
        'search' => ['except' => ''],
        'sortField' => ['except' => 'name'],
        'sortDirection' => ['except' => 'asc'],
    ];

    public array $roleLabels = [
        '0' => 'Reception',
        '1' => 'Doctor',
        '2' => 'Labratorist',
        '3' => 'Pharmacist',
        '4' => 'Manager',
    ];

    public function updatingSearch()
    {
        $this->resetPage();
    }

    public function sortBy(string $field): void
    {
        if ($this->sortField === $field) {
            $this->sortDirection = $this->sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            $this->sortField = $field;
            $this->sortDirection = 'asc';
        }
    }

    public function delete($id): void
    {
        if (Auth::user()->role !== '4') {
            $this->dispatchBrowserEvent('notify', ['type' => 'error', 'message' => 'Not authorised.']);
            return;
        }

        $emp = User::find($id);
        if (! $emp) {
            $this->dispatchBrowserEvent('notify', ['type' => 'error', 'message' => 'Record not found.']);
            return;
        }

        $name = $emp->name;
        $emp->delete();

        $this->dispatchBrowserEvent('notify', ['type' => 'success', 'message' => "Removed {$name}."]);
    }

    public function render()
    {
        $employees = User::query()
            ->when($this->search !== '', function ($q) {
                $term = '%' . $this->search . '%';
                $q->where(function ($w) use ($term) {
                    $w->where('name', 'like', $term)
                        ->orWhere('email', 'like', $term)
                        ->orWhere('phone', 'like', $term);
                });
            })
            ->orderBy($this->sortField, $this->sortDirection)
            ->paginate($this->perPage);

        return view('livewire.employees.employee-list', ['employees' => $employees]);
    }
}
