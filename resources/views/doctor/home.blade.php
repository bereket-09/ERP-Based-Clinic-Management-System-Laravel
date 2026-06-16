@extends('layouts.portal')

@section('title', 'Doctor Dashboard')

@section('content')
    <div class="page-head">
        <div>
            <h4 class="page-title">Welcome, Dr. {{ Auth::user()->name }}</h4>
            <div class="page-sub">Here is an overview of your clinic activity today.</div>
        </div>
        <a href="/queued_patients" class="btn btn-primary btn-rounded">
            <i class="fa fa-stethoscope"></i> Start treating
        </a>
    </div>

    {{-- Stat widgets --}}
    <div class="row">
        <div class="col-md-6 col-xl-3">
            <div class="dash-widget">
                <span class="stat-icon is-warning"><i class="fa fa-clock-o"></i></span>
                <div class="dash-widget-info">
                    <h3>{{ $queued }}</h3>
                    <span class="widget-title">Queued patients</span>
                </div>
            </div>
        </div>
        <div class="col-md-6 col-xl-3">
            <div class="dash-widget">
                <span class="stat-icon is-info"><i class="fa fa-hourglass-half"></i></span>
                <div class="dash-widget-info">
                    <h3>{{ $pending }}</h3>
                    <span class="widget-title">Pending results</span>
                </div>
            </div>
        </div>
        <div class="col-md-6 col-xl-3">
            <div class="dash-widget">
                <span class="stat-icon is-success"><i class="fa fa-check-circle"></i></span>
                <div class="dash-widget-info">
                    <h3>{{ $Completed }}</h3>
                    <span class="widget-title">Completed treatments</span>
                </div>
            </div>
        </div>
        <div class="col-md-6 col-xl-3">
            <div class="dash-widget">
                <span class="stat-icon is-primary"><i class="fa fa-stethoscope"></i></span>
                <div class="dash-widget-info">
                    <h3>{{ $patient }}</h3>
                    <span class="widget-title">Registered patients</span>
                </div>
            </div>
        </div>
    </div>

    <div class="row">
        <div class="col-md-6 col-xl-3">
            <div class="dash-widget">
                <span class="stat-icon is-info"><i class="fa fa-flask"></i></span>
                <div class="dash-widget-info">
                    <h3>{{ $LabQueue }}</h3>
                    <span class="widget-title">Lab tests queued</span>
                </div>
            </div>
        </div>
        <div class="col-md-6 col-xl-3">
            <a href="/lab_results_ready" class="dash-widget" style="text-decoration:none">
                <span class="stat-icon is-success"><i class="fa fa-flask"></i></span>
                <div class="dash-widget-info">
                    <h3>{{ $labReady ?? $LabCompleted }}</h3>
                    <span class="widget-title">Lab results ready <i class="fa fa-arrow-right" style="font-size:11px;opacity:.6"></i></span>
                </div>
            </a>
        </div>
        <div class="col-md-6 col-xl-3">
            <div class="dash-widget">
                <span class="stat-icon is-primary"><i class="fa fa-book"></i></span>
                <div class="dash-widget-info">
                    <h3>{{ $DrugOrder }}</h3>
                    <span class="widget-title">Drug orders</span>
                </div>
            </div>
        </div>
        <div class="col-md-6 col-xl-3">
            <div class="dash-widget">
                <span class="stat-icon is-warning"><i class="fa fa-user-md"></i></span>
                <div class="dash-widget-info">
                    <h3>{{ $doctor }}</h3>
                    <span class="widget-title">Doctors on staff</span>
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
            <a href="/queued_patients" class="card quick-action-card">
                <div class="card-body d-flex align-items-center">
                    <span class="stat-icon is-warning"><i class="fa fa-clock-o"></i></span>
                    <div class="ml-3">
                        <h5 class="mb-0">My queued patients</h5>
                        <span class="text-muted-2">{{ $queued }} waiting to be seen</span>
                    </div>
                    <i class="fa fa-angle-right ml-auto quick-action-arrow"></i>
                </div>
            </a>
        </div>
        <div class="col-md-4">
            <a href="/pending_patients" class="card quick-action-card">
                <div class="card-body d-flex align-items-center">
                    <span class="stat-icon is-info"><i class="fa fa-hourglass-half"></i></span>
                    <div class="ml-3">
                        <h5 class="mb-0">Pending results</h5>
                        <span class="text-muted-2">{{ $pending }} awaiting lab / review</span>
                    </div>
                    <i class="fa fa-angle-right ml-auto quick-action-arrow"></i>
                </div>
            </a>
        </div>
        <div class="col-md-4">
            <a href="/completed_visits" class="card quick-action-card">
                <div class="card-body d-flex align-items-center">
                    <span class="stat-icon is-success"><i class="fa fa-check-circle"></i></span>
                    <div class="ml-3">
                        <h5 class="mb-0">Completed visits</h5>
                        <span class="text-muted-2">{{ $Completed }} treated</span>
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
