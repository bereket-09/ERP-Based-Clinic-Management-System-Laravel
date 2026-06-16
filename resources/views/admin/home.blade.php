@extends('layouts.portal')

@section('title', 'Admin Dashboard')

@push('styles')
<style>
    /* ===== Scoped dashboard polish (enhance.css is untouched) ===== */
    .dash-section { margin-bottom: 6px; }
    .dash-section-head {
        display: flex;
        align-items: center;
        gap: 8px;
        margin: 18px 2px 12px;
        color: var(--c-ink-soft);
        font-size: 12px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: .08em;
    }
    .dash-section-head .ds-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: var(--c-primary);
        box-shadow: 0 0 0 4px var(--c-primary-50);
        flex: none;
    }
    .dash-section-head .ds-rule {
        flex: 1 1 auto;
        height: 1px;
        background: linear-gradient(90deg, var(--c-border), transparent);
    }

    /* Tabular figures so stat numbers align cleanly */
    .stat-value { font-variant-numeric: tabular-nums; font-feature-settings: "tnum" 1; }

    /* Staggered fade-in entry (GPU-friendly transform + opacity) */
    .dash-rise {
        opacity: 0;
        transform: translateY(10px);
        animation: dashRise .26s cubic-bezier(.22, .61, .36, 1) forwards;
        will-change: transform, opacity;
    }
    @keyframes dashRise {
        to { opacity: 1; transform: translateY(0); }
    }
    .dash-rise.d1 { animation-delay: .04s; }
    .dash-rise.d2 { animation-delay: .08s; }
    .dash-rise.d3 { animation-delay: .12s; }
    .dash-rise.d4 { animation-delay: .16s; }
    .dash-rise.d5 { animation-delay: .20s; }
    @media (prefers-reduced-motion: reduce) {
        .dash-rise { animation: none; opacity: 1; transform: none; }
    }

    /* Tasteful hover lift on the chart + snapshot cards */
    .dash-panel { transition: transform .2s ease, box-shadow .2s ease; }
    .dash-panel:hover { transform: translateY(-3px); }

    /* Green-hued (not pure-black) tinted shadow on the chart card */
    .chart-card { box-shadow: 0 14px 36px rgba(22, 160, 133, .14); }
    .chart-card:hover { box-shadow: 0 20px 48px rgba(22, 160, 133, .20); }
    .chart-wrap { position: relative; height: 260px; }

    /* At-a-glance snapshot list */
    .snapshot-list { list-style: none; margin: 0; padding: 0; }
    .snapshot-list li {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 11px 0;
        border-bottom: 1px solid var(--c-border);
    }
    .snapshot-list li:last-child { border-bottom: 0; }
    .snapshot-list .sl-label {
        display: flex;
        align-items: center;
        gap: 10px;
        color: var(--c-ink-soft);
        font-size: 13.5px;
        font-weight: 600;
    }
    .snapshot-list .sl-swatch {
        width: 10px;
        height: 10px;
        border-radius: 3px;
        flex: none;
    }
    .snapshot-list .sl-value {
        font-weight: 800;
        color: var(--c-ink);
        font-variant-numeric: tabular-nums;
        font-feature-settings: "tnum" 1;
    }
</style>
@endpush

@section('content')
    <div class="page-head">
        <div>
            <h4 class="page-title">Dashboard</h4>
            <div class="page-sub">Welcome back, {{ Auth::user()->name }} — here is the clinic at a glance.</div>
        </div>
    </div>

    {{-- ============ Patients & visits ============ --}}
    <div class="dash-section">
        <div class="dash-section-head">
            <span class="ds-dot"></span> Patients &amp; visits <span class="ds-rule"></span>
        </div>
        <div class="row">
            <div class="col-md-6 col-lg-3">
                <div class="dash-widget dash-rise d1">
                    <span class="stat-icon is-primary"><i class="fa fa-wheelchair"></i></span>
                    <div class="dash-widget-info text-right">
                        <h3 class="stat-value">{{ $patient }}</h3>
                        <span class="stat-label">Patients</span>
                    </div>
                </div>
            </div>
            <div class="col-md-6 col-lg-3">
                <div class="dash-widget dash-rise d2">
                    <span class="stat-icon is-warning"><i class="fa fa-clock-o"></i></span>
                    <div class="dash-widget-info text-right">
                        <h3 class="stat-value">{{ $queued }}</h3>
                        <span class="stat-label">Queued visits</span>
                    </div>
                </div>
            </div>
            <div class="col-md-6 col-lg-3">
                <div class="dash-widget dash-rise d3">
                    <span class="stat-icon is-info"><i class="fa fa-hourglass-half"></i></span>
                    <div class="dash-widget-info text-right">
                        <h3 class="stat-value">{{ $pending }}</h3>
                        <span class="stat-label">Pending visits</span>
                    </div>
                </div>
            </div>
            <div class="col-md-6 col-lg-3">
                <div class="dash-widget dash-rise d4">
                    <span class="stat-icon is-success"><i class="fa fa-check-circle"></i></span>
                    <div class="dash-widget-info text-right">
                        <h3 class="stat-value">{{ $Completed }}</h3>
                        <span class="stat-label">Completed visits</span>
                    </div>
                </div>
            </div>
        </div>
    </div>

    {{-- ============ Chart + snapshot (asymmetric 2/3 + 1/3) ============ --}}
    <div class="row">
        <div class="col-lg-8 mb-3">
            <div class="card dash-panel chart-card dash-rise d2 h-100">
                <div class="card-body">
                    <h4 class="card-title">Visit flow</h4>
                    <div class="page-sub mb-3">Current distribution of patient visits by status.</div>
                    <div class="chart-wrap">
                        <canvas id="visitFlowChart"></canvas>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-lg-4 mb-3">
            <div class="card dash-panel dash-rise d3 h-100">
                <div class="card-body">
                    <h4 class="card-title">Lab at a glance</h4>
                    <div class="page-sub mb-3">Live laboratory workload.</div>
                    <ul class="snapshot-list">
                        <li>
                            <span class="sl-label"><span class="sl-swatch" style="background:#16a085"></span> Lab queue</span>
                            <span class="sl-value">{{ $LabQueue }}</span>
                        </li>
                        <li>
                            <span class="sl-label"><span class="sl-swatch" style="background:#f4b740"></span> Lab pending</span>
                            <span class="sl-value">{{ $LabPending }}</span>
                        </li>
                        <li>
                            <span class="sl-label"><span class="sl-swatch" style="background:#2d9cdb"></span> Lab completed</span>
                            <span class="sl-value">{{ $LabCompleted }}</span>
                        </li>
                        <li>
                            <span class="sl-label"><span class="sl-swatch" style="background:#ef4f5a"></span> Expired drugs</span>
                            <span class="sl-value">{{ $expire }}</span>
                        </li>
                    </ul>
                    <div class="chart-wrap" style="height:150px">
                        <canvas id="labChart"></canvas>
                    </div>
                </div>
            </div>
        </div>
    </div>

    {{-- ============ Laboratory ============ --}}
    <div class="dash-section">
        <div class="dash-section-head">
            <span class="ds-dot"></span> Laboratory <span class="ds-rule"></span>
        </div>
        <div class="row">
            <div class="col-md-6 col-lg-3">
                <div class="dash-widget dash-rise d1">
                    <span class="stat-icon is-purple"><i class="fa fa-flask"></i></span>
                    <div class="dash-widget-info text-right">
                        <h3 class="stat-value">{{ $LabQueue }}</h3>
                        <span class="stat-label">Lab queue</span>
                    </div>
                </div>
            </div>
            <div class="col-md-6 col-lg-3">
                <div class="dash-widget dash-rise d2">
                    <span class="stat-icon is-warning"><i class="fa fa-hourglass-o"></i></span>
                    <div class="dash-widget-info text-right">
                        <h3 class="stat-value">{{ $LabPending }}</h3>
                        <span class="stat-label">Lab pending</span>
                    </div>
                </div>
            </div>
            <div class="col-md-6 col-lg-3">
                <div class="dash-widget dash-rise d3">
                    <span class="stat-icon is-info"><i class="fa fa-check-square-o"></i></span>
                    <div class="dash-widget-info text-right">
                        <h3 class="stat-value">{{ $LabCompleted }}</h3>
                        <span class="stat-label">Lab completed</span>
                    </div>
                </div>
            </div>
        </div>
    </div>

    {{-- ============ Pharmacy & inventory ============ --}}
    <div class="dash-section">
        <div class="dash-section-head">
            <span class="ds-dot"></span> Pharmacy &amp; inventory <span class="ds-rule"></span>
        </div>
        <div class="row">
            <div class="col-md-6 col-lg-3">
                <div class="dash-widget dash-rise d1">
                    <span class="stat-icon is-primary"><i class="fa fa-medkit"></i></span>
                    <div class="dash-widget-info text-right">
                        <h3 class="stat-value">{{ $medicin }}</h3>
                        <span class="stat-label">Medicines</span>
                    </div>
                </div>
            </div>
            <div class="col-md-6 col-lg-3">
                <div class="dash-widget dash-rise d2">
                    <span class="stat-icon is-purple"><i class="fa fa-shopping-bag"></i></span>
                    <div class="dash-widget-info text-right">
                        <h3 class="stat-value">{{ $DrugOrder }}</h3>
                        <span class="stat-label">Drug orders</span>
                    </div>
                </div>
            </div>
            <div class="col-md-6 col-lg-3">
                <div class="dash-widget dash-rise d3">
                    <span class="stat-icon is-danger"><i class="fa fa-exclamation-triangle"></i></span>
                    <div class="dash-widget-info text-right">
                        <h3 class="stat-value">{{ $expire }}</h3>
                        <span class="stat-label">Expired drugs</span>
                    </div>
                </div>
            </div>
            <div class="col-md-6 col-lg-3">
                <div class="dash-widget dash-rise d4">
                    <span class="stat-icon is-info"><i class="fa fa-cube"></i></span>
                    <div class="dash-widget-info text-right">
                        <h3 class="stat-value">{{ $Item }}</h3>
                        <span class="stat-label">Total items</span>
                    </div>
                </div>
            </div>
        </div>
    </div>

    {{-- ============ Staff ============ --}}
    <div class="dash-section">
        <div class="dash-section-head">
            <span class="ds-dot"></span> Staff <span class="ds-rule"></span>
        </div>
        <div class="row">
            <div class="col-md-6 col-lg-3">
                <div class="dash-widget dash-rise d1">
                    <span class="stat-icon is-primary"><i class="fa fa-users"></i></span>
                    <div class="dash-widget-info text-right">
                        <h3 class="stat-value">{{ $user }}</h3>
                        <span class="stat-label">Staff users</span>
                    </div>
                </div>
            </div>
            <div class="col-md-6 col-lg-3">
                <div class="dash-widget dash-rise d2">
                    <span class="stat-icon is-info"><i class="fa fa-user-md"></i></span>
                    <div class="dash-widget-info text-right">
                        <h3 class="stat-value">{{ $doctor }}</h3>
                        <span class="stat-label">Doctors</span>
                    </div>
                </div>
            </div>
        </div>
    </div>

    {{-- ============ Quick actions ============ --}}
    <div class="card dash-rise d3 mt-2">
        <div class="card-body">
            <h4 class="card-title">Quick actions</h4>
            <div class="row">
                <div class="col-sm-6 col-lg-4 mb-2">
                    <a href="/doctors" class="btn btn-light-soft btn-block text-left">
                        <i class="fa fa-user-md m-r-5"></i> Manage doctors
                    </a>
                </div>
                <div class="col-sm-6 col-lg-4 mb-2">
                    <a href="/all_patients" class="btn btn-light-soft btn-block text-left">
                        <i class="fa fa-wheelchair m-r-5"></i> View patients
                    </a>
                </div>
                <div class="col-sm-6 col-lg-4 mb-2">
                    <a href="/view-departement" class="btn btn-light-soft btn-block text-left">
                        <i class="fa fa-hospital-o m-r-5"></i> Departments
                    </a>
                </div>
                <div class="col-sm-6 col-lg-4 mb-2">
                    <a href="/view_all_drugs" class="btn btn-light-soft btn-block text-left">
                        <i class="fa fa-medkit m-r-5"></i> All drugs
                    </a>
                </div>
                <div class="col-sm-6 col-lg-4 mb-2">
                    <a href="/view_all_tests" class="btn btn-light-soft btn-block text-left">
                        <i class="fa fa-flask m-r-5"></i> Lab tests
                    </a>
                </div>
                <div class="col-sm-6 col-lg-4 mb-2">
                    <a href="/view-leave-request" class="btn btn-light-soft btn-block text-left">
                        <i class="fa fa-calendar-times-o m-r-5"></i> Leave requests
                    </a>
                </div>
                <div class="col-sm-6 col-lg-4 mb-2">
                    <a href="/view-all-item" class="btn btn-light-soft btn-block text-left">
                        <i class="fa fa-cube m-r-5"></i> Property / items
                    </a>
                </div>
                <div class="col-sm-6 col-lg-4 mb-2">
                    <a href="/add-employee" class="btn btn-light-soft btn-block text-left">
                        <i class="fa fa-plus m-r-5"></i> Add employee
                    </a>
                </div>
            </div>
        </div>
    </div>
@endsection

@push('scripts')
<script>
    (function () {
        if (typeof Chart === 'undefined') { return; }

        Chart.defaults.global.defaultFontColor = '#5a6b7b';
        Chart.defaults.global.defaultFontFamily =
            "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";

        // ----- Doughnut: visit status (real values) -----
        var visitEl = document.getElementById('visitFlowChart');
        if (visitEl) {
            new Chart(visitEl.getContext('2d'), {
                type: 'doughnut',
                data: {
                    labels: ['Queued', 'Pending', 'Completed'],
                    datasets: [{
                        data: [{{ $queued }}, {{ $pending }}, {{ $Completed }}],
                        backgroundColor: ['#16a085', '#f4b740', '#2d9cdb'],
                        borderColor: '#ffffff',
                        borderWidth: 3,
                        hoverBorderColor: '#ffffff'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    cutoutPercentage: 64,
                    legend: {
                        position: 'right',
                        labels: { boxWidth: 12, padding: 16, usePointStyle: true }
                    },
                    tooltips: { displayColors: true }
                }
            });
        }

        // ----- Bar: laboratory workload (real values) -----
        var labEl = document.getElementById('labChart');
        if (labEl) {
            new Chart(labEl.getContext('2d'), {
                type: 'bar',
                data: {
                    labels: ['Queue', 'Pending', 'Completed'],
                    datasets: [{
                        data: [{{ $LabQueue }}, {{ $LabPending }}, {{ $LabCompleted }}],
                        backgroundColor: ['#16a085', '#f4b740', '#2d9cdb'],
                        borderRadius: 6,
                        barPercentage: 0.6,
                        maxBarThickness: 38
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    legend: { display: false },
                    scales: {
                        yAxes: [{
                            ticks: { beginAtZero: true, precision: 0 },
                            gridLines: { color: '#e9eef2', drawBorder: false }
                        }],
                        xAxes: [{ gridLines: { display: false, drawBorder: false } }]
                    }
                }
            });
        }
    })();
</script>
@endpush
