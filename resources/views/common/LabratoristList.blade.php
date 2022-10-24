<!DOCTYPE html>
<html lang="en">
@if (!Auth::user())
    @php
        header('Location: ' . URL::to('/login'), true, 302);
        exit();
    @endphp
@endif


<!-- doctors23:12-->

<head>

    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=0">
    <link rel="shortcut icon" type="image/x-icon" href="assets/img/favicon.ico">
    <title>DDU Clnic Center</title>
    <link rel="stylesheet" type="text/css" href="assets/css/bootstrap.min.css">
    <link rel="stylesheet" type="text/css" href="assets/css/font-awesome.min.css">
    <link rel="stylesheet" type="text/css" href="assets/css/select2.min.css">
    <link rel="stylesheet" type="text/css" href="assets/css/bootstrap-datetimepicker.min.css">
    <link rel="stylesheet" type="text/css" href="assets/css/style.css">
    <!--[if lt IE 9]>
  <script src="assets/js/html5shiv.min.js"></script>
  <script src="assets/js/respond.min.js"></script>
 <![endif]-->
</head>

<body>
    <div class="main-wrapper">
        @include('navbar')


        @if (Auth::user()->role == '4')
            {
            @include('admin.sidebar')
            }
        @elseif (Auth::user()->role == '0')
            {
            @include('reception.sidebar')
            }
        @elseif (Auth::user()->role == '1')
            {
            @include('doctor.sidebar')
            }
        @elseif (Auth::user()->role == '2')
            {
            @include('lab.sidebar')
            }
        @elseif (Auth::user()->role == '3')
            {
            @include('pharmacy.sidebar')
            }
        @endif



        <div class="page-wrapper">
            <div class="content">
                <div class="row">
                    <div class="col-sm-4 col-3">
                        <h4 class="page-title">Labratorists</h4>
                    </div>
                    <div class="col-sm-8 col-9 text-right m-b-20">
                        @if (Auth::user()->role == '4')
                            <a href="{{ url('add-employee') }}" class="btn btn-primary btn-rounded float-right"><i
                                    class="fa fa-plus"></i> Add Labratorists</a>
                        @endif
                    </div>
                </div>
                <div class="row doctor-grid">
                    @foreach ($doctors as $doctor)
                        <div class="col-md-4 col-sm-4  col-lg-3">
                            <div class="profile-widget">
                                <div class="doctor-img">
                                    <a class="avatar" href="{{ url('/profile', $doctor->id) }}">
                                        {{-- <img alt="" width="80" height="80"
                                            src="/storage/{{ $doctor->profile_photo_path }}"> --}}
                                        <img width="48" height="28" class="rounded-circle" id="currentPhoto"
                                            src="/storage/{{ $doctor->profile_photo_path }}"
                                            onerror="this.onerror=null; this.src='/images/avatar.png'" alt=""
                                            width="100" height="120">
                                    </a>
                                </div>
                                @if (Auth::user()->role == '4')
                                    <div class="dropdown profile-action">
                                        <a href="#" class="action-icon dropdown-toggle" data-toggle="dropdown"
                                            aria-expanded="false"><i class="fa fa-ellipsis-v"></i></a>
                                        <div class="dropdown-menu dropdown-menu-right">
                                            @if (Auth::user()->role == '4' || $doctor->id == Auth::user()->id)
                                                <a class="dropdown-item"
                                                    href="{{ url('/updateEmployee', $doctor->id) }}"><i
                                                        class="fa fa-pencil m-r-5"></i>
                                                    Edit</a>
                                            @endif
                                            @if (Auth::user()->role == '4')
                                                <a href="{{ url('/deleteEmployee', $doctor->id) }}"
                                                    onclick="return confirm('Are you Sure you want to delete this Employee --({{ $doctor->name }})--  ??' )"
                                                    width="100%" class="dropdown dropdown-item "
                                                    style="background-color: #f62d51;color:white"><i
                                                        class="fa fa-trash-o m-r-5"></i>
                                                    Delete</a>
                                            @endif

                                        </div>
                                    </div>
                                @endif


                                <h4 class="doctor-name text-ellipsis"><a href="profile.html">{{ $doctor->name }}</a>
                                </h4>
                                {{-- <div class="doc-prof">Speciality : {{ $doctor->speciality }}</div> --}}
                                <div class="user-country">
                                    <i class="fa fa-map-marker"></i>
                                    {{ $doctor->Address }},{{ $doctor->region }}
                                </div>
                            </div>
                        </div>
                    @endforeach
                </div>
                {{-- <div class="row">
                    <div class="col-sm-12">
                        <div class="see-all">
                            <a class="see-all-btn" href="javascript:top();">Load More</a>
                        </div>
                    </div>
                </div> --}}
            </div>

        </div>

    </div>
    <div class="sidebar-overlay" data-reff=""></div>
    <script src="assets/js/jquery-3.2.1.min.js"></script>
    <script src="assets/js/popper.min.js"></script>
    <script src="assets/js/bootstrap.min.js"></script>
    <script src="assets/js/jquery.slimscroll.js"></script>
    <script src="assets/js/select2.min.js"></script>
    <script src="assets/js/moment.min.js"></script>
    <script src="assets/js/bootstrap-datetimepicker.min.js"></script>
    <script src="assets/js/app.js"></script>
</body>


<!-- doctors23:17-->

</html>
