<?php

namespace App\Http\Livewire\Leave;

use App\Models\User;
use App\Models\WorkLeave;
use Livewire\Component;
use Livewire\WithPagination;

/**
 * Admin list of all staff leave requests (WorkLeave).
 *
 *   @livewire('leave.leave-requests')
 */
class LeaveRequests extends Component
{
    use WithPagination;

    protected $paginationTheme = 'bootstrap';

    public string $search = '';
    public string $sortField = 'id';
    public string $sortDirection = 'desc';
    public int $perPage = 10;

    protected $queryString = [
        'search' => ['except' => ''],
        'sortField' => ['except' => 'id'],
        'sortDirection' => ['except' => 'desc'],
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

    public function render()
    {
        $users = User::all()->keyBy('id');

        $leaves = WorkLeave::query()
            ->when($this->search !== '', function ($q) use ($users) {
                $userIds = $users->filter(fn ($u) => stripos($u->name, $this->search) !== false)->keys()->all();
                $q->where(function ($w) use ($userIds) {
                    $w->where('status', 'like', '%' . $this->search . '%')
                        ->orWhere('desc', 'like', '%' . $this->search . '%')
                        ->orWhereIn('u_id', $userIds ?: [0]);
                });
            })
            ->orderBy($this->sortField, $this->sortDirection)
            ->paginate($this->perPage);

        return view('livewire.leave.leave-requests', [
            'leaves' => $leaves,
            'users' => $users,
        ]);
    }
}
