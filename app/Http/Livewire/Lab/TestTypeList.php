<?php

namespace App\Http\Livewire\Lab;

use App\Models\Labtest;
use Livewire\Component;
use Livewire\WithPagination;

/**
 * Lab test-type list (LabtestController@view_lab_test).
 *
 * Live search + sortable columns + pagination + delete, all without a page refresh.
 * Edit maps to the existing GET /edit_tests/{id} action.
 */
class TestTypeList extends Component
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
        $test = Labtest::find($id);
        if (! $test) {
            $this->dispatchBrowserEvent('notify', ['type' => 'error', 'message' => 'Record not found.']);
            return;
        }

        $name = $test->name;
        $test->delete();

        $this->dispatchBrowserEvent('notify', ['type' => 'success', 'message' => "Removed {$name}."]);
    }

    public function render()
    {
        $tests = Labtest::query()
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

        return view('livewire.lab.test-type-list', ['tests' => $tests]);
    }
}
