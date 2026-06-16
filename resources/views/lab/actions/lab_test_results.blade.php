@extends('layouts.portal')

@section('title', 'Lab Test Results')

@section('content')
    <div class="row">
        <div class="col-lg-9 col-xl-8 offset-lg-1 offset-xl-2">
            <div class="page-head">
                <div>
                    <h4 class="page-title">Lab Test Results</h4>
                    <div class="page-sub">Order #{{ $orders->id }} ·
                        <span class="status-pill
                            @if ($orders->status === 'Completed') is-completed
                            @elseif ($orders->status === 'Pending') is-pending
                            @else is-queued @endif">{{ $orders->status }}</span>
                    </div>
                </div>
                <a href="/view_lab_order" class="btn btn-light-soft btn-rounded">
                    <i class="fa fa-arrow-left"></i> Back to orders
                </a>
            </div>

            {{-- Patient summary --}}
            <div class="card">
                <div class="card-body">
                    <div class="row lab-meta">
                        <div class="col-sm-6 mb-2">
                            <span class="text-muted-2 d-block">Name</span>
                            <strong>{{ $patient->name }}</strong>
                        </div>
                        <div class="col-sm-3 mb-2">
                            <span class="text-muted-2 d-block">MRN</span>
                            <strong>{{ $patient->mrn }}</strong>
                        </div>
                        <div class="col-sm-3 mb-2">
                            <span class="text-muted-2 d-block">Patient ID</span>
                            <strong>{{ $patient->stud_id }}</strong>
                        </div>
                        <div class="col-sm-6 mb-2">
                            <span class="text-muted-2 d-block">Department</span>
                            <strong>{{ $patient->dept }}</strong>
                        </div>
                        <div class="col-sm-3 mb-2">
                            <span class="text-muted-2 d-block">Year</span>
                            <strong>{{ $patient->year }}</strong>
                        </div>
                    </div>
                </div>
            </div>

            {{-- Results entry --}}
            <div class="card">
                <div class="card-body">
                    <h5 class="mb-3"><i class="fa fa-flask text-primary"></i> Enter Test Results</h5>

                    <form action="/save_results/{{ $orders->id }}" method="POST" enctype="multipart/form-data" id="myForm">
                        @csrf
                        @php($hasResults = false)
                        @php($rowIndex = 0)
                        @foreach ($results as $result)
                            @if ($result->o_id == $orders->id)
                                @php($hasResults = true)
                                @php($rowIndex++)
                                <div class="form-group result-row" style="--i: {{ $rowIndex }}">
                                    <label class="form-label">
                                        @foreach ($test as $tests)
                                            @if ($tests->id == $result->test_id)
                                                {{ $tests->name }}
                                            @endif
                                        @endforeach
                                    </label>
                                    <input class="form-control" type="text" name="testResult[]"
                                        value="{{ $result->Result_of_Test }}" placeholder="Enter the result of this test">
                                    <div class="input-hint">Leave blank if not yet measured.</div>
                                </div>
                            @endif
                        @endforeach

                        @if (! $hasResults)
                            <div class="empty-state">
                                <div class="empty-icon"><i class="fa fa-flask"></i></div>
                                <h5>No tests on this order</h5>
                                <p>There are no lab tests attached to this order.</p>
                            </div>
                        @else
                            <div class="d-flex flex-wrap gap-2 mt-4">
                                <button type="submit" class="btn btn-light-soft" name="submit" value="Save Results">
                                    <i class="fa fa-save"></i> Save Results
                                </button>
                                <button type="submit" class="btn btn-primary" name="submit"
                                    value="Submit Test Results to Doctor">
                                    <i class="fa fa-paper-plane"></i> Submit Results to Doctor
                                </button>
                            </div>
                        @endif
                    </form>
                </div>
            </div>

            {{-- Per-test status lifecycle (own forms, separate from the results form) --}}
            @if ($hasResults)
                @php($itemPill = fn ($s) => in_array($s, ['Done', 'Completed']) ? 'is-completed' : ($s === 'In progress' || $s === 'Pending' ? 'is-pending' : ($s === 'Skipped' ? 'is-danger' : 'is-queued')))
                <div class="card">
                    <div class="card-header">
                        <h4 class="card-title mb-0"><i class="fa fa-tasks"></i> Test status</h4>
                    </div>
                    <div class="card-body">
                        <div class="table-responsive">
                            <table class="table custom-table mb-0">
                                <thead>
                                    <tr>
                                        <th>Test</th>
                                        <th>Current status</th>
                                        <th style="min-width:230px">Update status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    @foreach ($results as $result)
                                        @if ($result->o_id == $orders->id)
                                            <tr>
                                                <td>
                                                    @foreach ($test as $tests)
                                                        @if ($tests->id == $result->test_id)
                                                            <b>{{ $tests->name }}</b>
                                                        @endif
                                                    @endforeach
                                                </td>
                                                <td><span class="status-pill {{ $itemPill($result->status) }}">{{ $result->status }}</span></td>
                                                <td>
                                                    <form action="/lab_result/{{ $result->id }}/status" method="POST"
                                                        class="d-flex gap-2">
                                                        @csrf
                                                        <select name="status" class="form-control form-control-sm">
                                                            @foreach (['Not started', 'In progress', 'Done', 'Skipped'] as $opt)
                                                                <option value="{{ $opt }}"
                                                                    @if ($result->status == $opt) selected @endif>{{ $opt }}</option>
                                                            @endforeach
                                                        </select>
                                                        <button type="submit" class="btn btn-light-soft btn-sm">Update</button>
                                                    </form>
                                                </td>
                                            </tr>
                                        @endif
                                    @endforeach
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            @endif
        </div>
    </div>

    @push('styles')
        <style>
            .result-row { animation: fadeIn .3s var(--ease) backwards; animation-delay: calc(var(--i, 0) * .05s); }
            .lab-meta strong { font-variant-numeric: tabular-nums; }
        </style>
    @endpush
@endsection
