@extends('layouts.portal')

@section('title', 'Pending Patients')

@section('content')
    <div class="page-head">
        <div>
            <h4 class="page-title">Pending Patients</h4>
            <div class="page-sub">Patients awaiting results review</div>
        </div>
        @if (Auth::user()->role == '0')
            <a href="/search_patient" class="btn btn-primary btn-rounded">
                <i class="fa fa-plus"></i> Add new Visit
            </a>
        @endif
    </div>

    <div class="card table-card">
        <div class="table-responsive">
            <table class="table table-striped custom-table mb-0" id="myTables">
                <thead>
                    <tr>
                        <th>Student ID</th>
                        <th>MRN</th>
                        <th>Full Name</th>
                        <th>Gender</th>
                        <th>Department</th>
                        <th>Year</th>
                        <th>Doctor Name</th>
                        <th>Status</th>
                        <th class="text-right">Action</th>
                    </tr>
                </thead>
                <tbody>
                    @php $shown = 0; @endphp
                    @foreach ($visit as $visits)
                        @if ($visits->statues == 'Pending')
                            @foreach ($patient as $patients)
                                @php
                                    $isDoctor = Auth::user()->role == '1';
                                    $matches = $patients->id == $visits->p_id
                                        && (! $isDoctor || Auth::user()->id == $visits->doc_id);
                                @endphp
                                @if ($matches)
                                    @php $shown++; @endphp
                                    <tr wire:key="visit-{{ $visits->id }}">
                                        <td>{{ $patients->stud_id }}</td>
                                        <td>{{ $patients->mrn }}</td>
                                        <td>{{ $patients->name }}</td>
                                        <td>{{ $patients->gender }}</td>
                                        <td>{{ $patients->dept }}</td>
                                        <td>{{ $patients->year }}</td>
                                        <td>
                                            @foreach ($doctors as $doctor)
                                                @if ($visits->doc_id == $doctor->id)
                                                    {{ $doctor->name }}
                                                @endif
                                            @endforeach
                                        </td>
                                        <td><span class="status-pill is-pending">{{ $visits->statues }} Results</span></td>
                                        <td class="text-right">
                                            @if ($isDoctor)
                                                <a href="/treat/{{ $visits->id }}"
                                                    class="btn btn-outline-primary take-btn">Take up</a>
                                            @else
                                                <a href="{{ url('/searchPatient') }}?stud_id={{ urlencode($patients->stud_id) }}"
                                                    class="btn btn-light-soft btn-sm"><i class="fa fa-folder-open-o"></i> View record</a>
                                            @endif
                                        </td>
                                    </tr>
                                @endif
                            @endforeach
                        @endif
                    @endforeach

                    @if ($shown === 0)
                        <tr>
                            <td colspan="9">
                                <div class="empty-state">
                                    <div class="empty-icon"><i class="fa fa-wheelchair"></i></div>
                                    <h5>No pending patients</h5>
                                    <p>There are no patients awaiting results right now.</p>
                                </div>
                            </td>
                        </tr>
                    @endif
                </tbody>
            </table>
        </div>
    </div>
@endsection
