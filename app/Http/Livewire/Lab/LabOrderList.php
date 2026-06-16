<?php

namespace App\Http\Livewire\Lab;

use App\Models\LabOrder;
use App\Models\Patient;
use App\Models\User;
use App\Models\Visit;
use Livewire\Component;
use Livewire\WithPagination;

/**
 * Lab order list — parameterised by status so it serves all three lab screens:
 *   - Queued     => "Ordered" tests waiting to be started
 *   - Pending    => results saved, awaiting submission to the doctor
 *   - Completed  => finished tests
 *
 * Mirrors LabtestController@view_lab_order / @view_pending_lab_results / @view_completed_lab_results.
 *
 *   @livewire('lab.lab-order-list', ['status' => 'Queued',    'title' => 'Ordered Lab Tests',  'actionLabel' => 'Start test'])
 *   @livewire('lab.lab-order-list', ['status' => 'Pending',   'title' => 'Pending Lab Results','actionLabel' => 'Edit results'])
 *   @livewire('lab.lab-order-list', ['status' => 'Completed', 'title' => 'Completed Lab Tests','actionLabel' => 'Edit results'])
 */
class LabOrderList extends Component
{
    use WithPagination;

    protected $paginationTheme = 'bootstrap';

    public string $status = 'Queued';
    public string $title = 'Lab Orders';
    public string $actionLabel = 'Open';
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
        // Lookup maps so we can show patient + doctor names without N+1 per row.
        $visits = Visit::all()->keyBy('id');
        $patients = Patient::all()->keyBy('id');
        $doctors = User::where('role', '1')->get()->keyBy('id');

        $term = trim($this->search);

        $rows = LabOrder::query()
            ->where('status', $this->status)
            ->when($term !== '', function ($q) use ($term, $visits, $patients) {
                // Resolve which order ids match the patient/MRN/student-id search.
                $matchIds = $visits->filter(function ($visit) use ($term, $patients) {
                    $patient = $patients->get($visit->p_id);
                    if (! $patient) {
                        return false;
                    }
                    $needle = mb_strtolower($term);

                    return str_contains(mb_strtolower((string) $patient->name), $needle)
                        || str_contains(mb_strtolower((string) $patient->mrn), $needle)
                        || str_contains(mb_strtolower((string) $patient->stud_id), $needle);
                })->keys();

                $q->where(function ($w) use ($term, $matchIds) {
                    $w->where('id', 'like', '%' . $term . '%')
                        ->orWhereIn('v_id', $matchIds);
                });
            })
            ->orderBy($this->sortField, $this->sortDirection)
            ->paginate($this->perPage);

        return view('livewire.lab.lab-order-list', [
            'rows' => $rows,
            'visits' => $visits,
            'patients' => $patients,
            'doctors' => $doctors,
        ]);
    }
}
