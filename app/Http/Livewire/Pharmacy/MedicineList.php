<?php

namespace App\Http\Livewire\Pharmacy;

use App\Models\Medcine;
use App\Models\Medcine_Name;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;
use Livewire\Component;
use Livewire\WithPagination;

/**
 * Reusable medicine list for the pharmacy module.
 *
 * The `filter` prop mirrors MedicineController query logic:
 *   - 'all'      -> Medcine::all()            (full drug record, mixed columns)
 *   - 'expired'  -> Medcine where expdate < now
 *   - 'instock'  -> Medcine_Name where total > 0
 *   - 'outstock' -> Medcine_Name where total <= 0
 *
 * @livewire('pharmacy.medicine-list', ['filter' => 'all', 'title' => 'All Medicines'])
 */
class MedicineList extends Component
{
    use WithPagination;

    protected $paginationTheme = 'bootstrap';

    public string $filter = 'all';
    public string $title = 'All Medicines';
    public string $search = '';
    public string $sortField = 'id';
    public string $sortDirection = 'desc';
    public int $perPage = 12;

    protected $queryString = [
        'search' => ['except' => ''],
        'sortField' => ['except' => 'id'],
        'sortDirection' => ['except' => 'desc'],
    ];

    public function updatingSearch(): void
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

    /** Catalogue filters (instock/outstock) operate on Medcine_Name, not Medcine. */
    public function isCatalogue(): bool
    {
        return in_array($this->filter, ['instock', 'outstock'], true);
    }

    public function delete($id): void
    {
        if (Auth::user()->role !== '3') {
            $this->dispatchBrowserEvent('notify', ['type' => 'error', 'message' => 'Not authorised.']);
            return;
        }

        $data = Medcine::find($id);
        if (! $data) {
            $this->dispatchBrowserEvent('notify', ['type' => 'error', 'message' => 'Record not found.']);
            return;
        }

        // mirror MedicineController@delete_Medicine: decrement the catalogue total
        $in = Medcine_Name::where('m_name', $data->name)->first();
        if ($in) {
            $in->total = $in->total - $data->qty;
            $in->save();
        }

        $name = $data->name;
        $data->delete();

        $this->dispatchBrowserEvent('notify', ['type' => 'success', 'message' => "Removed {$name}."]);
    }

    public function render()
    {
        $now = Carbon::now();

        if ($this->isCatalogue()) {
            $query = Medcine_Name::query()
                ->when($this->filter === 'instock', fn ($q) => $q->where('total', '>', 0))
                ->when($this->filter === 'outstock', fn ($q) => $q->where('total', '<=', 0))
                ->when($this->search !== '', fn ($q) => $q->where('m_name', 'like', '%' . $this->search . '%'));

            // sort field 'name' maps to the catalogue column m_name
            $sort = $this->sortField === 'name' ? 'm_name' : $this->sortField;
            $sort = in_array($sort, ['id', 'm_name', 'total'], true) ? $sort : 'id';
            $query->orderBy($sort, $this->sortDirection);
        } else {
            $query = Medcine::query()
                ->when($this->filter === 'expired', fn ($q) => $q->where('expdate', '<', $now)->where('qty', '>', 0))
                ->when($this->search !== '', function ($q) {
                    $term = '%' . $this->search . '%';
                    $q->where(function ($w) use ($term) {
                        $w->where('name', 'like', $term)
                            ->orWhere('manufactor', 'like', $term)
                            ->orWhere('catagory', 'like', $term)
                            ->orWhere('bno', 'like', $term)
                            ->orWhere('reciptNo', 'like', $term);
                    });
                });

            $sort = in_array($this->sortField, ['id', 'name', 'qty', 'price', 'expdate', 'manufactor', 'catagory', 'status'], true)
                ? $this->sortField : 'id';
            $query->orderBy($sort, $this->sortDirection);
        }

        return view('livewire.pharmacy.medicine-list', [
            'rows' => $query->paginate($this->perPage),
            'now' => $now,
        ]);
    }
}
