<?php

namespace App\Http\Livewire\Patients;

use App\Models\Patient;
use Livewire\Component;

/**
 * Live patient lookup for Reception.
 *
 * Mirrors PatientController@search_patient / @searchPatient: the receptionist
 * looks a patient up by Student ID / MRN / name. Selecting a match continues the
 * existing flow by hitting GET /searchPatient?stud_id=..., which either opens the
 * "add new visit" screen (patient exists) or the registration form (new patient).
 */
class PatientSearch extends Component
{
    public string $search = '';

    public function render()
    {
        $matches = collect();

        if (trim($this->search) !== '') {
            $term = '%' . $this->search . '%';
            $matches = Patient::query()
                ->where(function ($q) use ($term) {
                    $q->where('stud_id', 'like', $term)
                        ->orWhere('mrn', 'like', $term)
                        ->orWhere('name', 'like', $term);
                })
                ->orderBy('name')
                ->limit(15)
                ->get();
        }

        return view('livewire.patients.patient-search', ['matches' => $matches]);
    }
}
