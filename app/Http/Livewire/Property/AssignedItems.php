<?php

namespace App\Http\Livewire\Property;

use App\Models\ItemAssign;
use App\Models\Items_total;
use App\Models\User;
use Livewire\Component;
use Livewire\WithPagination;

/**
 * All items assigned to staff members (ItemAssign), with employee + item names.
 *
 *   @livewire('property.assigned-items')
 */
class AssignedItems extends Component
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
        $items = Items_total::all()->keyBy('id');

        $assigns = ItemAssign::query()
            ->when($this->search !== '', function ($q) use ($users, $items) {
                $userIds = $users->filter(fn ($u) => stripos($u->name, $this->search) !== false)->keys()->all();
                $itemIds = $items->filter(fn ($i) => stripos($i->item_name, $this->search) !== false)->keys()->all();
                $q->where(function ($w) use ($userIds, $itemIds) {
                    $w->where('status', 'like', '%' . $this->search . '%')
                        ->orWhereIn('u_id', $userIds ?: [0])
                        ->orWhereIn('i_id', $itemIds ?: [0]);
                });
            })
            ->orderBy($this->sortField, $this->sortDirection)
            ->paginate($this->perPage);

        return view('livewire.property.assigned-items', [
            'assigns' => $assigns,
            'users' => $users,
            'items' => $items,
        ]);
    }
}
