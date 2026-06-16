<?php

namespace App\Http\Livewire\Staff;

use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Livewire\Component;
use Livewire\WithPagination;

/**
 * REFERENCE COMPONENT — copy this structure for any "list" screen.
 *
 * Features (all WITHOUT a page refresh):
 *   - live search (debounced)         - resets paginator on change
 *   - clickable sortable columns
 *   - pagination (Bootstrap theme)
 *   - delete via SweetAlert confirm -> toast feedback
 *
 * Mount with a role to reuse for Doctors(1) / Labratorists(2) / Pharmacists(3):
 *   @livewire('staff.staff-list', ['role' => '1', 'title' => 'Doctors'])
 */
class StaffList extends Component
{
    use WithPagination;

    protected $paginationTheme = 'bootstrap';

    public string $role = '1';
    public string $title = 'Doctors';
    public string $search = '';
    public string $sortField = 'name';
    public string $sortDirection = 'asc';
    public int $perPage = 9;

    // keep search/sort in the URL so state survives a hard refresh / share
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
        // only a manager may delete staff
        if (Auth::user()->role !== '4') {
            $this->dispatchBrowserEvent('notify', ['type' => 'error', 'message' => 'Not authorised.']);
            return;
        }

        $user = User::find($id);
        if (! $user) {
            $this->dispatchBrowserEvent('notify', ['type' => 'error', 'message' => 'Record not found.']);
            return;
        }

        $name = $user->name;
        $user->delete();

        $this->dispatchBrowserEvent('notify', ['type' => 'success', 'message' => "Removed {$name}."]);
    }

    public function render()
    {
        $staff = User::query()
            ->where('role', $this->role)
            ->when($this->search !== '', function ($q) {
                $term = '%' . $this->search . '%';
                $q->where(function ($w) use ($term) {
                    $w->where('name', 'like', $term)
                        ->orWhere('email', 'like', $term)
                        ->orWhere('speciality', 'like', $term)
                        ->orWhere('phone', 'like', $term);
                });
            })
            ->orderBy($this->sortField, $this->sortDirection)
            ->paginate($this->perPage);

        return view('livewire.staff.staff-list', ['staff' => $staff]);
    }
}
