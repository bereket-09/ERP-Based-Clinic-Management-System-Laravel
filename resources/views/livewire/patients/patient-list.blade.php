<div>
    <div class="page-head">
        <div>
            <h4 class="page-title">All patients</h4>
            <div class="page-sub">{{ $patients->total() }} patient{{ $patients->total() === 1 ? '' : 's' }} registered</div>
        </div>
        @if (Auth::user()->role == '0')
            <a href="/search_patient" class="btn btn-primary btn-rounded">
                <i class="fa fa-plus"></i> Add patient
            </a>
        @endif
    </div>

    {{-- Toolbar: live search --}}
    <div class="list-toolbar">
        <div class="search-box">
            <i class="fa fa-search"></i>
            <input type="text" class="form-control" placeholder="Search by name, ID, MRN, dept, phone…"
                wire:model.debounce.350ms="search">
        </div>
        <span wire:loading.delay class="text-muted-2"><span class="lw-spinner spinner-ink"></span> Searching…</span>
    </div>

    <div class="table-responsive table-card patient-table" wire:loading.class="lw-overlay">
        <table class="table table-hover mb-0">
            <thead>
                <tr>
                    <th class="sortable {{ $sortField === 'name' ? 'active' : '' }}" wire:click="sortBy('name')">
                        Patient <span class="sort-ind"><i class="fa fa-sort{{ $sortField === 'name' ? ($sortDirection === 'asc' ? '-asc' : '-desc') : '' }}"></i></span>
                    </th>
                    <th class="sortable {{ $sortField === 'mrn' ? 'active' : '' }}" wire:click="sortBy('mrn')">
                        MRN <span class="sort-ind"><i class="fa fa-sort{{ $sortField === 'mrn' ? ($sortDirection === 'asc' ? '-asc' : '-desc') : '' }}"></i></span>
                    </th>
                    <th>Gender</th>
                    <th class="sortable {{ $sortField === 'dept' ? 'active' : '' }}" wire:click="sortBy('dept')">
                        Department <span class="sort-ind"><i class="fa fa-sort{{ $sortField === 'dept' ? ($sortDirection === 'asc' ? '-asc' : '-desc') : '' }}"></i></span>
                    </th>
                    <th>Phone</th>
                    <th class="text-right">Action</th>
                </tr>
            </thead>
            <tbody>
                @forelse ($patients as $patient)
                    @php($initials = Str::upper(Str::substr($patient->name ?? '?', 0, 1) . Str::substr(Str::after($patient->name ?? '', ' '), 0, 1)))
                    @php($g = Str::lower($patient->gender ?? ''))
                    <tr wire:key="patient-{{ $patient->id }}" class="patient-row">
                        <td>
                            <div class="d-flex align-items-center" style="gap:12px;">
                                <span class="avatar-initials">{{ $initials ?: '?' }}</span>
                                <div style="min-width:0;">
                                    <div class="patient-name">{{ $patient->name }}</div>
                                    <div class="patient-id text-muted-2 tnum">ID {{ $patient->stud_id ?: '—' }}</div>
                                </div>
                            </div>
                        </td>
                        <td class="tnum">{{ $patient->mrn ?: '—' }}</td>
                        <td>
                            <span class="gender-tag {{ $g === 'male' ? 'is-male' : ($g === 'female' ? 'is-female' : '') }}">
                                <i class="fa fa-{{ $g === 'female' ? 'venus' : 'mars' }}"></i> {{ $patient->gender ?: '—' }}
                            </span>
                        </td>
                        <td>{{ $patient->dept ?: '—' }}</td>
                        <td class="tnum">{{ $patient->phone ?: '—' }}</td>
                        <td class="text-right">
                            <div class="dropdown dropdown-action">
                                <a href="#" class="action-icon dropdown-toggle" data-toggle="dropdown" aria-expanded="false"><i class="fa fa-ellipsis-v"></i></a>
                                <div class="dropdown-menu dropdown-menu-right">
                                    <a class="dropdown-item" href="{{ url('/searchPatient') }}?stud_id={{ urlencode($patient->stud_id) }}"><i class="fa fa-stethoscope m-r-5"></i> Add visit</a>
                                    @if (in_array(Auth::user()->role, ['0', '4']))
                                        <a class="dropdown-item text-danger" href="#"
                                            onclick="event.preventDefault(); clinicConfirm({title:'Delete {{ addslashes($patient->name) }}?', text:'This patient record will be permanently removed.', component:@this, method:'delete', params:[{{ $patient->id }}]})">
                                            <i class="fa fa-trash-o m-r-5"></i> Delete
                                        </a>
                                    @endif
                                </div>
                            </div>
                        </td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="6">
                            <div class="empty-state">
                                <div class="empty-icon"><i class="fa fa-wheelchair"></i></div>
                                <h5>No patients found</h5>
                                <p>{{ trim($search) === '' ? 'No patients have been registered yet.' : 'Try a different search term.' }}</p>
                            </div>
                        </td>
                    </tr>
                @endforelse
            </tbody>
        </table>
    </div>

    <div class="mt-3">
        {{ $patients->links() }}
    </div>

    @push('styles')
        <style>
            .tnum { font-variant-numeric: tabular-nums; }
            .patient-table .patient-name { font-weight: 700; color: var(--c-ink); line-height: 1.2; }
            .patient-table .patient-id { font-size: 12px; margin-top: 2px; }
            .patient-table .avatar-initials { flex: 0 0 auto; }
            .patient-row { animation: fadeIn .3s var(--ease) both; }
            .patient-row:nth-child(1) { animation-delay: .02s; }
            .patient-row:nth-child(2) { animation-delay: .05s; }
            .patient-row:nth-child(3) { animation-delay: .08s; }
            .patient-row:nth-child(4) { animation-delay: .11s; }
            .patient-row:nth-child(5) { animation-delay: .14s; }
            .patient-row:nth-child(6) { animation-delay: .17s; }
            .patient-row:nth-child(7) { animation-delay: .20s; }
            .patient-row:nth-child(8) { animation-delay: .23s; }
            .patient-row:nth-child(9) { animation-delay: .26s; }
            .patient-row:nth-child(10) { animation-delay: .29s; }
            .gender-tag {
                display: inline-flex; align-items: center; gap: 6px;
                font-size: 12.5px; font-weight: 700; color: var(--c-ink-soft);
            }
            .gender-tag.is-male { color: #1f6fb2; }
            .gender-tag.is-female { color: #b5468c; }
        </style>
    @endpush
</div>
