@include('head');

<body>
    <div class="main-wrapper">
        @include('navbar');
        @include('reception.sidebar');
        <div class="page-wrapper">
            <div class="content">
                <div class="row">
                    <div class="col-md-6 col-sm-6 col-lg-6 col-xl-3">
                        <div class="dash-widget">
                            <span class="dash-widget-bg1"><i class="fa fa-user-o aria-hidden="true"></i></span>
                            <div class="dash-widget-info text-right">
                                <h3>{{ $user }}</h3>
                                <span class="widget-title1">Users <i class="fa fa-check" aria-hidden="true"></i></span>
                            </div>
                        </div>
                    </div>
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
                            <span class="dash-widget-bg1"><i class="fa fa-user-md" aria-hidden="true"></i></span>
                            <div class="dash-widget-info text-right">
                                <h3>{{ $doctor }}</h3>
                                <span class="widget-title1">Doctors <i class="fa fa-check"
                                        aria-hidden="true"></i></span>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-6 col-sm-6 col-lg-6 col-xl-3">
                        <div class="dash-widget">
                            <span class="dash-widget-bg2"><i class="fa fa-stethoscope"></i></span>
                            <div class="dash-widget-info text-right">
                                <h3>{{ $patient }}</h3>
                                <span class="widget-title2">Patients <i class="fa fa-check"
                                        aria-hidden="true"></i></span>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-6 col-sm-6 col-lg-6 col-xl-3">
                        <div class="dash-widget">
                            <span class="dash-widget-bg3"><i class="fa fa-clock-o" aria-hidden="true"></i></span>
                            <div class="dash-widget-info text-right">
                                <h3>{{ $queued }}</h3>
                                <span class="widget-title3">Queued <i class="fa fa-check" aria-hidden="true"></i></span>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-6 col-sm-6 col-lg-6 col-xl-3">
                        <div class="dash-widget">
                            <span class="dash-widget-bg4"><i class="fa fa-info" aria-hidden="true"></i></span>
                            <div class="dash-widget-info text-right">
                                <h3>{{ $Item }}</h3>
                                <span class="widget-title4">Total Items<i class="fa fa-check"></i></span>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-6 col-sm-6 col-lg-6 col-xl-3">
                        <div class="dash-widget">
                            <span class="dash-widget-bg4"><i class="fa fa-book" aria-hidden="true"></i></span>
                            <div class="dash-widget-info text-right">
                                <h3>{{ $DrugOrder }}</h3>
                                <span class="widget-title4">Drug ORDERS<i class="fa fa-check"></i></span>
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
                    <hr><br>
                    <div class="col-12 col-md-2 col-lg-4 col-xl-4">
                        <div class="card member-panel">

                            <div class="card-footer text-center bg-white">
                                <a href="/search_patient" class="btn btn-primary">Add new Patient</a>
                            </div>
                        </div>
                    </div>
                    <div class="col-12 col-md-2 col-lg-4 col-xl-4">
                        <div class="card member-panel">

                            <div class="card-footer text-center bg-white">
                                <a href="/all_patients" class="text-muted">View all Patients</a>
                            </div>
                        </div>
                    </div>
                    <div class="col-12 col-md-2 col-lg-4 col-xl-4">
                        {{-- <div class="card member-panel">

                            <div class="card-footer text-center bg-white">
                                <a href="/labratorist" class="text-muted">View all labratorist</a>
                            </div>
                        </div> --}}
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
