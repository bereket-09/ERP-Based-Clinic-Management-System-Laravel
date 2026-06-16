@extends('layouts.portal')

@section('title', 'Order Lab Test')

@section('content')
    <div class="row">
        <div class="col-lg-8 offset-lg-2">
            <div class="page-head">
                <div>
                    <h4 class="page-title">Order lab test
                        <span class="text-success">#{{ $patient->id }}</span></h4>
                    <div class="page-sub">Search and select the tests to order for this patient's visit.</div>
                </div>
                <a href="/treat/{{ $visits->id }}" class="btn btn-light-soft"><i class="fa fa-arrow-left"></i> Back</a>
            </div>

            {{-- Patient information --}}
            <div class="card">
                <div class="card-header">
                    <h4 class="card-title mb-0"><i class="fa fa-user-o"></i> Patient information</h4>
                </div>
                <div class="card-body">
                    <div class="row">
                        <div class="col-md-6"><p class="mb-2"><strong>Name:</strong> {{ $patient->name }}</p></div>
                        <div class="col-md-6"><p class="mb-2"><strong>MRN:</strong> {{ $patient->mrn }}</p></div>
                        <div class="col-md-6"><p class="mb-2"><strong>ID:</strong> {{ $patient->stud_id }}</p></div>
                        <div class="col-md-6"><p class="mb-2"><strong>Departement:</strong> {{ $patient->dept }}</p></div>
                        <div class="col-md-6"><p class="mb-0"><strong>Year:</strong> {{ $patient->year }}</p></div>
                    </div>
                </div>
            </div>

            <form action="/order_lab_test/{{ $visits->id }}" method="get" enctype="multipart/form-data">
                @csrf
                <div class="card">
                    <div class="card-header d-flex align-items-center justify-content-between">
                        <h4 class="card-title mb-0"><i class="fa fa-flask"></i> Available lab tests</h4>
                        @if (count($test))
                            <span class="pick-count"><strong id="testCount">0</strong> selected</span>
                        @endif
                    </div>
                    <div class="card-body">
                        @if (count($test))
                            <div class="pick-toolbar">
                                <div class="search-box">
                                    <i class="fa fa-search"></i>
                                    <input type="text" class="form-control" id="testSearch"
                                        placeholder="Search lab tests…" autocomplete="off">
                                </div>
                                <div class="pick-actions">
                                    <button type="button" class="btn btn-light-soft btn-sm" id="testSelectAll"><i class="fa fa-check-square-o"></i> Select all</button>
                                    <button type="button" class="btn btn-light-soft btn-sm" id="testClear"><i class="fa fa-eraser"></i> Clear</button>
                                </div>
                            </div>
                        @endif

                        <div id="testList" class="pick-list">
                            @forelse ($test as $tests)
                                <label class="pick-item" data-name="{{ strtolower($tests->name) }}">
                                    <input type="checkbox" class="pick-check" name="testType[]" value="{{ $tests->name }}">
                                    <span class="pick-box"><i class="fa fa-check"></i></span>
                                    <span class="pick-label">{{ $tests->name }}</span>
                                </label>
                            @empty
                                <div class="empty-state">
                                    <div class="empty-icon"><i class="fa fa-flask"></i></div>
                                    <h5>No lab tests available</h5>
                                    <p>There are no lab tests configured to order.</p>
                                </div>
                            @endforelse
                            <div class="pick-nomatch" id="testNoMatch" style="display:none">
                                <i class="fa fa-search"></i> No tests match your search.
                            </div>
                        </div>
                    </div>
                    @if (count($test))
                        <div class="card-footer text-center">
                            <input type="submit" class="btn btn-primary" value="Order Lab Test">
                        </div>
                    @endif
                </div>
            </form>
        </div>
    </div>

    @push('styles')
    <style>
        .pick-toolbar { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; margin-bottom: 14px; }
        .pick-toolbar .search-box { position: relative; flex: 1 1 240px; }
        .pick-toolbar .search-box i { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: var(--c-ink-muted); }
        .pick-toolbar .search-box input { padding-left: 40px; }
        .pick-actions { display: flex; gap: 8px; align-items: center; }
        .pick-count { font-size: 12.5px; font-weight: 700; color: var(--c-primary-700); background: var(--c-primary-50); padding: 4px 12px; border-radius: 999px; }

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
        .pick-item:has(.pick-check:checked),
        .pick-item.is-checked {
            border-color: var(--c-primary); background: var(--c-primary-50);
        }
        .pick-item:has(.pick-check:checked) .pick-box,
        .pick-item.is-checked .pick-box { background: var(--c-primary); border-color: var(--c-primary); }
        .pick-item:has(.pick-check:checked) .pick-box i,
        .pick-item.is-checked .pick-box i { opacity: 1; }
        .pick-nomatch { grid-column: 1 / -1; text-align: center; color: var(--c-ink-muted); padding: 26px; font-weight: 600; }
        .pick-nomatch i { color: var(--c-primary-300); margin-right: 6px; }
    </style>
    @endpush

    @push('scripts')
    <script>
        (function () {
            var search = document.getElementById('testSearch');
            var list = document.getElementById('testList');
            if (!list) { return; }
            var items = Array.prototype.slice.call(list.querySelectorAll('.pick-item'));
            var noMatch = document.getElementById('testNoMatch');
            var countEl = document.getElementById('testCount');

            function updateCount() {
                var n = items.filter(function (it) { return it.querySelector('.pick-check').checked; }).length;
                if (countEl) { countEl.textContent = n; }
                items.forEach(function (it) { it.classList.toggle('is-checked', it.querySelector('.pick-check').checked); });
            }
            function filter() {
                var q = (search.value || '').trim().toLowerCase();
                var shown = 0;
                items.forEach(function (it) {
                    var match = it.getAttribute('data-name').indexOf(q) !== -1;
                    it.style.display = match ? '' : 'none';
                    if (match) { shown++; }
                });
                if (noMatch) { noMatch.style.display = shown ? 'none' : 'block'; }
            }

            if (search) { search.addEventListener('input', filter); }
            list.addEventListener('change', updateCount);

            var selectAll = document.getElementById('testSelectAll');
            var clear = document.getElementById('testClear');
            if (selectAll) {
                selectAll.addEventListener('click', function () {
                    items.forEach(function (it) { if (it.style.display !== 'none') { it.querySelector('.pick-check').checked = true; } });
                    updateCount();
                });
            }
            if (clear) {
                clear.addEventListener('click', function () {
                    items.forEach(function (it) { it.querySelector('.pick-check').checked = false; });
                    updateCount();
                });
            }
            updateCount();
        })();
    </script>
    @endpush
@endsection
