@extends('layouts.portal')

@section('title', 'Patient Visits')

@push('styles')
<style>
    /* scoped: patient found / add visit */
    .av-wrap { max-width: 1120px; margin: 0 auto; }
    .av-hero {
        display: flex; align-items: center; gap: 20px; flex-wrap: wrap;
        background: linear-gradient(135deg, var(--c-primary-50), #ffffff 60%);
        border: 1px solid var(--c-primary-100);
        border-radius: var(--radius);
        box-shadow: 0 14px 40px rgba(22, 160, 133, .10);
        padding: 24px 28px;
        margin-bottom: 22px;
        animation: avIn .32s var(--ease) both;
    }
    .av-hero .avatar-initials { width: 66px; height: 66px; min-width: 66px; font-size: 22px; box-shadow: var(--shadow-sm); }
    .av-hero .av-id { flex: 1; min-width: 220px; }
    .av-hero .av-found {
        text-transform: uppercase; letter-spacing: .14em; font-size: 11px;
        font-weight: 800; color: var(--c-primary-700);
        display: inline-flex; align-items: center; gap: 7px;
    }
    .av-hero h3 { font-weight: 800; color: var(--c-ink); margin: 5px 0 10px; letter-spacing: -.015em; }
    .av-chips { display: flex; gap: 8px; flex-wrap: wrap; }
    .av-chip {
        display: inline-flex; align-items: center; gap: 6px;
        background: #fff; border: 1px solid var(--c-border);
        border-radius: var(--radius-pill); padding: 4px 12px;
        font-size: 12px; font-weight: 700; color: var(--c-ink-soft);
    }
    .av-chip i { color: var(--c-primary); font-size: 11px; }
    .av-chip .tnum { font-variant-numeric: tabular-nums; letter-spacing: .01em; }

    .av-section-title { font-weight: 800; color: var(--c-ink); display: flex; align-items: center; gap: 9px; }
    .av-section-title i { color: var(--c-primary); }

    .av-timeline { list-style: none; margin: 0; padding: 6px 0 2px; }
    .av-titem { position: relative; padding: 0 0 18px 30px; }
    .av-titem::before {
        content: ""; position: absolute; left: 8px; top: 4px; bottom: -4px;
        width: 2px; background: var(--c-border);
    }
    .av-titem:last-child::before { display: none; }
    .av-titem .av-dot {
        position: absolute; left: 2px; top: 3px;
        width: 14px; height: 14px; border-radius: 50%;
        background: #fff; border: 3px solid var(--c-primary-300);
        box-shadow: 0 0 0 3px var(--c-surface);
    }
    .av-titem.is-completed .av-dot { border-color: var(--c-primary); }
    .av-titem.is-pending .av-dot { border-color: var(--c-info); }
    .av-titem.is-queued .av-dot { border-color: var(--c-warning); }

    .table .tnum { font-variant-numeric: tabular-nums; }

    /* summary strip */
    .av-strip {
        display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px;
        margin-bottom: 18px;
    }
    .av-stat {
        background: #fff; border: 1px solid var(--c-border);
        border-radius: var(--radius); padding: 14px 16px;
        box-shadow: var(--shadow-sm);
    }
    .av-stat .av-stat-label {
        text-transform: uppercase; letter-spacing: .1em; font-size: 10px;
        font-weight: 800; color: var(--c-ink-soft); margin-bottom: 4px;
    }
    .av-stat .av-stat-value {
        font-size: 18px; font-weight: 800; color: var(--c-ink);
        letter-spacing: -.01em; line-height: 1.25;
    }
    .av-stat .av-stat-value.is-tnum { font-variant-numeric: tabular-nums; }
    .av-stat .av-stat-sub { font-size: 12px; color: var(--c-ink-soft); font-weight: 600; }
    @media (max-width: 575px) { .av-strip { grid-template-columns: 1fr; } }

    /* expandable visit rows */
    .av-row-toggle { cursor: pointer; }
    .av-row-toggle td:first-child { position: relative; }
    .av-caret { transition: transform .18s var(--ease); display: inline-block; color: var(--c-primary); margin-right: 6px; }
    .av-row-toggle[aria-expanded="true"] .av-caret { transform: rotate(90deg); }
    .av-detail-cell { background: var(--c-surface); padding: 0 !important; border-top: 0 !important; }
    .av-detail-inner { padding: 14px 18px 16px; }
    .av-detail-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
    @media (max-width: 767px) { .av-detail-grid { grid-template-columns: 1fr; } }
    .av-detail-block .av-detail-label {
        text-transform: uppercase; letter-spacing: .08em; font-size: 10px;
        font-weight: 800; color: var(--c-primary-700); margin-bottom: 4px;
        display: flex; align-items: center; gap: 6px;
    }
    .av-detail-block .av-detail-text {
        font-size: 13px; color: var(--c-ink); line-height: 1.5;
        white-space: pre-line; word-break: break-word;
    }
    .av-detail-block .av-detail-text.is-empty { color: var(--c-ink-soft); font-style: italic; }

    /* clickable lab / medication chips + popup table */
    .av-pop-tag {
        display: inline-flex; align-items: center; gap: 6px;
        font-size: 11.5px; font-weight: 700; color: var(--c-primary-700);
        background: var(--c-primary-50); border: 1px solid var(--c-primary-100);
        border-radius: var(--radius-pill); padding: 3px 11px; cursor: pointer;
        transition: background var(--t-fast), border-color var(--t-fast);
    }
    .av-pop-tag i { color: var(--c-primary); }
    .av-pop-tag:hover { background: var(--c-primary-100); border-color: var(--c-primary-300); }
    .av-pop-tag .fa-search-plus { font-size: 10px; opacity: .6; }
    .hist-pop-table { width: 100%; border-collapse: collapse; text-align: left; }
    .hist-pop-table th { background: var(--c-primary-50); color: var(--c-primary-700); font-size: 11px; text-transform: uppercase; letter-spacing: .04em; padding: 9px 12px; }
    .hist-pop-table td { border-top: 1px solid var(--c-border); padding: 9px 12px; font-size: 13.5px; color: var(--c-ink); }

    @keyframes avIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
</style>
@endpush

@section('content')
    @php($p = $patient[0])
    @php($initials = collect(explode(' ', trim($p->name)))->filter()->take(2)->map(fn ($w) => strtoupper(substr($w, 0, 1)))->implode(''))
    @php($age = !empty($p->birthday) ? \Carbon\Carbon::parse($p->birthday)->age : null)
    @php($visitList = (!empty($visits) && count($visits)) ? collect($visits) : collect())
    @php($visitCount = $visitList->count())
    @php($lastVisit = $visitList->sortByDesc(fn ($v) => $v->created_at)->first())
    @php($recentDiagnosis = optional($visitList->sortByDesc(fn ($v) => $v->created_at)->first(fn ($v) => !empty($v->diagnosis)))->diagnosis)

    <div class="av-wrap fade-in">
        <div class="page-head">
            <div>
                <h4 class="page-title">Patient record</h4>
                <div class="page-sub">Review the record and add a new visit if needed.</div>
            </div>
            <div class="d-flex" style="gap: 8px;">
                <button type="button" class="btn btn-light-soft" onclick="printPatientSummary()">
                    <i class="fa fa-print"></i> Print patient summary
                </button>
                <a href="/search_patient" class="btn btn-light-soft"><i class="fa fa-arrow-left"></i> Back to search</a>
            </div>
        </div>

        {{-- Patient header --}}
        <div class="av-hero">
            <span class="avatar-initials">{{ $initials !== '' ? $initials : '?' }}</span>
            <div class="av-id">
                <span class="av-found"><i class="fa fa-check-circle"></i> Patient found</span>
                <h3>{{ $p->name }}</h3>
                <div class="av-chips">
                    <span class="av-chip"><i class="fa fa-id-badge"></i> Student ID <span class="tnum">{{ $p->stud_id }}</span></span>
                    <span class="av-chip"><i class="fa fa-hashtag"></i> MRN <span class="tnum">{{ $p->mrn }}</span></span>
                    @if (!empty($p->gender))
                        <span class="av-chip"><i class="fa fa-venus-mars"></i> {{ $p->gender }}</span>
                    @endif
                    @if (!empty($p->dept))
                        <span class="av-chip"><i class="fa fa-graduation-cap"></i> {{ $p->dept }}</span>
                    @endif
                    @if (!empty($p->year))
                        <span class="av-chip"><i class="fa fa-calendar-o"></i> Year {{ $p->year }}</span>
                    @endif
                    @if (!empty($p->birthday))
                        <span class="av-chip"><i class="fa fa-birthday-cake"></i> {{ \Carbon\Carbon::parse($p->birthday)->format('d M Y') }}@if (!is_null($age)) <span class="tnum">({{ $age }} yrs)</span>@endif</span>
                    @endif
                </div>
            </div>
        </div>

        {{-- Summary strip --}}
        <div class="av-strip">
            <div class="av-stat">
                <div class="av-stat-label">Total visits</div>
                <div class="av-stat-value is-tnum">{{ $visitCount }}</div>
                <div class="av-stat-sub">{{ $visitCount === 1 ? 'recorded visit' : 'recorded visits' }}</div>
            </div>
            <div class="av-stat">
                <div class="av-stat-label">Last visit</div>
                <div class="av-stat-value">{{ $lastVisit && $lastVisit->created_at ? $lastVisit->created_at->format('d M Y') : '—' }}</div>
                <div class="av-stat-sub">{{ $lastVisit && $lastVisit->created_at ? $lastVisit->created_at->diffForHumans() : 'No visits yet' }}</div>
            </div>
            <div class="av-stat">
                <div class="av-stat-label">Most-recent diagnosis</div>
                <div class="av-stat-value" style="font-size: 15px;">{{ $recentDiagnosis ?: '—' }}</div>
                <div class="av-stat-sub">{{ $recentDiagnosis ? 'from latest assessment' : 'Not yet diagnosed' }}</div>
            </div>
        </div>

        <div class="row">
            {{-- Patient summary + add visit --}}
            <div class="col-lg-5">
                <div class="card">
                    <div class="card-header">
                        <h5 class="card-title mb-0 av-section-title"><i class="fa fa-user-o"></i> Record details</h5>
                    </div>
                    <div class="card-body">
                        <table class="table table-sm mb-0">
                            <tbody>
                                <tr><th>Student ID</th><td class="tnum">{{ $p->stud_id }}</td></tr>
                                <tr><th>MRN</th><td class="tnum">{{ $p->mrn }}</td></tr>
                                <tr><th>Gender</th><td>{{ $p->gender ?: '—' }}</td></tr>
                                <tr>
                                    <th>Birthday</th>
                                    <td>
                                        @if (!empty($p->birthday))
                                            {{ \Carbon\Carbon::parse($p->birthday)->format('d M Y') }}
                                            @if (!is_null($age)) <span class="text-muted">({{ $age }} yrs)</span>@endif
                                        @else
                                            —
                                        @endif
                                    </td>
                                </tr>
                                <tr><th>Department</th><td>{{ $p->dept ?: '—' }}</td></tr>
                                <tr><th>Year</th><td>{{ $p->year ?: '—' }}</td></tr>
                            </tbody>
                        </table>
                    </div>

                    @if (Auth::user()->role == '0')
                        <div class="card-footer bg-white">
                            <form action="{{ url('/insert_new_visit', $p->id) }}" method="POST" enctype="multipart/form-data">
                                @csrf
                                <div class="form-group">
                                    <label class="form-label"><i class="fa fa-user-md m-r-5"></i> Assign to doctor</label>
                                    <select class="select form-select" name="doc_id">
                                        @foreach ($doctors as $doctor)
                                            <option value="{{ $doctor->id }}">{{ $doctor->name }}</option>
                                        @endforeach
                                    </select>
                                    <div class="input-hint">The patient will be queued for the selected doctor.</div>
                                </div>
                                <button type="submit" class="btn btn-primary btn-block">
                                    <i class="fa fa-plus"></i> Add new visit
                                </button>
                            </form>
                        </div>
                    @endif
                </div>
            </div>

            {{-- Visit history --}}
            <div class="col-lg-7">
                <div class="card">
                    <div class="card-header d-flex align-items-center justify-content-between">
                        <h5 class="card-title mb-0 av-section-title"><i class="fa fa-history"></i> Visit history</h5>
                        @if ($visitCount)
                            <span class="input-hint mb-0"><i class="fa fa-hand-pointer-o"></i> Click a visit to view clinical details</span>
                        @endif
                    </div>
                    <div class="card-body p-0">
                        <div class="table-responsive table-card">
                            <table class="table table-hover mb-0">
                                <thead>
                                    <tr>
                                        <th>Visit ID</th>
                                        <th>Date</th>
                                        <th>Doctor</th>
                                        <th>Lab</th>
                                        <th>Medicine</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    @if ($visitCount)
                                        @foreach ($visits as $v)
                                            @php($pill = $v->statues === 'Completed' ? 'is-completed' : (in_array($v->statues, ['Pending', 'Lab Result Completed']) ? 'is-pending' : 'is-queued'))
                                            @php($docName = optional($doctors->firstWhere('id', $v->doc_id))->name ?? '—')
                                            <tr class="av-row-toggle" data-toggle="collapse" data-target="#av-visit-{{ $v->id }}" aria-expanded="false" aria-controls="av-visit-{{ $v->id }}">
                                                <td class="tnum"><i class="fa fa-chevron-right av-caret"></i>{{ $v->id }}</td>
                                                <td class="tnum">{{ $v->created_at ? $v->created_at->format('d M Y') : '—' }}</td>
                                                <td>{{ $docName }}</td>
                                                <td>
                                                    @if (!empty($historyLabs[$v->id] ?? null))
                                                        <button type="button" class="av-pop-tag is-click" onclick="event.stopPropagation(); histDetail('av-lab-{{ $v->id }}')"><i class="fa fa-flask"></i> Yes ({{ count($historyLabs[$v->id]) }}) <i class="fa fa-search-plus"></i></button>
                                                    @else
                                                        {{ $v->lab_order_id == '' ? 'No' : 'Yes' }}
                                                    @endif
                                                </td>
                                                <td>
                                                    @if (!empty($historyDrugs[$v->id] ?? null))
                                                        <button type="button" class="av-pop-tag is-click" onclick="event.stopPropagation(); histDetail('av-drug-{{ $v->id }}')"><i class="fa fa-medkit"></i> Yes ({{ count($historyDrugs[$v->id]) }}) <i class="fa fa-search-plus"></i></button>
                                                    @else
                                                        {{ $v->order_drug_id == '' ? 'No' : 'Yes' }}
                                                    @endif
                                                </td>
                                                <td><span class="status-pill {{ $pill }}">{{ $v->statues }}</span></td>
                                            </tr>
                                            @if (!empty($historyLabs[$v->id] ?? null))
                                                <template id="av-lab-{{ $v->id }}" data-title="Lab tests &mdash; {{ $v->created_at ? $v->created_at->format('d M Y') : '' }}">
                                                    <table class="hist-pop-table">
                                                        <thead><tr><th>Test</th><th>Result</th><th>Status</th></tr></thead>
                                                        <tbody>
                                                            @foreach ($historyLabs[$v->id] as $row)
                                                                <tr><td>{{ $row['name'] }}</td><td>{{ $row['result'] ?: '—' }}</td><td>{{ $row['status'] ?: '—' }}</td></tr>
                                                            @endforeach
                                                        </tbody>
                                                    </table>
                                                </template>
                                            @endif
                                            @if (!empty($historyDrugs[$v->id] ?? null))
                                                <template id="av-drug-{{ $v->id }}" data-title="Medication &mdash; {{ $v->created_at ? $v->created_at->format('d M Y') : '' }}">
                                                    <table class="hist-pop-table">
                                                        <thead><tr><th>Medicine</th><th>Qty</th><th>Status</th></tr></thead>
                                                        <tbody>
                                                            @foreach ($historyDrugs[$v->id] as $row)
                                                                <tr><td>{{ $row['name'] }}</td><td>{{ $row['qty'] ?: '—' }}</td><td>{{ $row['status'] ?: '—' }}</td></tr>
                                                            @endforeach
                                                        </tbody>
                                                    </table>
                                                </template>
                                            @endif
                                            <tr class="av-detail-row">
                                                <td class="av-detail-cell" colspan="6">
                                                    <div id="av-visit-{{ $v->id }}" class="collapse" data-parent=".table">
                                                        <div class="av-detail-inner">
                                                            <div class="av-detail-grid">
                                                                <div class="av-detail-block">
                                                                    <div class="av-detail-label"><i class="fa fa-stethoscope"></i> Diagnosis</div>
                                                                    <div class="av-detail-text {{ empty($v->diagnosis) ? 'is-empty' : '' }}">{{ $v->diagnosis ?: 'Not recorded' }}</div>
                                                                </div>
                                                                <div class="av-detail-block">
                                                                    <div class="av-detail-label"><i class="fa fa-heartbeat"></i> Disease</div>
                                                                    <div class="av-detail-text {{ empty($v->deasease) ? 'is-empty' : '' }}">{{ $v->deasease ?: 'Not recorded' }}</div>
                                                                </div>
                                                                <div class="av-detail-block">
                                                                    <div class="av-detail-label"><i class="fa fa-commenting-o"></i> Symptoms</div>
                                                                    <div class="av-detail-text {{ empty($v->symptoms) ? 'is-empty' : '' }}">{{ $v->symptoms ?: 'Not recorded' }}</div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        @endforeach
                                    @else
                                        <tr>
                                            <td colspan="6">
                                                <div class="empty-state">
                                                    <div class="empty-icon"><i class="fa fa-stethoscope"></i></div>
                                                    <h5>No previous visits</h5>
                                                    <p>Add the first visit for this patient.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    @endif
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    {{-- Hidden printable patient summary (rendered into a new window by printPatientSummary) --}}
    <div id="patientSummaryDoc" style="display:none;">
        <div class="ps-sheet">
            <div class="ps-head">
                <div class="ps-org">
                    <h1>Dire Dawa University Clinic Center</h1>
                    <p class="ps-org-sub">Patient Summary Report</p>
                </div>
                <div class="ps-gen">Generated {{ \Carbon\Carbon::now()->format('d M Y, H:i') }}</div>
            </div>

            <h2 class="ps-title">Patient Record</h2>

            <div class="ps-block">
                <div class="ps-block-title">Patient details</div>
                <table class="ps-table">
                    <tr><td class="ps-label">Full name</td><td class="ps-value">{{ $p->name ?: '—' }}</td>
                        <td class="ps-label">Student ID</td><td class="ps-value">{{ $p->stud_id ?: '—' }}</td></tr>
                    <tr><td class="ps-label">MRN</td><td class="ps-value">{{ $p->mrn ?: '—' }}</td>
                        <td class="ps-label">Gender</td><td class="ps-value">{{ $p->gender ?: '—' }}</td></tr>
                    <tr><td class="ps-label">Birthday</td><td class="ps-value">{{ !empty($p->birthday) ? \Carbon\Carbon::parse($p->birthday)->format('d M Y') . (is_null($age) ? '' : "  ({$age} yrs)") : '—' }}</td>
                        <td class="ps-label">Blood type</td><td class="ps-value">{{ $p->bloodtype ?: '—' }}</td></tr>
                    <tr><td class="ps-label">Department</td><td class="ps-value">{{ $p->dept ?: '—' }}</td>
                        <td class="ps-label">Year</td><td class="ps-value">{{ $p->year ?: '—' }}</td></tr>
                    <tr><td class="ps-label">Phone</td><td class="ps-value">{{ $p->phone ?: '—' }}</td>
                        <td class="ps-label">Address</td><td class="ps-value">{{ $p->address ?: '—' }}</td></tr>
                </table>
            </div>

            <div class="ps-block">
                <div class="ps-block-title">Visit history ({{ $visitCount }})</div>
                @if ($visitCount)
                    <table class="ps-history">
                        <thead>
                            <tr>
                                <th>#</th><th>Date</th><th>Doctor</th>
                                <th>Diagnosis</th><th>Disease</th><th>Symptoms</th><th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            @foreach ($visits as $v)
                                @php($docName = optional($doctors->firstWhere('id', $v->doc_id))->name ?? '—')
                                <tr>
                                    <td>{{ $v->id }}</td>
                                    <td>{{ $v->created_at ? $v->created_at->format('d M Y') : '—' }}</td>
                                    <td>{{ $docName }}</td>
                                    <td>{{ $v->diagnosis ?: '—' }}</td>
                                    <td>{{ $v->deasease ?: '—' }}</td>
                                    <td>{{ $v->symptoms ?: '—' }}</td>
                                    <td>{{ $v->statues }}</td>
                                </tr>
                            @endforeach
                        </tbody>
                    </table>
                @else
                    <p class="ps-empty">No previous visits recorded for this patient.</p>
                @endif
            </div>

            <p class="ps-confidential">Confidential medical record — Dire Dawa University Clinic Center. For authorized clinical use only.</p>
        </div>
    </div>
@endsection

@push('scripts')
<script>
    // Show the ordered lab tests / medications for a past visit in a popup.
    function histDetail(id) {
        var tpl = document.getElementById(id);
        if (!tpl) { return; }
        Swal.fire({
            title: tpl.getAttribute('data-title') || 'Details',
            html: tpl.innerHTML,
            width: 560,
            confirmButtonColor: '#16a085',
            confirmButtonText: 'Close'
        });
    }

    function printPatientSummary() {
        var doc = document.getElementById('patientSummaryDoc');
        if (!doc) { return; }

        var css = ''
            + '@page { size: A4; margin: 16mm 14mm; }'
            + '* { box-sizing: border-box; }'
            + 'html, body { margin: 0; padding: 0; }'
            + 'body { font-family: Arial, Helvetica, sans-serif; color: #111; background: #fff; line-height: 1.5; -webkit-print-color-adjust: exact; print-color-adjust: exact; }'
            + '.ps-sheet { max-width: 182mm; margin: 0 auto; padding: 4mm 2mm; }'
            + '.ps-head { display: flex; align-items: flex-end; justify-content: space-between; border-bottom: 3px solid #16a085; padding-bottom: 12px; }'
            + '.ps-org h1 { font-size: 19px; margin: 0; color: #111; }'
            + '.ps-org-sub { margin: 3px 0 0; font-size: 11px; color: #16a085; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; }'
            + '.ps-gen { font-size: 11px; color: #666; }'
            + '.ps-title { text-align: center; font-size: 15px; letter-spacing: 1.5px; text-transform: uppercase; margin: 22px 0 18px; padding-bottom: 6px; border-bottom: 1px solid #ccc; }'
            + '.ps-block { margin-bottom: 22px; }'
            + '.ps-block-title { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #16a085; border-bottom: 1px solid #e0e0e0; padding-bottom: 4px; margin: 0 0 10px; font-weight: bold; }'
            + '.ps-table { width: 100%; border-collapse: collapse; font-size: 12.5px; }'
            + '.ps-table td { padding: 6px 6px; border-bottom: 1px solid #eee; vertical-align: top; }'
            + '.ps-label { width: 90px; color: #666; font-size: 10px; text-transform: uppercase; letter-spacing: .4px; }'
            + '.ps-value { font-weight: bold; }'
            + '.ps-history { width: 100%; border-collapse: collapse; font-size: 11.5px; }'
            + '.ps-history th { text-align: left; background: #f3faf8; color: #0f6b58; padding: 6px 6px; border-bottom: 2px solid #16a085; font-size: 10px; text-transform: uppercase; letter-spacing: .4px; }'
            + '.ps-history td { padding: 6px 6px; border-bottom: 1px solid #eee; vertical-align: top; }'
            + '.ps-empty { font-size: 12.5px; color: #666; font-style: italic; }'
            + '.ps-confidential { margin-top: 36px; padding-top: 10px; border-top: 1px solid #e0e0e0; font-size: 10px; color: #888; text-align: center; }';

        var win = window.open('', '_blank', 'width=900,height=1100');
        if (!win) { return; }

        win.document.open();
        win.document.write(
            '<!DOCTYPE html><html><head><meta charset="utf-8">'
            + '<title>Patient Summary</title>'
            + '<style>' + css + '</style></head><body>'
            + doc.innerHTML
            + '</body></html>'
        );
        win.document.close();

        var printed = false;
        function doPrint() {
            if (printed) { return; }
            printed = true;
            win.focus();
            win.print();
        }
        // Close only AFTER the print dialog is handled — never right after print().
        win.onafterprint = function () { win.close(); };
        win.onload = doPrint;
        // Fallback if onload already fired.
        setTimeout(doPrint, 600);
    }
</script>
@endpush
