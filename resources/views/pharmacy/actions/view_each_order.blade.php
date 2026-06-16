@extends('layouts.portal')

@section('title', 'Drug Order')

@section('content')
    @php($itemPill = fn ($s) => in_array($s, ['Done', 'Completed']) ? 'is-completed' : ($s === 'In progress' || $s === 'Pending' ? 'is-pending' : ($s === 'Skipped' ? 'is-danger' : 'is-queued')))
    <div class="page-head">
        <div>
            <h4 class="page-title">Drug Order — Patient #{{ $patient->id }}</h4>
            <div class="page-sub">Review and confirm the medicines ordered for this patient.</div>
        </div>
        <a href="/view_orderd_drugs" class="btn btn-light-soft">
            <i class="fa fa-arrow-left"></i> Back to orders
        </a>
    </div>

    <div class="row">
        <div class="col-lg-10 mx-auto">
            {{-- Patient summary --}}
            <div class="card">
                <div class="card-body">
                    <div class="row">
                        <div class="col-md-6">
                            <p class="mb-2"><span class="text-muted-2">Name:</span> <b>{{ $patient->name }}</b></p>
                            <p class="mb-2"><span class="text-muted-2">MRN:</span> <b>{{ $patient->mrn }}</b></p>
                            <p class="mb-2"><span class="text-muted-2">ID:</span> <b>{{ $patient->stud_id }}</b></p>
                        </div>
                        <div class="col-md-6">
                            <p class="mb-2"><span class="text-muted-2">Department:</span> <b>{{ $patient->dept }}</b></p>
                            <p class="mb-2"><span class="text-muted-2">Year:</span> <b>{{ $patient->year }}</b></p>
                            <p class="mb-2"><span class="text-muted-2">Doctor:</span> <b>{{ $doctor->name }}</b></p>
                        </div>
                    </div>
                </div>
            </div>

            {{-- Ordered medicines + confirm-all --}}
            <form action="/confirm_all/{{ $DrugsOrder->id }}" method="POST" enctype="multipart/form-data">
                @csrf
                <div class="card">
                    <div class="card-header">
                        <h4 class="card-title mb-0">Ordered Medicines</h4>
                    </div>
                    <div class="card-body">
                        @if ($visits->order_drug_id == '')
                            <div class="empty-state">
                                <div class="empty-icon"><i class="fa fa-medkit"></i></div>
                                <h5>No medicines ordered</h5>
                                <a href="/order_drug/{{ $visits->id }}" class="btn btn-primary mt-2">
                                    <i class="fa fa-plus"></i> Order drug
                                </a>
                            </div>
                        @else
                            <div class="table-responsive">
                                <table class="table custom-table mb-0">
                                    <thead>
                                        <tr>
                                            <th>Ordered Drug</th>
                                            <th>Quantity</th>
                                            <th>Status</th>
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
                                                <td class="num">{{ $drug->qty }}</td>
                                                <td>
                                                    <span class="status-pill {{ $itemPill($drug->status) }}">{{ $drug->status }}</span>
                                                </td>
                                            </tr>
                                        @endforeach
                                    </tbody>
                                </table>
                            </div>
                        @endif
                    </div>
                    @if ($visits->order_drug_id != '' && (!$DrugsOrder || $DrugsOrder->status != 'Completed'))
                        <div class="card-footer text-center">
                            <button type="submit" class="btn btn-primary">
                                <i class="fa fa-check"></i> Confirm Order
                            </button>
                        </div>
                    @endif
                </div>
            </form>

            {{-- Per-drug status lifecycle. Editable even after the doctor completed the
                 visit (pharmacy works off-site), so this is NOT gated on visit status. --}}
            @if ($visits->order_drug_id != '' && $DrugsOrder && count($drugs))
                <div class="card">
                    <div class="card-header">
                        <h4 class="card-title mb-0"><i class="fa fa-tasks"></i> Dispensing status</h4>
                    </div>
                    <div class="card-body">
                        <div class="table-responsive">
                            <table class="table custom-table mb-0">
                                <thead>
                                    <tr>
                                        <th>Drug</th>
                                        <th>Current status</th>
                                        <th style="min-width:230px">Update status</th>
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
                                            <td><span class="status-pill {{ $itemPill($drug->status) }}">{{ $drug->status }}</span></td>
                                            <td>
                                                <form action="/drug_ordered/{{ $drug->id }}/status" method="POST"
                                                    class="d-flex gap-2">
                                                    @csrf
                                                    <select name="status" class="form-control form-control-sm">
                                                        @foreach (['Not started', 'In progress', 'Done', 'Skipped'] as $opt)
                                                            <option value="{{ $opt }}"
                                                                @if ($drug->status == $opt) selected @endif>{{ $opt }}</option>
                                                        @endforeach
                                                    </select>
                                                    <button type="submit" class="btn btn-light-soft btn-sm">Update</button>
                                                </form>
                                            </td>
                                        </tr>
                                    @endforeach
                                </tbody>
                            </table>
                        </div>
                        <div class="text-muted-2 mt-2" style="font-size:12.5px">
                            <i class="fa fa-info-circle"></i> Marking a drug <b>Done</b> deducts it from stock once.
                        </div>
                    </div>
                </div>
            @endif
        </div>
    </div>

    @push('styles')
        <style>
            .table td.num { font-variant-numeric: tabular-nums; }
        </style>
    @endpush
@endsection
