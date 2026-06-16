<?php

namespace App\Http\Livewire\Departments;

use App\Models\Departement;
use Illuminate\Support\Facades\Auth;
use Livewire\Component;
use Livewire\WithPagination;

/**
 * Departments list — search / sort / paginate / delete, all no-refresh.
 */
class DepartmentList extends Component
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

        $dept = Departement::find($id);
        if (! $dept) {
            $this->dispatchBrowserEvent('notify', ['type' => 'error', 'message' => 'Record not found.']);
            return;
        }

        $name = $dept->name;
        $dept->delete();

        $this->dispatchBrowserEvent('notify', ['type' => 'success', 'message' => "Removed {$name}."]);
    }

    public function render()
    {
        $departments = Departement::query()
            ->when($this->search !== '', function ($q) {
                $term = '%' . $this->search . '%';
                $q->where(function ($w) use ($term) {
                    $w->where('name', 'like', $term)
                        ->orWhere('desc', 'like', $term)
                        ->orWhere('status', 'like', $term);
                });
            })
            ->orderBy($this->sortField, $this->sortDirection)
            ->paginate($this->perPage);

        return view('livewire.departments.department-list', ['departments' => $departments]);
    }
}
