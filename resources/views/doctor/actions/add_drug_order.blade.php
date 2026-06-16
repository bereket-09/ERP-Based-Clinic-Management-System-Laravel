@extends('layouts.portal')

@section('title', 'Order Drug')

@section('content')
    <div class="row">
        <div class="col-lg-8 offset-lg-2">
            <div class="page-head">
                <div>
                    <h4 class="page-title">Order drug
                        <span class="text-success">#{{ $patient->id }}</span></h4>
                    <div class="page-sub">Set the quantity for each medicine to prescribe.</div>
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

            <form action="/order-drugs/{{ $visits->id }}" method="get" enctype="multipart/form-data">
                @csrf
                <div class="card">
                    <div class="card-header">
                        <h4 class="card-title mb-0"><i class="fa fa-medkit"></i> Available medicines</h4>
                    </div>
                    <div class="card-body">
                        @if (count($drugs))
                            <div class="drug-toolbar">
                                <div class="search-box">
                                    <i class="fa fa-search"></i>
                                    <input type="text" class="form-control" id="drugSearch"
                                        placeholder="Search medicines…" autocomplete="off">
                                </div>
                            </div>
                        @endif
                        <div id="drugList">
                            @forelse ($drugs as $drug)
                                <div class="form-group row align-items-center drug-item" data-name="{{ strtolower($drug->m_name) }}">
                                    <label class="col-sm-7 col-form-label mb-0">
                                        <strong>{{ $drug->m_name }}</strong>
                                        <span class="text-muted-2">(in stock: {{ $drug->total }})</span>
                                    </label>
                                    <div class="col-sm-5">
                                        <input type="hidden" value="{{ $drug->m_name }}" name="drugName[]">
                                        <input type="number" class="form-control" min="0" max="{{ $drug->total }}"
                                            name="drugType[]" placeholder="Quantity">
                                    </div>
                                </div>
                            @empty
                                <div class="empty-state">
                                    <div class="empty-icon"><i class="fa fa-medkit"></i></div>
                                    <h5>No medicines available</h5>
                                    <p>There are no medicines in stock to order.</p>
                                </div>
                            @endforelse
                            <div class="pick-nomatch" id="drugNoMatch" style="display:none">
                                <i class="fa fa-search"></i> No medicines match your search.
                            </div>
                        </div>
                    </div>
                    @if (count($drugs))
                        <div class="card-footer text-center">
                            <input type="submit" class="btn btn-primary" value="Order Drug">
                        </div>
                    @endif
                </div>
            </form>
        </div>
    </div>

    @push('styles')
    <style>
        .drug-toolbar { margin-bottom: 16px; }
        .drug-toolbar .search-box { position: relative; max-width: 360px; }
        .drug-toolbar .search-box i { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: var(--c-ink-muted); }
        .drug-toolbar .search-box input { padding-left: 40px; }
        .drug-item { padding: 6px 0; border-bottom: 1px solid var(--c-border); }
        .drug-item:last-of-type { border-bottom: 0; }
        .pick-nomatch { text-align: center; color: var(--c-ink-muted); padding: 26px; font-weight: 600; }
        .pick-nomatch i { color: var(--c-primary-300); margin-right: 6px; }
    </style>
    @endpush

    @push('scripts')
    <script>
        (function () {
            var search = document.getElementById('drugSearch');
            var list = document.getElementById('drugList');
            if (!search || !list) { return; }
            var items = Array.prototype.slice.call(list.querySelectorAll('.drug-item'));
            var noMatch = document.getElementById('drugNoMatch');
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
        })();
    </script>
    @endpush
@endsection
