<?php

namespace App\Http\Livewire\Property;

use App\Models\Items_total;
use Livewire\Component;
use Livewire\WithPagination;

/**
 * Stock list of all properties (Items_total).
 *
 *   @livewire('property.property-list', ['title' => 'All Property'])
 */
class PropertyList extends Component
{
    use WithPagination;

    protected $paginationTheme = 'bootstrap';

    public string $title = 'All Property';
    public string $search = '';
    public string $sortField = 'item_name';
    public string $sortDirection = 'asc';
    public int $perPage = 10;

    protected $queryString = [
        'search' => ['except' => ''],
        'sortField' => ['except' => 'item_name'],
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

    public function render()
    {
        $items = Items_total::query()
            ->when($this->search !== '', function ($q) {
                $q->where('item_name', 'like', '%' . $this->search . '%');
            })
            ->orderBy($this->sortField, $this->sortDirection)
            ->paginate($this->perPage);

        return view('livewire.property.property-list', ['items' => $items]);
    }
}
