@extends('layouts.portal')

@section('title', 'Reception Dashboard')

@section('content')
    <div class="page-head">
        <div>
            <h4 class="page-title">Reception Dashboard</h4>
            <div class="page-sub">Welcome back, {{ Auth::user()->name }}.</div>
        </div>
        <a href="/search_patient" class="btn btn-primary btn-rounded">
            <i class="fa fa-plus"></i> New Patient
        </a>
    </div>

    {{-- Stat widgets (real counts from HomeController) --}}
    <div class="row">
        <div class="col-md-6 col-sm-6 col-lg-6 col-xl-3">
            <div class="dash-widget">
                <span class="stat-icon is-info"><i class="fa fa-stethoscope" aria-hidden="true"></i></span>
                <div class="dash-widget-info text-right">
                    <h3>{{ $patient }}</h3>
                    <span class="stat-label">Patients</span>
                </div>
            </div>
        </div>
        <div class="col-md-6 col-sm-6 col-lg-6 col-xl-3">
            <div class="dash-widget">
                <span class="stat-icon is-warning"><i class="fa fa-clock-o" aria-hidden="true"></i></span>
                <div class="dash-widget-info text-right">
                    <h3>{{ $queued }}</h3>
                    <span class="stat-label">Queued Visits</span>
                </div>
            </div>
        </div>
        <div class="col-md-6 col-sm-6 col-lg-6 col-xl-3">
            <div class="dash-widget">
                <span class="stat-icon is-primary"><i class="fa fa-user-md" aria-hidden="true"></i></span>
                <div class="dash-widget-info text-right">
                    <h3>{{ $doctor }}</h3>
                    <span class="stat-label">Doctors</span>
                </div>
            </div>
        </div>
        <div class="col-md-6 col-sm-6 col-lg-6 col-xl-3">
            <div class="dash-widget">
                <span class="stat-icon is-purple"><i class="fa fa-hourglass-half" aria-hidden="true"></i></span>
                <div class="dash-widget-info text-right">
                    <h3>{{ $pending }}</h3>
                    <span class="stat-label">Pending Visits</span>
                </div>
            </div>
        </div>
    </div>

    {{-- Quick actions --}}
    <div class="card">
        <div class="card-header">
            <h5 class="card-title mb-0"><i class="fa fa-bolt m-r-5"></i> Quick Actions</h5>
        </div>
        <div class="card-body">
            <div class="row">
                <div class="col-md-3 col-sm-6">
                    <a href="/search_patient" class="btn btn-light-soft btn-block text-left mb-2">
                        <i class="fa fa-search m-r-5"></i> Search Patient
                    </a>
                </div>
                <div class="col-md-3 col-sm-6">
                    <a href="/search_patient" class="btn btn-light-soft btn-block text-left mb-2">
                        <i class="fa fa-user-plus m-r-5"></i> Register Patient
                    </a>
                </div>
                <div class="col-md-3 col-sm-6">
                    <a href="/all_patients" class="btn btn-light-soft btn-block text-left mb-2">
                        <i class="fa fa-wheelchair m-r-5"></i> All Patients
                    </a>
                </div>
                <div class="col-md-3 col-sm-6">
                    <a href="/queued_patients" class="btn btn-light-soft btn-block text-left mb-2">
                        <i class="fa fa-list-ol m-r-5"></i> Queued Patients
                    </a>
                </div>
            </div>
        </div>
    </div>
@endsection
