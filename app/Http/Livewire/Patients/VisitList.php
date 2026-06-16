<?php

namespace App\Http\Livewire\Patients;

use App\Models\Patient;
use App\Models\User;
use App\Models\Visit;
use Illuminate\Support\Facades\Auth;
use Livewire\Component;
use Livewire\WithPagination;

/**
 * Reusable visit list parameterised by status.
 *
 * Replaces PatientController@queued_patients / @pending_patients_list /
 * @completed_visits views. Doctors (role 1) only see visits assigned to them;
 * everyone else sees every visit with that status.
 *
 *   @livewire('patients.visit-list', ['status' => 'Queued', 'title' => 'Queued Patients'])
 */
class VisitList extends Component
{
    use WithPagination;

    protected $paginationTheme = 'bootstrap';

    public string $status = 'Queued';
    public string $title = 'Visits';
    public string $search = '';
    public int $perPage = 10;

    protected $queryString = [
        'search' => ['except' => ''],
    ];

    public function updatingSearch()
    {
        $this->resetPage();
    }

    public function render()
    {
        $isDoctor = Auth::user()->role === '1';

        $visits = Visit::query()
            ->where('statues', $this->status)
            ->when($isDoctor, fn ($q) => $q->where('doc_id', Auth::user()->id))
            ->when($this->search !== '', function ($q) {
                $term = '%' . $this->search . '%';
                $ids = Patient::query()
                    ->where(function ($w) use ($term) {
                        $w->where('name', 'like', $term)
                            ->orWhere('stud_id', 'like', $term)
                            ->orWhere('mrn', 'like', $term);
                    })
                    ->pluck('id');
                $q->whereIn('p_id', $ids);
            })
            ->orderByDesc('id')
            ->paginate($this->perPage);

        // Build lookup maps so the view stays clean (no nested queries in Blade).
        $patientIds = $visits->pluck('p_id')->unique()->all();
        $patients = Patient::whereIn('id', $patientIds)->get()->keyBy('id');

        $doctors = User::where('role', '1')->get()->keyBy('id');

        return view('livewire.patients.visit-list', [
            'visits' => $visits,
            'patients' => $patients,
            'doctors' => $doctors,
            'isDoctor' => $isDoctor,
        ]);
    }
}
