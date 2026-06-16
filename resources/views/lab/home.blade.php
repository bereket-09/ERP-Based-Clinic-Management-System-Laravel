@extends('layouts.portal')

@section('title', 'Laboratory Dashboard')

@section('content')
    <div class="page-head">
        <div>
            <h4 class="page-title">Laboratory Dashboard</h4>
            <div class="page-sub">Welcome back, {{ Auth::user()->name }}</div>
        </div>
    </div>

    {{-- Stat widgets (real counts) --}}
    <div class="row">
        <div class="col-md-6 col-lg-3">
            <a href="/view_lab_order" class="text-decoration-none">
                <div class="dash-widget">
                    <span class="stat-icon is-warning"><i class="fa fa-clock-o"></i></span>
                    <div class="dash-widget-info text-right">
                        <h3>{{ $LabQueue }}</h3>
                        <span class="widget-title3">Queued Orders</span>
                    </div>
                </div>
            </a>
        </div>
        <div class="col-md-6 col-lg-3">
            <a href="/view_pending_lab_results" class="text-decoration-none">
                <div class="dash-widget">
                    <span class="stat-icon is-info"><i class="fa fa-hourglass-half"></i></span>
                    <div class="dash-widget-info text-right">
                        <h3>{{ $LabPending }}</h3>
                        <span class="widget-title4">Pending Results</span>
                    </div>
                </div>
            </a>
        </div>
        <div class="col-md-6 col-lg-3">
            <a href="/view_completed_lab_results" class="text-decoration-none">
                <div class="dash-widget">
                    <span class="stat-icon is-success"><i class="fa fa-check-circle"></i></span>
                    <div class="dash-widget-info text-right">
                        <h3>{{ $LabCompleted }}</h3>
                        <span class="widget-title4">Completed Tests</span>
                    </div>
                </div>
            </a>
        </div>
        <div class="col-md-6 col-lg-3">
            <div class="dash-widget">
                <span class="stat-icon is-primary"><i class="fa fa-wheelchair"></i></span>
                <div class="dash-widget-info text-right">
                    <h3>{{ $patient }}</h3>
                    <span class="widget-title2">Total Patients</span>
                </div>
            </div>
        </div>
    </div>

    {{-- Quick actions --}}
    <div class="row mt-2">
        <div class="col-md-6 col-lg-3">
            <a href="/view_lab_order" class="card member-panel text-decoration-none d-block">
                <div class="card-body text-center">
                    <div class="stat-icon is-warning mx-auto mb-3"><i class="fa fa-stethoscope"></i></div>
                    <h6 class="mb-1">Ordered Tests</h6>
                    <span class="text-muted-2">Start queued lab orders</span>
                </div>
            </a>
        </div>
        <div class="col-md-6 col-lg-3">
            <a href="/view_pending_lab_results" class="card member-panel text-decoration-none d-block">
                <div class="card-body text-center">
                    <div class="stat-icon is-info mx-auto mb-3"><i class="fa fa-pencil-square-o"></i></div>
                    <h6 class="mb-1">Pending Results</h6>
                    <span class="text-muted-2">Edit saved results</span>
                </div>
            </a>
        </div>
        <div class="col-md-6 col-lg-3">
            <a href="/view_completed_lab_results" class="card member-panel text-decoration-none d-block">
                <div class="card-body text-center">
                    <div class="stat-icon is-success mx-auto mb-3"><i class="fa fa-check"></i></div>
                    <h6 class="mb-1">Completed Tests</h6>
                    <span class="text-muted-2">Review finished tests</span>
                </div>
            </a>
        </div>
        <div class="col-md-6 col-lg-3">
            <a href="/view_all_tests" class="card member-panel text-decoration-none d-block">
                <div class="card-body text-center">
                    <div class="stat-icon is-primary mx-auto mb-3"><i class="fa fa-flask"></i></div>
                    <h6 class="mb-1">Test Types</h6>
                    <span class="text-muted-2">Manage lab test catalogue</span>
                </div>
            </a>
        </div>
    </div>
@endsection
