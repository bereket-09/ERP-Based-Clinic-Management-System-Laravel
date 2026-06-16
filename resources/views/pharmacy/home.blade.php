@extends('layouts.portal')

@section('title', 'Pharmacy Dashboard')

@section('content')
    <div class="page-head">
        <div>
            <h4 class="page-title">Welcome, {{ Auth::user()->name }}</h4>
            <div class="page-sub">Overview of the pharmacy store and drug orders.</div>
        </div>
        <a href="/add_medicine" class="btn btn-primary btn-rounded">
            <i class="fa fa-plus"></i> Add medicine
        </a>
    </div>

    {{-- Stat widgets --}}
    <div class="row">
        <div class="col-md-6 col-xl-3">
            <div class="dash-widget">
                <span class="stat-icon is-primary"><i class="fa fa-book"></i></span>
                <div class="dash-widget-info">
                    <h3>{{ $DrugOrder }}</h3>
                    <span class="widget-title">Total drug orders</span>
                </div>
            </div>
        </div>
        <div class="col-md-6 col-xl-3">
            <div class="dash-widget">
                <span class="stat-icon is-info"><i class="fa fa-medkit"></i></span>
                <div class="dash-widget-info">
                    <h3>{{ $medicin }}</h3>
                    <span class="widget-title">Medicines in catalogue</span>
                </div>
            </div>
        </div>
        <div class="col-md-6 col-xl-3">
            <div class="dash-widget">
                <span class="stat-icon is-danger"><i class="fa fa-exclamation-triangle"></i></span>
                <div class="dash-widget-info">
                    <h3>{{ $expire }}</h3>
                    <span class="widget-title">Expired medicines</span>
                </div>
            </div>
        </div>
        <div class="col-md-6 col-xl-3">
            <div class="dash-widget">
                <span class="stat-icon is-success"><i class="fa fa-stethoscope"></i></span>
                <div class="dash-widget-info">
                    <h3>{{ $patient }}</h3>
                    <span class="widget-title">Registered patients</span>
                </div>
            </div>
        </div>
    </div>

    {{-- Quick actions --}}
    <div class="page-head mt-2">
        <h4 class="page-title">Quick actions</h4>
    </div>
    <div class="row">
        <div class="col-md-4">
            <a href="/view_all_drugs" class="card quick-action-card">
                <div class="card-body d-flex align-items-center">
                    <span class="stat-icon is-primary"><i class="fa fa-list"></i></span>
                    <div class="ml-3">
                        <h5 class="mb-0">All medicines</h5>
                        <span class="text-muted-2">Browse the full drug record</span>
                    </div>
                    <i class="fa fa-angle-right ml-auto quick-action-arrow"></i>
                </div>
            </a>
        </div>
        <div class="col-md-4">
            <a href="/view_instock_drugs" class="card quick-action-card">
                <div class="card-body d-flex align-items-center">
                    <span class="stat-icon is-success"><i class="fa fa-check-circle"></i></span>
                    <div class="ml-3">
                        <h5 class="mb-0">In-stock drugs</h5>
                        <span class="text-muted-2">Medicines available now</span>
                    </div>
                    <i class="fa fa-angle-right ml-auto quick-action-arrow"></i>
                </div>
            </a>
        </div>
        <div class="col-md-4">
            <a href="/view_outstock_drugs" class="card quick-action-card">
                <div class="card-body d-flex align-items-center">
                    <span class="stat-icon is-warning"><i class="fa fa-times-circle"></i></span>
                    <div class="ml-3">
                        <h5 class="mb-0">Out-of-stock drugs</h5>
                        <span class="text-muted-2">Needs restocking</span>
                    </div>
                    <i class="fa fa-angle-right ml-auto quick-action-arrow"></i>
                </div>
            </a>
        </div>
        <div class="col-md-4">
            <a href="/view_expired_drugs" class="card quick-action-card">
                <div class="card-body d-flex align-items-center">
                    <span class="stat-icon is-danger"><i class="fa fa-exclamation-triangle"></i></span>
                    <div class="ml-3">
                        <h5 class="mb-0">Expired drugs</h5>
                        <span class="text-muted-2">{{ $expire }} expired</span>
                    </div>
                    <i class="fa fa-angle-right ml-auto quick-action-arrow"></i>
                </div>
            </a>
        </div>
        <div class="col-md-4">
            <a href="/view_orderd_drugs" class="card quick-action-card">
                <div class="card-body d-flex align-items-center">
                    <span class="stat-icon is-info"><i class="fa fa-shopping-bag"></i></span>
                    <div class="ml-3">
                        <h5 class="mb-0">Ordered drugs</h5>
                        <span class="text-muted-2">Orders awaiting dispensing</span>
                    </div>
                    <i class="fa fa-angle-right ml-auto quick-action-arrow"></i>
                </div>
            </a>
        </div>
        <div class="col-md-4">
            <a href="/view_completed_drug_orders" class="card quick-action-card">
                <div class="card-body d-flex align-items-center">
                    <span class="stat-icon is-success"><i class="fa fa-check"></i></span>
                    <div class="ml-3">
                        <h5 class="mb-0">Completed orders</h5>
                        <span class="text-muted-2">Dispensed drug orders</span>
                    </div>
                    <i class="fa fa-angle-right ml-auto quick-action-arrow"></i>
                </div>
            </a>
        </div>
    </div>

    @push('styles')
        <style>
            .quick-action-card { display: block; text-decoration: none; color: inherit; transition: transform .15s ease, box-shadow .15s ease; }
            .quick-action-card:hover { transform: translateY(-2px); box-shadow: 0 .5rem 1.25rem rgba(22,160,133,.12); }
            .quick-action-card .ml-3 { margin-left: 1rem; }
            .quick-action-arrow { font-size: 1.4rem; color: var(--c-primary, #16a085); }
        </style>
    @endpush
@endsection
