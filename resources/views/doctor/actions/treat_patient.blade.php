@extends('layouts.portal')

@section('title', 'Treat Patient')

@section('content')
    @php($initials = Str::upper(Str::substr($patient->name ?? '?', 0, 1) . Str::substr(Str::after($patient->name ?? '', ' '), 0, 1)))
    @php($statusPill = $visits->statues === 'Completed' ? 'is-completed' : ($visits->statues === 'Pending' ? 'is-pending' : 'is-queued'))
    @php($visitEditable = $visits->statues !== 'Completed')
    @php($itemPill = fn ($s) => in_array($s, ['Done', 'Completed']) ? 'is-completed' : ($s === 'In progress' || $s === 'Pending' ? 'is-pending' : ($s === 'Skipped' ? 'is-danger' : 'is-queued')))

    <div id="printContent" class="treat-workspace">
        {{-- Patient header --}}
        <div class="card treat-header">
            <div class="card-body">
                <div class="d-flex align-items-center flex-wrap" style="gap:18px;">
                    <span class="avatar-initials treat-avatar">{{ $initials ?: '?' }}</span>
                    <div style="min-width:0; flex:1;">
                        <h4 class="treat-name">{{ $patient->name }}</h4>
                        <div class="treat-chips">
                            <span class="treat-chip tnum"><i class="fa fa-id-card-o"></i> ID {{ $patient->stud_id ?: '—' }}</span>
                            <span class="treat-chip tnum"><i class="fa fa-hashtag"></i> MRN {{ $patient->mrn ?: '—' }}</span>
                            <span class="treat-chip"><i class="fa fa-{{ Str::lower($patient->gender ?? '') === 'female' ? 'venus' : 'mars' }}"></i> {{ $patient->gender ?: '—' }}</span>
                            <span class="status-pill {{ $statusPill }}">{{ $visits->statues }}</span>
                        </div>
                    </div>
                    <div class="d-flex treat-header-actions" style="gap:.5rem;">
                        @if ($visits->statues == 'Completed')
                            <button type="button" class="btn btn-light-soft" onclick="printSickLeave()">
                                <i class="fa fa-print"></i> Print sick leave
                            </button>
                        @endif
                        @if ($visits->order_drug_id != '' && count($drugs))
                            <button type="button" class="btn btn-light-soft" onclick="printPrescription()">
                                <i class="fa fa-print"></i> Print prescription
                            </button>
                        @endif
                        <a href="/queued_patients" class="btn btn-light-soft"><i class="fa fa-arrow-left"></i> Back</a>
                    </div>
                </div>
            </div>
        </div>

        <div class="row">
            {{-- Left column: patient summary --}}
            <div class="col-lg-4">
                <div class="card treat-summary">
                    <div class="card-header">
                        <h4 class="card-title mb-0"><i class="fa fa-user-o"></i> Patient summary</h4>
                    </div>
                    <div class="card-body">
                        <dl class="summary-list mb-0">
                            <div class="summary-item">
                                <dt>Full name</dt>
                                <dd>{{ $patient->name ?: '—' }}</dd>
                            </div>
                            <div class="summary-item">
                                <dt>Student ID</dt>
                                <dd class="tnum">{{ $patient->stud_id ?: '—' }}</dd>
                            </div>
                            <div class="summary-item">
                                <dt>MRN</dt>
                                <dd class="tnum">{{ $patient->mrn ?: '—' }}</dd>
                            </div>
                            <div class="summary-item">
                                <dt>Gender</dt>
                                <dd>{{ $patient->gender ?: '—' }}</dd>
                            </div>
                            <div class="summary-item">
                                <dt>Department</dt>
                                <dd>{{ $patient->dept ?: '—' }}</dd>
                            </div>
                            <div class="summary-item">
                                <dt>Year</dt>
                                <dd>{{ $patient->year ?: '—' }}</dd>
                            </div>
                        </dl>
                    </div>
                </div>
            </div>

            {{-- Right column: clinical notes + orders --}}
            <div class="col-lg-8">
                <form action="/order_lab/{{ $visits->id }}" method="get" enctype="multipart/form-data" id="myForm">
                    @csrf

                    {{-- Clinical notes --}}
                    <div class="card">
                        <div class="card-header">
                            <h4 class="card-title mb-0"><i class="fa fa-stethoscope"></i> Clinical notes</h4>
                        </div>
                        <div class="card-body">
                            <div class="form-group">
                                <label class="form-label">Symptoms <span class="text-danger">*</span></label>
                                <textarea name="symptoms" class="form-control @error('symptoms') is-invalid @enderror"
                                    rows="3" placeholder="Describe the reported symptoms…">{{ $visits->symptoms }}</textarea>
                                <div class="input-hint">Capture what the patient reports in their own words.</div>
                                @error('symptoms') <div class="field-error">{{ $message }}</div> @enderror
                            </div>
                            <div class="form-group">
                                <label class="form-label">Diagnosis <span class="text-danger">*</span></label>
                                <textarea name="diagnosis" class="form-control @error('diagnosis') is-invalid @enderror"
                                    rows="3" placeholder="Enter your diagnosis…">{{ $visits->diagnosis }}</textarea>
                                <div class="input-hint">Your clinical assessment of the visit.</div>
                                @error('diagnosis') <div class="field-error">{{ $message }}</div> @enderror
                            </div>
                            <div class="form-group mb-0">
                                <label class="form-label">Disease <span class="text-danger">*</span></label>
                                <textarea name="deasease" class="form-control @error('deasease') is-invalid @enderror"
                                    rows="2" placeholder="Identified disease…">{{ $visits->deasease }}</textarea>
                                <div class="input-hint">The confirmed or suspected condition.</div>
                                @error('deasease') <div class="field-error">{{ $message }}</div> @enderror
                            </div>
                        </div>
                    </div>

                    {{-- Lab tests --}}
                    <div class="card">
                        <div class="card-header d-flex align-items-center justify-content-between">
                            <h4 class="card-title mb-0"><i class="fa fa-flask"></i> Lab tests</h4>
                            @if ($visits->lab_order_id == '')
                                <span class="status-pill is-queued">Not ordered</span>
                            @else
                                <span class="status-pill is-completed">Ordered</span>
                            @endif
                        </div>
                        <div class="card-body">
                            @if ($visits->lab_order_id == '')
                                <p class="text-muted-2 mb-3">No lab test has been ordered for this visit yet.</p>
                                <input type="submit" class="btn btn-primary" value="Ordered Lab Test" name="submit">
                            @else
                                <div class="table-responsive table-card">
                                    <table class="table table-striped custom-table mb-0">
                                        <thead>
                                            <tr>
                                                <th>Ordered lab test type</th>
                                                <th>Test result</th>
                                                <th>Test status</th>
                                                @if ($visitEditable)
                                                    <th class="text-end">Manage</th>
                                                @endif
                                            </tr>
                                        </thead>
                                        <tbody>
                                            @foreach ($Result as $result)
                                                <tr>
                                                    <td>
                                                        @foreach ($test as $tests)
                                                            @if ($tests->id == $result->test_id)
                                                                <b>{{ $tests->name }}</b>
                                                            @endif
                                                        @endforeach
                                                    </td>
                                                    <td><b>{{ $result->Result_of_Test ?: '—' }}</b></td>
                                                    <td><span class="status-pill {{ $itemPill($result->status) }}">{{ $result->status }}</span></td>
                                                    @if ($visitEditable)
                                                        <td class="text-end">
                                                            <a href="/lab_result/{{ $result->id }}/remove"
                                                                class="btn btn-sm btn-light-soft text-danger"
                                                                onclick="return confirm('Remove this test from the order?')">
                                                                <i class="fa fa-trash-o"></i>
                                                            </a>
                                                        </td>
                                                    @endif
                                                </tr>
                                            @endforeach
                                        </tbody>
                                    </table>
                                </div>
                            @endif
                        </div>
                    </div>

                    {{-- Medication --}}
                    <div class="card">
                        <div class="card-header d-flex align-items-center justify-content-between">
                            <h4 class="card-title mb-0"><i class="fa fa-medkit"></i> Medication</h4>
                            @if ($visits->order_drug_id == '')
                                <span class="status-pill is-queued">Not ordered</span>
                            @else
                                <span class="status-pill is-completed">Ordered</span>
                            @endif
                        </div>
                        <div class="card-body">
                            @if ($visits->order_drug_id == '')
                                <p class="text-muted-2 mb-3">No medicine has been ordered for this visit yet.</p>
                                <a href="/order_drug/{{ $visits->id }}" class="btn btn-primary">
                                    <i class="fa fa-plus"></i> Order drug
                                </a>
                            @else
                                <div class="table-responsive table-card">
                                    <table class="table table-striped custom-table mb-0">
                                        <thead>
                                            <tr>
                                                <th>Ordered drugs</th>
                                                <th>Quantity</th>
                                                <th>Status</th>
                                                @if ($visitEditable)
                                                    <th class="text-end">Manage</th>
                                                @endif
                                            </tr>
                                        </thead>
                                        <tbody>
                                            @foreach ($drugs as $drug)
                                                <tr>
                                                    <td>
                                                        @foreach ($drugname as $name)
                                                            @if ($name->id == $drug->drug_id)
                                                                <b>{{ $name->m_name }}</b>
                                                            @endif
                                                        @endforeach
                                                    </td>
                                                    <td><b>{{ $drug->qty }}</b></td>
                                                    <td><span class="status-pill {{ $itemPill($drug->status) }}">{{ $drug->status }}</span></td>
                                                    @if ($visitEditable)
                                                        <td class="text-end">
                                                            <a href="/drug_ordered/{{ $drug->id }}/remove"
                                                                class="btn btn-sm btn-light-soft text-danger"
                                                                onclick="return confirm('Remove this medicine from the order?')">
                                                                <i class="fa fa-trash-o"></i>
                                                            </a>
                                                        </td>
                                                    @endif
                                                </tr>
                                            @endforeach
                                        </tbody>
                                    </table>
                                </div>
                                @if ($visitEditable)
                                    <div class="text-muted-2 mt-2" style="font-size:12.5px">
                                        <i class="fa fa-info-circle"></i> Edit quantities, add or remove medicines below the visit notes.
                                    </div>
                                @endif
                            @endif
                        </div>
                    </div>

                    {{-- Primary action bar --}}
                    <div class="treat-actionbar">
                        <div class="text-muted-2">
                            <i class="fa fa-check-circle"></i> Finalise the visit once notes and orders are complete.
                        </div>
                        <input type="submit" class="btn btn-primary btn-lg" value="Completed Treatement" name="submit">
                    </div>
                </form>

                {{-- Add more tests to an existing lab order (own form, outside the main treat form) --}}
                @if ($visitEditable && $visits->lab_order_id != '' && $order)
                    <div class="card">
                        <div class="card-header">
                            <h4 class="card-title mb-0"><i class="fa fa-plus-circle"></i> Add more lab tests</h4>
                        </div>
                        <form action="/lab_order/{{ $order->id }}/add" method="POST">
                            @csrf
                            <div class="card-body">
                                @if (count($test))
                                    <div class="pick-toolbar">
                                        <div class="search-box">
                                            <i class="fa fa-search"></i>
                                            <input type="text" class="form-control" id="addTestSearch"
                                                placeholder="Search lab tests…" autocomplete="off">
                                        </div>
                                    </div>
                                    <div id="addTestList" class="pick-list">
                                        @foreach ($test as $tests)
                                            <label class="pick-item" data-name="{{ strtolower($tests->name) }}">
                                                <input type="checkbox" class="pick-check" name="testType[]" value="{{ $tests->name }}">
                                                <span class="pick-box"><i class="fa fa-check"></i></span>
                                                <span class="pick-label">{{ $tests->name }}</span>
                                            </label>
                                        @endforeach
                                        <div class="pick-nomatch" id="addTestNoMatch" style="display:none">
                                            <i class="fa fa-search"></i> No tests match your search.
                                        </div>
                                    </div>
                                @else
                                    <p class="text-muted-2 mb-0">No lab tests configured to add.</p>
                                @endif
                            </div>
                            @if (count($test))
                                <div class="card-footer text-end">
                                    <button type="submit" class="btn btn-primary"><i class="fa fa-plus"></i> Add selected tests</button>
                                </div>
                            @endif
                        </form>
                    </div>
                @endif

                {{-- Edit / add medicines on an existing drug order (own forms) --}}
                @if ($visitEditable && $visits->order_drug_id != '' && $DrugsOrder)
                    @if (count($drugs))
                        <div class="card">
                            <div class="card-header">
                                <h4 class="card-title mb-0"><i class="fa fa-pencil"></i> Edit ordered quantities</h4>
                            </div>
                            <div class="card-body">
                                @foreach ($drugs as $drug)
                                    <form action="/drug_ordered/{{ $drug->id }}/update" method="POST"
                                        class="form-group row align-items-center mb-2">
                                        @csrf
                                        <label class="col-sm-6 col-form-label mb-0">
                                            @foreach ($drugname as $name)
                                                @if ($name->id == $drug->drug_id)
                                                    <strong>{{ $name->m_name }}</strong>
                                                @endif
                                            @endforeach
                                        </label>
                                        <div class="col-sm-4">
                                            <input type="number" class="form-control" name="qty" min="1"
                                                value="{{ $drug->qty }}">
                                        </div>
                                        <div class="col-sm-2">
                                            <button type="submit" class="btn btn-light-soft btn-sm w-100">
                                                <i class="fa fa-save"></i> Save
                                            </button>
                                        </div>
                                    </form>
                                @endforeach
                            </div>
                        </div>
                    @endif

                    <div class="card">
                        <div class="card-header">
                            <h4 class="card-title mb-0"><i class="fa fa-plus-circle"></i> Add more medicines</h4>
                        </div>
                        <form action="/drug_order/{{ $DrugsOrder->id }}/add" method="POST">
                            @csrf
                            <div class="card-body">
                                @if (count($drugname))
                                    <div class="drug-toolbar">
                                        <div class="search-box">
                                            <i class="fa fa-search"></i>
                                            <input type="text" class="form-control" id="addDrugSearch"
                                                placeholder="Search medicines…" autocomplete="off">
                                        </div>
                                    </div>
                                    <div id="addDrugList">
                                        @foreach ($drugname as $name)
                                            <div class="form-group row align-items-center drug-item" data-name="{{ strtolower($name->m_name) }}">
                                                <label class="col-sm-7 col-form-label mb-0">
                                                    <strong>{{ $name->m_name }}</strong>
                                                    <span class="text-muted-2">(in stock: {{ $name->total }})</span>
                                                </label>
                                                <div class="col-sm-5">
                                                    <input type="hidden" value="{{ $name->m_name }}" name="drugName[]">
                                                    <input type="number" class="form-control" min="0" max="{{ $name->total }}"
                                                        name="drugType[]" placeholder="Quantity">
                                                </div>
                                            </div>
                                        @endforeach
                                        <div class="pick-nomatch" id="addDrugNoMatch" style="display:none">
                                            <i class="fa fa-search"></i> No medicines match your search.
                                        </div>
                                    </div>
                                @else
                                    <p class="text-muted-2 mb-0">No medicines in stock to add.</p>
                                @endif
                            </div>
                            @if (count($drugname))
                                <div class="card-footer text-end">
                                    <button type="submit" class="btn btn-primary"><i class="fa fa-plus"></i> Add medicines</button>
                                </div>
                            @endif
                        </form>
                    </div>
                @endif
            </div>
        </div>

        {{-- Clinical history: previous visits with diagnoses for reference --}}
        <div class="row">
            <div class="col-12">
                <div class="card hist-card">
                    <div class="card-header d-flex align-items-center justify-content-between">
                        <h4 class="card-title mb-0"><i class="fa fa-history m-r-5"></i> Clinical history</h4>
                        <span class="hist-count">{{ count($history) }} previous {{ \Illuminate\Support\Str::plural('visit', count($history)) }}</span>
                    </div>
                    <div class="card-body">
                        @if (count($history))
                            <div class="hist-timeline">
                                @foreach ($history as $h)
                                    @php($docName = optional($docs->get($h->doc_id))->name ?? 'Unknown doctor')
                                    @php($hpill = $h->statues === 'Completed' ? 'is-completed' : ($h->statues === 'Pending' ? 'is-pending' : ($h->statues === 'Lab Result Completed' ? 'is-pending' : 'is-queued')))
                                    <div class="hist-item">
                                        <div class="hist-dot"></div>
                                        <div class="hist-body">
                                            <div class="hist-top">
                                                <span class="hist-date"><i class="fa fa-calendar-o"></i> {{ $h->created_at ? $h->created_at->format('d M Y') : '—' }}</span>
                                                <span class="hist-doc"><i class="fa fa-user-md"></i> {{ $docName }}</span>
                                                <span class="status-pill {{ $hpill }}">{{ $h->statues }}</span>
                                            </div>
                                            <div class="hist-fields">
                                                <div class="hist-field">
                                                    <span class="hist-label">Diagnosis</span>
                                                    <p>{{ $h->diagnosis ?: '—' }}</p>
                                                </div>
                                                <div class="hist-field">
                                                    <span class="hist-label">Disease</span>
                                                    <p>{{ $h->deasease ?: '—' }}</p>
                                                </div>
                                                <div class="hist-field">
                                                    <span class="hist-label">Symptoms</span>
                                                    <p>{{ $h->symptoms ?: '—' }}</p>
                                                </div>
                                            </div>
                                            <div class="hist-tags">
                                                @if (!empty($historyLabs[$h->id] ?? null))
                                                    <button type="button" class="hist-tag is-click" onclick="histDetail('lab-{{ $h->id }}')"><i class="fa fa-flask"></i> Lab tests ({{ count($historyLabs[$h->id]) }}) <i class="fa fa-search-plus"></i></button>
                                                @elseif (!empty($h->lab_order_id))
                                                    <span class="hist-tag"><i class="fa fa-flask"></i> Lab ordered</span>
                                                @endif
                                                @if (!empty($historyDrugs[$h->id] ?? null))
                                                    <button type="button" class="hist-tag is-click" onclick="histDetail('drug-{{ $h->id }}')"><i class="fa fa-medkit"></i> Medication ({{ count($historyDrugs[$h->id]) }}) <i class="fa fa-search-plus"></i></button>
                                                @elseif (!empty($h->order_drug_id))
                                                    <span class="hist-tag"><i class="fa fa-medkit"></i> Medication</span>
                                                @endif
                                            </div>

                                            @if (!empty($historyLabs[$h->id] ?? null))
                                                <template id="lab-{{ $h->id }}" data-title="Lab tests &mdash; {{ $h->created_at ? $h->created_at->format('d M Y') : '' }}">
                                                    <table class="hist-pop-table">
                                                        <thead><tr><th>Test</th><th>Result</th><th>Status</th></tr></thead>
                                                        <tbody>
                                                            @foreach ($historyLabs[$h->id] as $row)
                                                                <tr><td>{{ $row['name'] }}</td><td>{{ $row['result'] ?: '—' }}</td><td>{{ $row['status'] ?: '—' }}</td></tr>
                                                            @endforeach
                                                        </tbody>
                                                    </table>
                                                </template>
                                            @endif
                                            @if (!empty($historyDrugs[$h->id] ?? null))
                                                <template id="drug-{{ $h->id }}" data-title="Medication &mdash; {{ $h->created_at ? $h->created_at->format('d M Y') : '' }}">
                                                    <table class="hist-pop-table">
                                                        <thead><tr><th>Medicine</th><th>Qty</th><th>Status</th></tr></thead>
                                                        <tbody>
                                                            @foreach ($historyDrugs[$h->id] as $row)
                                                                <tr><td>{{ $row['name'] }}</td><td>{{ $row['qty'] ?: '—' }}</td><td>{{ $row['status'] ?: '—' }}</td></tr>
                                                            @endforeach
                                                        </tbody>
                                                    </table>
                                                </template>
                                            @endif
                                        </div>
                                    </div>
                                @endforeach
                            </div>
                        @else
                            <div class="empty-state" style="padding:30px 16px">
                                <div class="empty-icon"><i class="fa fa-folder-open-o"></i></div>
                                <h5>No previous visits</h5>
                                <p>This is the patient's first recorded visit.</p>
                            </div>
                        @endif
                    </div>
                </div>
            </div>
        </div>
    </div>

    {{-- Printable medical certificate / sick-leave document (hidden on screen) --}}
    @php($certClinical = $visits->deasease ?: ($visits->diagnosis ?: ''))
    <div id="sickLeaveDoc" class="d-none">
        <div class="cert-sheet">
            <header class="cert-head">
                <img src="{{ asset('assets/img/logo.png') }}" alt="Clinic logo" class="cert-logo">
                <div class="cert-org">
                    <h1>Dire Dawa University &mdash; Clinic Center</h1>
                    <p class="cert-org-sub">Student Health Service &middot; Dire Dawa, Ethiopia &middot; Tel. +251 25 111 0000</p>
                </div>
            </header>

            <h2 class="cert-title">Medical Certificate / Sick Leave</h2>

            <div class="cert-meta">
                <span><strong>Ref. No.:</strong> MC-{{ str_pad($visits->id, 6, '0', STR_PAD_LEFT) }}</span>
                <span><strong>Date of Issue:</strong> {{ now()->format('d M Y') }}</span>
            </div>

            <section class="cert-block">
                <h3 class="cert-block-title">Patient Details</h3>
                <table class="cert-table">
                    <tr>
                        <td class="cert-label">Full Name</td>
                        <td class="cert-value">{{ $patient->name ?: '—' }}</td>
                        <td class="cert-label">Gender</td>
                        <td class="cert-value">{{ $patient->gender ?: '—' }}</td>
                    </tr>
                    <tr>
                        <td class="cert-label">Student ID</td>
                        <td class="cert-value">{{ $patient->stud_id ?: '—' }}</td>
                        <td class="cert-label">MRN</td>
                        <td class="cert-value">{{ $patient->mrn ?: '—' }}</td>
                    </tr>
                    <tr>
                        <td class="cert-label">Department</td>
                        <td class="cert-value">{{ $patient->dept ?: '—' }}</td>
                        <td class="cert-label">Year</td>
                        <td class="cert-value">{{ $patient->year ?: '—' }}</td>
                    </tr>
                </table>
            </section>

            <section class="cert-block">
                <h3 class="cert-block-title">Clinical Statement</h3>
                <p class="cert-text">
                    This is to certify that the above-named patient was examined at the
                    Dire Dawa University Clinic Center
                    @if ($certClinical)
                        and was found to be suffering from <strong>{{ $certClinical }}</strong>.
                    @else
                        on the date noted above.
                    @endif
                </p>
                <p class="cert-text">
                    The patient has been examined and is advised to rest from
                    <span class="cert-blank">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
                    to
                    <span class="cert-blank">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
                    ( <span class="cert-blank-sm">&nbsp;&nbsp;&nbsp;&nbsp;</span> days ).
                </p>
                @if ($visits->diagnosis)
                    <p class="cert-text"><strong>Diagnosis:</strong> {{ $visits->diagnosis }}</p>
                @endif
            </section>

            <footer class="cert-foot">
                <div class="cert-sign">
                    <div class="cert-sign-line"></div>
                    <p class="cert-sign-name">Dr. {{ Auth::user()->name }}</p>
                    <p class="cert-sign-role">Attending Physician</p>
                </div>
                <div class="cert-stamp">
                    <span>Official Stamp</span>
                </div>
            </footer>

            <p class="cert-confidential">
                CONFIDENTIAL: This medical certificate is issued for official purposes only and contains
                protected health information. Unauthorized disclosure is prohibited.
            </p>
        </div>
    </div>

    {{-- Printable prescription / Rx document (hidden on screen) --}}
    @php($rxAge = $patient->birthday ? \Carbon\Carbon::parse($patient->birthday)->age : null)
    <div id="prescriptionDoc" class="d-none">
        <div class="cert-sheet">
            <header class="cert-head">
                <img src="{{ asset('assets/img/logo.png') }}" alt="Clinic logo" class="cert-logo">
                <div class="cert-org">
                    <h1>Dire Dawa University &mdash; Clinic Center</h1>
                    <p class="cert-org-sub">Student Health Service &middot; Dire Dawa, Ethiopia &middot; Tel. +251 25 111 0000</p>
                </div>
            </header>

            <h2 class="cert-title">Prescription / Rx</h2>

            <div class="cert-meta">
                <span><strong>Ref. No.:</strong> RX-{{ str_pad($visits->id, 6, '0', STR_PAD_LEFT) }}</span>
                <span><strong>Date:</strong> {{ now()->format('d M Y') }}</span>
            </div>

            <section class="cert-block">
                <h3 class="cert-block-title">Patient Details</h3>
                <table class="cert-table">
                    <tr>
                        <td class="cert-label">Full Name</td>
                        <td class="cert-value">{{ $patient->name ?: '—' }}</td>
                        <td class="cert-label">Age</td>
                        <td class="cert-value">{{ $rxAge !== null ? $rxAge . ' yrs' : '—' }}</td>
                    </tr>
                    <tr>
                        <td class="cert-label">Student ID</td>
                        <td class="cert-value">{{ $patient->stud_id ?: '—' }}</td>
                        <td class="cert-label">MRN</td>
                        <td class="cert-value">{{ $patient->mrn ?: '—' }}</td>
                    </tr>
                </table>
            </section>

            @if ($visits->diagnosis)
                <section class="cert-block">
                    <h3 class="cert-block-title">Diagnosis</h3>
                    <p class="cert-text">{{ $visits->diagnosis }}</p>
                </section>
            @endif

            <section class="cert-block">
                <h3 class="cert-block-title">℞ Medicines</h3>
                <table class="rx-table">
                    <thead>
                        <tr>
                            <th class="rx-no">#</th>
                            <th>Medicine</th>
                            <th class="rx-qty">Qty</th>
                            <th class="rx-instr">Instructions / dosage</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach ($drugs as $i => $drug)
                            <tr>
                                <td class="rx-no">{{ $i + 1 }}</td>
                                <td class="rx-name">
                                    @foreach ($drugname as $name)
                                        @if ($name->id == $drug->drug_id){{ $name->m_name }}@endif
                                    @endforeach
                                </td>
                                <td class="rx-qty">{{ $drug->qty }}</td>
                                <td class="rx-instr"></td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>
            </section>

            <footer class="cert-foot">
                <div class="cert-sign">
                    <div class="cert-sign-line"></div>
                    <p class="cert-sign-name">Dr. {{ Auth::user()->name }}</p>
                    <p class="cert-sign-role">Attending Physician</p>
                </div>
                <div class="cert-stamp">
                    <span>Signature &amp; Stamp</span>
                </div>
            </footer>

            <p class="cert-confidential">
                CONFIDENTIAL: This prescription is issued for official medical purposes only and contains
                protected health information. Unauthorized disclosure is prohibited.
            </p>
        </div>
    </div>
@endsection

@push('styles')
    <style>
        .tnum { font-variant-numeric: tabular-nums; }

        /* Order-management pickers (add tests / add medicines) */
        .pick-toolbar { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; margin-bottom: 14px; }
        .pick-toolbar .search-box, .drug-toolbar .search-box { position: relative; flex: 1 1 240px; max-width: 360px; }
        .pick-toolbar .search-box i, .drug-toolbar .search-box i { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: var(--c-ink-muted); }
        .pick-toolbar .search-box input, .drug-toolbar .search-box input { padding-left: 40px; }
        .drug-toolbar { margin-bottom: 16px; }
        .pick-list { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; }
        @media (max-width: 767px) { .pick-list { grid-template-columns: 1fr; } }
        .pick-item {
            display: flex; align-items: center; gap: 12px; cursor: pointer; margin: 0;
            border: 1.5px solid var(--c-border); border-radius: var(--radius-sm);
            padding: 11px 14px; transition: border-color var(--t-fast), background var(--t-fast);
        }
        .pick-item:hover { border-color: var(--c-primary-300); background: var(--c-primary-50); }
        .pick-item .pick-check { position: absolute; opacity: 0; pointer-events: none; }
        .pick-item .pick-box {
            width: 20px; height: 20px; min-width: 20px; border-radius: 6px;
            border: 2px solid var(--c-border); display: grid; place-items: center;
            color: #fff; transition: background var(--t-fast), border-color var(--t-fast);
        }
        .pick-item .pick-box i { font-size: 11px; opacity: 0; }
        .pick-item .pick-label { font-weight: 600; color: var(--c-ink); font-size: 14px; }
        .pick-item:has(.pick-check:checked) { border-color: var(--c-primary); background: var(--c-primary-50); }
        .pick-item:has(.pick-check:checked) .pick-box { background: var(--c-primary); border-color: var(--c-primary); }
        .pick-item:has(.pick-check:checked) .pick-box i { opacity: 1; }
        .pick-nomatch { grid-column: 1 / -1; text-align: center; color: var(--c-ink-muted); padding: 26px; font-weight: 600; }
        .pick-nomatch i { color: var(--c-primary-300); margin-right: 6px; }
        .drug-item { padding: 6px 0; border-bottom: 1px solid var(--c-border); }
        .drug-item:last-of-type { border-bottom: 0; }
        .treat-workspace .card { margin-bottom: 22px; animation: fadeIn .3s var(--ease) both; }
        .treat-workspace .card:nth-of-type(2) { animation-delay: .05s; }
        .treat-workspace .card:nth-of-type(3) { animation-delay: .10s; }
        .treat-workspace .card:nth-of-type(4) { animation-delay: .15s; }

        .treat-header { box-shadow: var(--shadow-md); border: 0; background: linear-gradient(120deg, var(--c-primary-50), var(--c-surface) 60%); }
        .treat-avatar { width: 64px; height: 64px; font-size: 22px; flex: 0 0 auto; box-shadow: 0 8px 20px rgba(22,160,133,.18); }
        .treat-name { font-weight: 800; margin: 0 0 8px; color: var(--c-ink); }
        .treat-chips { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }
        .treat-chip {
            display: inline-flex; align-items: center; gap: 6px;
            background: var(--c-surface); border: 1px solid var(--c-border);
            border-radius: var(--radius-pill); padding: .34em .8em;
            font-size: 12.5px; font-weight: 700; color: var(--c-ink-soft);
        }
        .treat-chip i { color: var(--c-primary); }

        .treat-summary { position: sticky; top: 16px; }
        .summary-list .summary-item {
            display: flex; justify-content: space-between; align-items: baseline; gap: 14px;
            padding: 11px 0; border-bottom: 1px solid var(--c-border);
        }
        .summary-list .summary-item:last-child { border-bottom: 0; padding-bottom: 0; }
        .summary-list dt { font-weight: 700; color: var(--c-ink-muted); font-size: 12.5px; text-transform: uppercase; letter-spacing: .03em; margin: 0; }
        .summary-list dd { margin: 0; font-weight: 700; color: var(--c-ink); text-align: right; min-width: 0; word-break: break-word; }

        .treat-actionbar {
            display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 14px;
            background: var(--c-surface); border: 1px solid var(--c-border);
            border-radius: var(--radius); box-shadow: var(--shadow-sm);
            padding: 18px 22px; margin-bottom: 28px;
        }
        .treat-actionbar i { color: var(--c-primary); }

        @media (max-width: 991px) {
            .treat-summary { position: static; }
            .treat-header-actions { width: 100%; }
        }

        /* Clinical history timeline */
        .hist-card { margin-top: 4px; }
        .hist-count { font-size: 12px; font-weight: 700; color: var(--c-primary-700); background: var(--c-primary-50); padding: 4px 11px; border-radius: 999px; }
        .hist-timeline { position: relative; padding-left: 8px; }
        .hist-item { position: relative; padding: 0 0 18px 26px; border-left: 2px solid var(--c-border); }
        .hist-item:last-child { border-left-color: transparent; padding-bottom: 0; }
        .hist-dot { position: absolute; left: -8px; top: 2px; width: 14px; height: 14px; border-radius: 50%; background: #fff; border: 3px solid var(--c-primary-300); box-shadow: 0 0 0 3px var(--c-surface); }
        .hist-item:first-child .hist-dot { border-color: var(--c-primary); }
        .hist-body { background: var(--c-bg); border: 1px solid var(--c-border); border-radius: var(--radius-sm); padding: 14px 16px; transition: box-shadow var(--t-fast); }
        .hist-body:hover { box-shadow: var(--shadow-sm); }
        .hist-top { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; margin-bottom: 10px; }
        .hist-date { font-weight: 800; color: var(--c-ink); font-size: 13.5px; }
        .hist-date i, .hist-doc i { color: var(--c-primary); margin-right: 5px; }
        .hist-doc { font-size: 12.5px; font-weight: 600; color: var(--c-ink-soft); }
        .hist-top .status-pill { margin-left: auto; }
        .hist-fields { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
        .hist-field .hist-label { display: block; font-size: 10.5px; font-weight: 800; letter-spacing: .05em; text-transform: uppercase; color: var(--c-ink-muted); margin-bottom: 3px; }
        .hist-field p { margin: 0; font-size: 13.5px; color: var(--c-ink); white-space: pre-line; }
        .hist-tags { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 10px; }
        .hist-tag { display: inline-flex; align-items: center; gap: 6px; font-size: 11.5px; font-weight: 700; color: var(--c-ink-soft); background: #fff; border: 1px solid var(--c-border); border-radius: 999px; padding: 3px 11px; }
        .hist-tag i { color: var(--c-primary); }
        button.hist-tag.is-click { cursor: pointer; transition: background var(--t-fast), border-color var(--t-fast); }
        button.hist-tag.is-click:hover { background: var(--c-primary-50); border-color: var(--c-primary-300); color: var(--c-primary-700); }
        button.hist-tag.is-click .fa-search-plus { font-size: 10px; opacity: .6; }
        .hist-pop-table { width: 100%; border-collapse: collapse; text-align: left; }
        .hist-pop-table th { background: var(--c-primary-50); color: var(--c-primary-700); font-size: 11px; text-transform: uppercase; letter-spacing: .04em; padding: 9px 12px; }
        .hist-pop-table td { border-top: 1px solid var(--c-border); padding: 9px 12px; font-size: 13.5px; color: var(--c-ink); }
        @media (max-width: 767px) { .hist-fields { grid-template-columns: 1fr; } }
    </style>
@endpush

@push('scripts')
    <script type="text/javascript">
        function printSickLeave() {
            var doc = document.getElementById('sickLeaveDoc');
            if (!doc) { return; }

            var certCss = ''
                + '@page { size: A4; margin: 18mm 16mm; }'
                + '* { box-sizing: border-box; }'
                + 'html, body { margin: 0; padding: 0; }'
                + 'body { font-family: "Georgia", "Times New Roman", serif; color: #111; background: #fff; line-height: 1.55; -webkit-print-color-adjust: exact; print-color-adjust: exact; }'
                + '.cert-sheet { max-width: 178mm; margin: 0 auto; padding: 6mm 2mm; }'
                + '.cert-head { display: flex; align-items: center; gap: 16px; border-bottom: 3px solid #16a085; padding-bottom: 14px; }'
                + '.cert-logo { width: 66px; height: 66px; object-fit: contain; }'
                + '.cert-org h1 { font-size: 20px; margin: 0; letter-spacing: .2px; color: #111; }'
                + '.cert-org-sub { margin: 4px 0 0; font-size: 11px; color: #555; font-family: Arial, Helvetica, sans-serif; }'
                + '.cert-title { text-align: center; font-size: 16px; letter-spacing: 1.5px; text-transform: uppercase; margin: 26px 0 18px; padding-bottom: 6px; border-bottom: 1px solid #ccc; }'
                + '.cert-meta { display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 22px; font-family: Arial, Helvetica, sans-serif; }'
                + '.cert-block { margin-bottom: 22px; }'
                + '.cert-block-title { font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #16a085; border-bottom: 1px solid #e0e0e0; padding-bottom: 4px; margin: 0 0 12px; font-family: Arial, Helvetica, sans-serif; }'
                + '.cert-table { width: 100%; border-collapse: collapse; font-size: 13px; }'
                + '.cert-table td { padding: 7px 6px; border-bottom: 1px solid #eee; vertical-align: top; }'
                + '.cert-label { width: 110px; color: #555; font-family: Arial, Helvetica, sans-serif; font-size: 11px; text-transform: uppercase; letter-spacing: .4px; }'
                + '.cert-value { font-weight: bold; }'
                + '.cert-text { font-size: 14px; margin: 0 0 12px; text-align: justify; }'
                + '.cert-blank { display: inline-block; min-width: 120px; border-bottom: 1px solid #333; }'
                + '.cert-blank-sm { display: inline-block; min-width: 44px; border-bottom: 1px solid #333; }'
                + '.cert-foot { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 48px; }'
                + '.cert-sign-line { width: 220px; border-top: 1px solid #333; margin-bottom: 6px; }'
                + '.cert-sign-name { margin: 0; font-weight: bold; font-size: 14px; }'
                + '.cert-sign-role { margin: 2px 0 0; font-size: 11px; color: #555; font-family: Arial, Helvetica, sans-serif; }'
                + '.cert-stamp { width: 130px; height: 90px; border: 1.5px dashed #999; border-radius: 6px; display: flex; align-items: center; justify-content: center; color: #aaa; font-size: 11px; font-family: Arial, Helvetica, sans-serif; text-transform: uppercase; letter-spacing: 1px; }'
                + '.cert-confidential { margin-top: 40px; padding-top: 10px; border-top: 1px solid #e0e0e0; font-size: 10px; color: #888; font-family: Arial, Helvetica, sans-serif; text-align: center; }';

            var win = window.open('', '_blank', 'width=900,height=1100');
            if (!win) { return; }

            win.document.open();
            win.document.write(
                '<!DOCTYPE html><html><head><meta charset="utf-8">'
                + '<title>Medical Certificate</title>'
                + '<style>' + certCss + '</style></head><body>'
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
            // Print once the document (incl. the logo image) has loaded.
            win.onload = doPrint;
            // Fallback if onload already fired (cached/instant render).
            setTimeout(doPrint, 600);
        }

        function printPrescription() {
            var doc = document.getElementById('prescriptionDoc');
            if (!doc) { return; }

            var rxCss = ''
                + '@page { size: A4; margin: 18mm 16mm; }'
                + '* { box-sizing: border-box; }'
                + 'html, body { margin: 0; padding: 0; }'
                + 'body { font-family: "Georgia", "Times New Roman", serif; color: #111; background: #fff; line-height: 1.55; -webkit-print-color-adjust: exact; print-color-adjust: exact; }'
                + '.cert-sheet { max-width: 178mm; margin: 0 auto; padding: 6mm 2mm; }'
                + '.cert-head { display: flex; align-items: center; gap: 16px; border-bottom: 3px solid #16a085; padding-bottom: 14px; }'
                + '.cert-logo { width: 66px; height: 66px; object-fit: contain; }'
                + '.cert-org h1 { font-size: 20px; margin: 0; letter-spacing: .2px; color: #111; }'
                + '.cert-org-sub { margin: 4px 0 0; font-size: 11px; color: #555; font-family: Arial, Helvetica, sans-serif; }'
                + '.cert-title { text-align: center; font-size: 16px; letter-spacing: 1.5px; text-transform: uppercase; margin: 26px 0 18px; padding-bottom: 6px; border-bottom: 1px solid #ccc; }'
                + '.cert-meta { display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 22px; font-family: Arial, Helvetica, sans-serif; }'
                + '.cert-block { margin-bottom: 22px; }'
                + '.cert-block-title { font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #16a085; border-bottom: 1px solid #e0e0e0; padding-bottom: 4px; margin: 0 0 12px; font-family: Arial, Helvetica, sans-serif; }'
                + '.cert-table { width: 100%; border-collapse: collapse; font-size: 13px; }'
                + '.cert-table td { padding: 7px 6px; border-bottom: 1px solid #eee; vertical-align: top; }'
                + '.cert-label { width: 110px; color: #555; font-family: Arial, Helvetica, sans-serif; font-size: 11px; text-transform: uppercase; letter-spacing: .4px; }'
                + '.cert-value { font-weight: bold; }'
                + '.cert-text { font-size: 14px; margin: 0 0 12px; text-align: justify; }'
                + '.rx-table { width: 100%; border-collapse: collapse; font-size: 13px; }'
                + '.rx-table th { background: #f4faf8; color: #16a085; font-size: 11px; text-transform: uppercase; letter-spacing: .4px; text-align: left; padding: 8px 8px; border-bottom: 1.5px solid #16a085; font-family: Arial, Helvetica, sans-serif; }'
                + '.rx-table td { padding: 12px 8px; border-bottom: 1px solid #e0e0e0; vertical-align: top; }'
                + '.rx-table .rx-no { width: 34px; color: #555; }'
                + '.rx-table .rx-name { font-weight: bold; }'
                + '.rx-table .rx-qty { width: 60px; text-align: center; }'
                + '.rx-table .rx-instr { width: 46%; border-bottom: 1px solid #999; }'
                + '.cert-foot { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 48px; }'
                + '.cert-sign-line { width: 220px; border-top: 1px solid #333; margin-bottom: 6px; }'
                + '.cert-sign-name { margin: 0; font-weight: bold; font-size: 14px; }'
                + '.cert-sign-role { margin: 2px 0 0; font-size: 11px; color: #555; font-family: Arial, Helvetica, sans-serif; }'
                + '.cert-stamp { width: 130px; height: 90px; border: 1.5px dashed #999; border-radius: 6px; display: flex; align-items: center; justify-content: center; color: #aaa; font-size: 11px; font-family: Arial, Helvetica, sans-serif; text-transform: uppercase; letter-spacing: 1px; text-align: center; }'
                + '.cert-confidential { margin-top: 40px; padding-top: 10px; border-top: 1px solid #e0e0e0; font-size: 10px; color: #888; font-family: Arial, Helvetica, sans-serif; text-align: center; }';

            var win = window.open('', '_blank', 'width=900,height=1100');
            if (!win) { return; }

            win.document.open();
            win.document.write(
                '<!DOCTYPE html><html><head><meta charset="utf-8">'
                + '<title>Prescription</title>'
                + '<style>' + rxCss + '</style></head><body>'
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
            // Print once the document (incl. the logo image) has loaded.
            win.onload = doPrint;
            // Fallback if onload already fired (cached/instant render).
            setTimeout(doPrint, 600);
        }

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

        // Simple search filter for the add-tests / add-medicines pickers.
        function wireSearch(searchId, listId, itemSelector, noMatchId) {
            var search = document.getElementById(searchId);
            var list = document.getElementById(listId);
            if (!search || !list) { return; }
            var items = Array.prototype.slice.call(list.querySelectorAll(itemSelector));
            var noMatch = document.getElementById(noMatchId);
            search.addEventListener('input', function () {
                var q = (search.value || '').trim().toLowerCase();
                var shown = 0;
                items.forEach(function (it) {
                    var match = it.getAttribute('data-name').indexOf(q) !== -1;
                    it.style.display = match ? '' : 'none';
                    if (match) { shown++; }
                });
                if (noMatch) { noMatch.style.display = shown ? 'none' : 'block'; }
            });
        }
        wireSearch('addTestSearch', 'addTestList', '.pick-item', 'addTestNoMatch');
        wireSearch('addDrugSearch', 'addDrugList', '.drug-item', 'addDrugNoMatch');
    </script>
@endpush
