<div>
    @php($pill = $status === 'Completed' ? 'is-completed' : ($status === 'Pending' ? 'is-pending' : 'is-queued'))

    <div class="page-head">
        <div>
            <h4 class="page-title">{{ $title }}</h4>
            <div class="page-sub">{{ $visits->total() }} visit{{ $visits->total() === 1 ? '' : 's' }}</div>
        </div>
        @if (Auth::user()->role == '0')
            <a href="/search_patient" class="btn btn-primary btn-rounded">
                <i class="fa fa-plus"></i> Add new visit
            </a>
        @endif
    </div>

    {{-- Toolbar: live search --}}
    <div class="list-toolbar">
        <div class="search-box">
            <i class="fa fa-search"></i>
            <input type="text" class="form-control" placeholder="Search by name, ID or MRN…"
                wire:model.debounce.350ms="search">
        </div>
        <span wire:loading.delay class="text-muted-2"><span class="lw-spinner spinner-ink"></span> Searching…</span>
    </div>

    <div class="table-responsive table-card visit-table" wire:loading.class="lw-overlay">
        <table class="table table-hover mb-0">
            <thead>
                <tr>
                    <th>Patient</th>
                    <th>MRN</th>
                    <th>Department</th>
                    <th>Year</th>
                    <th>Doctor</th>
                    <th>Status</th>
                    <th class="text-right">Action</th>
                </tr>
            </thead>
            <tbody>
                @forelse ($visits as $visit)
                    @php($patient = $patients[$visit->p_id] ?? null)
                    @if ($patient)
                        @php($initials = Str::upper(Str::substr($patient->name ?? '?', 0, 1) . Str::substr(Str::after($patient->name ?? '', ' '), 0, 1)))
                        @php($docName = optional($doctors[$visit->doc_id] ?? null)->name)
                        <tr wire:key="visit-{{ $visit->id }}" class="visit-row">
                            <td>
                                <div class="d-flex align-items-center" style="gap:12px;">
                                    <span class="avatar-initials">{{ $initials ?: '?' }}</span>
                                    <div style="min-width:0;">
                                        <div class="visit-name">{{ $patient->name }}</div>
                                        <div class="visit-id text-muted-2 tnum">ID {{ $patient->stud_id ?: '—' }} · {{ $patient->gender ?: '—' }}</div>
                                    </div>
                                </div>
                            </td>
                            <td class="tnum">{{ $patient->mrn ?: '—' }}</td>
                            <td>{{ $patient->dept ?: '—' }}</td>
                            <td class="tnum">{{ $patient->year ?: '—' }}</td>
                            <td>
                                @if ($docName)
                                    <span class="doctor-tag"><i class="fa fa-user-md"></i> {{ $docName }}</span>
                                @else
                                    <span class="text-muted-2">Unassigned</span>
                                @endif
                            </td>
                            <td><span class="status-pill {{ $pill }}">{{ $visit->statues }}</span></td>
                            <td class="text-right">
                                @if ($isDoctor)
                                    <a href="/treat/{{ $visit->id }}" class="btn btn-sm {{ $status === 'Completed' ? 'btn-light-soft' : 'btn-primary' }}">
                                        <i class="fa fa-stethoscope"></i> {{ $status === 'Completed' ? 'Review' : 'Take up' }}
                                    </a>
                                @else
                                    <a href="{{ url('/searchPatient') }}?stud_id={{ urlencode($patient->stud_id) }}" class="btn btn-sm btn-light-soft">
                                        <i class="fa fa-folder-open-o"></i> View record
                                    </a>
                                @endif
                            </td>
                        </tr>
                    @endif
                @empty
                    <tr>
                        <td colspan="7">
                            <div class="empty-state">
                                <div class="empty-icon"><i class="fa fa-stethoscope"></i></div>
                                <h5>No {{ Str::lower($title) }}</h5>
                                <p>{{ trim($search) === '' ? 'There are no ' . Str::lower($status) . ' visits right now.' : 'Try a different search term.' }}</p>
                            </div>
                        </td>
                    </tr>
                @endforelse
            </tbody>
        </table>
    </div>

    <div class="mt-3">
        {{ $visits->links() }}
    </div>

    @push('styles')
        <style>
            .tnum { font-variant-numeric: tabular-nums; }
            .visit-table .visit-name { font-weight: 700; color: var(--c-ink); line-height: 1.2; }
            .visit-table .visit-id { font-size: 12px; margin-top: 2px; }
            .visit-table .avatar-initials { flex: 0 0 auto; }
            .doctor-tag { display: inline-flex; align-items: center; gap: 7px; font-weight: 700; font-size: 13px; color: var(--c-ink-soft); }
            .doctor-tag i { color: var(--c-primary); }
            .visit-row { animation: fadeIn .3s var(--ease) both; }
            .visit-row:nth-child(1) { animation-delay: .02s; }
            .visit-row:nth-child(2) { animation-delay: .05s; }
            .visit-row:nth-child(3) { animation-delay: .08s; }
            .visit-row:nth-child(4) { animation-delay: .11s; }
            .visit-row:nth-child(5) { animation-delay: .14s; }
            .visit-row:nth-child(6) { animation-delay: .17s; }
            .visit-row:nth-child(7) { animation-delay: .20s; }
            .visit-row:nth-child(8) { animation-delay: .23s; }
            .visit-row:nth-child(9) { animation-delay: .26s; }
            .visit-row:nth-child(10) { animation-delay: .29s; }
        </style>
    @endpush
</div>
