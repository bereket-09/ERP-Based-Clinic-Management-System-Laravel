@include('head');

<body>
    <div class="main-wrapper">
        @include('navbar');
        @include('pharmacy.sidebar');
        <div class="page-wrapper">
            <div class="content">
                <div class="row">

                    {{-- <div class="col-md-6 col-sm-6 col-lg-6 col-xl-3">
                        <div class="dash-widget">
                            <span class="dash-widget-bg1"><i class="fa fa-user-o" aria-hidden="true"></i></span>
                            <div class="dash-widget-info text-right">
                                <h3></h3>
                                <span class="widget-title1">Users <i class="fa fa-check" aria-hidden="true"></i></span>
                            </div>
                        </div>
                    </div> --}}


                    <div class="col-md-6 col-sm-6 col-lg-6 col-xl-3">
                        <div class="dash-widget">
                            <span class="dash-widget-bg3"><i class="fa fa-book" aria-hidden="true"></i></span>
                            <div class="dash-widget-info text-right">
                                <h3>{{ $DrugOrder }}</h3>
                                <span class="widget-title3">Total Drug Orders <i class="fa fa-check"
                                        aria-hidden="true"></i></span>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-6 col-sm-6 col-lg-6 col-xl-3">
                        <div class="dash-widget">
                            <span class="dash-widget-bg4"><i class="fa fa-info" aria-hidden="true"></i></span>
                            <div class="dash-widget-info text-right">
                                <h3>{{ $medicin }}</h3>
                                <span class="widget-title4">Total Number of Medicine<i class="fa fa-check"></i></span>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-6 col-sm-6 col-lg-6 col-xl-3">
                        <div class="dash-widget">
                            <span class="dash-widget-bg3"><i class="fa fa-book" aria-hidden="true"></i></span>
                            <div class="dash-widget-info text-right">
                                <h3>{{ $expire }}</h3>
                                <span class="widget-title3">Expired Medicines<i class="fa fa-check"></i></span>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-6 col-sm-6 col-lg-6 col-xl-3">
                        <div class="dash-widget">
                            <span class="dash-widget-bg2"><i class="fa fa-stethoscope"></i></span>
                            <div class="dash-widget-info text-right">
                                <h3>{{ $patient }}</h3>
                                <span class="widget-title2">Total Patient <i class="fa fa-check"
                                        aria-hidden="true"></i></span>
                            </div>
                        </div>
                    </div>
                </div>

                <br><br>

                {{-- Appointemetn Section --}}

                {{-- <div class="row">
                    <div class="col-12 col-md-6 col-lg-8 col-xl-8">
                        <div class="card">
                            <div class="card-header">
                                <h4 class="card-title d-inline-block">Queued Patients </h4> <a href="/queued_patients"
                                    class="btn btn-primary float-right">View all</a>
                            </div>

                        </div>
                    </div> --}}

                {{-- DOCTORS SECTION --}}

                <center>
                    <div class="col-12 col-md-2 col-lg-4 col-xl-4">
                        <div class="card member-panel">

                            <div class="card-footer text-center bg-white">
                                <a href="/view_orderd_drugs" class="text-muted">View Drug Orders</a>
                            </div>
                        </div>
                    </div>
                    {{-- <div class="col-12 col-md-2 col-lg-4 col-xl-4">
                        <div class="card member-panel">

                            <div class="card-footer text-center bg-white">
                                <a href="/view_pending_lab_results" class="text-muted">View Pending Orders</a>
                            </div>
                        </div>
                    </div> --}}
                    <div class="col-12 col-md-2 col-lg-4 col-xl-4">
                        <div class="card member-panel">

                            <div class="card-footer text-center bg-white">
                                <a href="/view_completed_drug_orders" class="text-muted">View Completed Orders</a>
                            </div>
                        </div>
                    </div>
                </center>
                {{-- </div> --}}


                {{-- Patient section --}}


            </div>

        </div>
    </div>

    @include('scripts')
</body>



</html>
