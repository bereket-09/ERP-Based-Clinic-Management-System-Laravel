<?php

namespace App\Http\Livewire\Patients;

use App\Models\Patient;
use Illuminate\Support\Facades\Auth;
use Livewire\Component;
use Livewire\WithPagination;

/**
 * All-patients list (PatientController@all_patients).
 *
 * Live search + sortable columns + pagination, all without a page refresh.
 * Delete maps to the existing GET /deletePatient/{id} action.
 */
class PatientList extends Component
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
        // Reception manages patient records.
        if (! in_array(Auth::user()->role, ['0', '4'], true)) {
            $this->dispatchBrowserEvent('notify', ['type' => 'error', 'message' => 'Not authorised.']);
            return;
        }

        $patient = Patient::find($id);
        if (! $patient) {
            $this->dispatchBrowserEvent('notify', ['type' => 'error', 'message' => 'Record not found.']);
            return;
        }

        $name = $patient->name;
        $patient->delete();

        $this->dispatchBrowserEvent('notify', ['type' => 'success', 'message' => "Removed {$name}."]);
    }

    public function render()
    {
        $patients = Patient::query()
            ->when($this->search !== '', function ($q) {
                $term = '%' . $this->search . '%';
                $q->where(function ($w) use ($term) {
                    $w->where('name', 'like', $term)
                        ->orWhere('stud_id', 'like', $term)
                        ->orWhere('mrn', 'like', $term)
                        ->orWhere('dept', 'like', $term)
                        ->orWhere('phone', 'like', $term);
                });
            })
            ->orderBy($this->sortField, $this->sortDirection)
            ->paginate($this->perPage);

        return view('livewire.patients.patient-list', ['patients' => $patients]);
    }
}
