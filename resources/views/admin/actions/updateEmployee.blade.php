<!DOCTYPE html>
<html lang="en">

@if (!Auth::user())
    @php
        header('Location: ' . URL::to('/login'), true, 302);
        exit();
    @endphp
@endif

<!-- add-employee24:07-->

<head>
    <base href="/public">
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=0">
    <link rel="shortcut icon" type="image/x-icon" href="assets/img/favicon.ico">
    <title>DDU Clinic Center</title>
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
        @include('admin.sidebar')
        <div class="page-wrapper">
            <div class="content">
                <div class="row">
                    <div class="col-lg-8 offset-lg-2">
                        <h4 class="page-title">Edit Employee</h4>
                    </div>
                </div>
                <div class="row">
                    <div class="col-lg-8 offset-lg-2">
                        <center>
                            <x-jet-validation-errors class="mb-4" />
                        </center>
                        {{-- @dd($data); --}}
                        <form action="{{ url('/updateAemployee', $data->id) }}" method="POST"
                            enctype="multipart/form-data">
                            @csrf
                            <div class="row">
                                <div class="col-sm-6">
                                    <div class="form-group">
                                        <x-jet-label for="name" value="{{ __('Full Name') }}" />
                                        <x-jet-input id="name" class="block mt-1 w-full" type="text"
                                            name="name" value="{{ $data->name }}" required autofocus
                                            autocomplete="name" />
                                    </div>
                                </div>
                                {{-- <div class="col-sm-6">
                                    <div class="form-group">
                                        <label>Last Name</label>
                                        <input class="form-control" type="text">
                                    </div>
                                </div>
                                <div class="col-sm-6">
                                    <div class="form-group">
                                        <label>Username <span class="text-danger">*</span></label>
                                        <input class="form-control" type="text">
                                    </div>
                                </div> --}}
                                <div class="col-sm-6">
                                    <div class="form-group">
                                        <x-jet-label for="email" value="{{ __('Email') }}" />
                                        <x-jet-input id="email" class="block mt-1 w-full" type="email"
                                            name="email" value="{{ $data->email }}" required />
                                    </div>
                                </div>

                                {{-- <div class="  col-sm-6 ">
                                    <x-jet-label for="password" value="{{ __('Password') }}" />
                                    <x-jet-input id="password" class="block mt-1 w-full" type="password" value="{{ $data->password }}
                                                name=" password" required autocomplete="new-password" /> --}}
                                {{-- </div> --}}

                                {{-- <div class="col-sm-6">
                                        <div class="form-group">
                                            <x-jet-label for="password_confirmation"
                                                value="{{ __('Confirm Password') }}" />
                                            <x-jet-input id="password_confirmation" class="block mt-1 w-full"
                                                type="password" name="password_confirmation" required
                                                autocomplete="new-password" />
                                        </div> --}}
                                {{-- </div> --}}

                                <div class="col-sm-6">
                                    <div class="form-group">
                                        <label>Birth Date <span class="text-danger">*</span></label>
                                        <div class="">
                                            {{-- {{ $data->birthday }} --}}
                                            <input class="form-control datepicker" type="date" name="birthday"
                                                value="{{ $data->birthday }}">
                                        </div>
                                    </div>
                                </div>
                                <div class="col-sm-6">
                                    <div class="form-group">
                                        <label>Joining Date <span class="text-danger">*</span></label>
                                        <div class="">
                                            {{-- {{ $data->joinned_at }} --}}

                                            <input class="form-control datepicker" type="date" name="joinned_at"
                                                value="{{ $data->joinned_at }}">
                                        </div>
                                    </div>
                                </div>



                                <div class="col-sm-6">
                                    <div class="form-group">
                                        <label>Address <span class="text-danger">*</span></label>
                                        <input type="text" class="form-control" required name="address"
                                            value="{{ $data->address }}" autocomplete=" address">
                                    </div>
                                </div>

                                <div class="col-sm-6">
                                    <div class="form-group">
                                        <label>Region</label>
                                        <select class="select" name="region">
                                            <option value="{{ $data->region }}">-- {{ $data->region }} --
                                            </option>
                                            <option value="Dire Dawa (city) "> Dire Dawa (city) </option>
                                            <option value="Addis Ababa (city)">Addis Ababa (city)</option>
                                            <option value="Afar Region"> Afar Region</option>
                                            <option value="Amhara Region">Amhara Region</option>
                                            <option value="Benishangul-Gumuz Region">Benishangul-Gumuz Region
                                            </option>

                                            <option value="Gambela Region">Gambela Region</option>
                                            <option value="Harari Region"> Harari Region</option>
                                            <option value="Oromia Region">Oromia Region </option>
                                            <option value="Sidama Region">Sidama Region</option>
                                            <option value="Somali Region"> Somali Region</option>
                                            <option value="South West Ethiopia Peoples' Region">South West
                                                Ethiopia
                                                Peoples' Region </option>
                                            <option value="Southern Nations, Nationalities, and Peoples' Region">
                                                Southern Nations, Nationalities, and Peoples' Region
                                            </option>
                                            <option value="South West Ethiopia Peoples' Region">South West
                                                Ethiopia
                                                Peoples' Region </option>
                                            <option value="Tigray Region"> Tigray Region
                                            </option>

                                            {{-- <option>Nurse</option> --}}
                                            {{-- <option>Accountant</option> --}}

                                        </select>
                                    </div>
                                </div>

                                <div class="col-sm-6">
                                    <div class="form-group">
                                        <label>Phone </label>
                                        <input class="form-control" style="border-color: gray" type="phone"
                                            name="phone" autocomplete="phone" value="{{ $data->phone }}">
                                    </div>
                                </div>
                                {{-- GENDEr --}}
                                <div class="col-sm-6">
                                    <div class="form-group">
                                        <label class="display-block">Gender</label>

                                        @if ($data->gender == 'Male')
                                            <div class="form-check form-check-inline">
                                                <input class="form-check-input" type="radio" name="gender"
                                                    id="employee_active" value="Male" checked>
                                                <label class="form-check-label" for="employee_active">
                                                    Male
                                                </label>
                                            </div>


                                            <div class="form-check form-check-inline">
                                                <input class="form-check-input" type="radio" name="gender"
                                                    id="employee_inactive" value="Female">
                                                <label class="form-check-label" for="employee_inactive">
                                                    Female
                                                </label>
                                            </div>
                                        @else
                                            <div class="form-check form-check-inline">
                                                <input class="form-check-input" type="radio" name="gender"
                                                    id="employee_active" value="Male">
                                                <label class="form-check-label" for="employee_active">
                                                    Male
                                                </label>
                                            </div>


                                            <div class="form-check form-check-inline">
                                                <input class="form-check-input" type="radio" name="gender"
                                                    id="employee_inactive" value="Female" checked>
                                                <label class="form-check-label" for="employee_inactive">
                                                    Female
                                                </label>
                                            </div>
                                        @endif
                                    </div>
                                </div>
                                <div class="col-sm-6">
                                    <div class="form-group">
                                        <label>Role</label>
                                        <select class="select" name="role">

                                            <option value="{{ $data->role }}">--
                                                @if ($data->role == '0')
                                                    Receptionist
                                                @elseif ($data->role == '1')
                                                    Doctor
                                                @elseif ($data->role == '2')
                                                    Labratorist
                                                @elseif ($data->role == '3')
                                                    Pharmacist
                                                @elseif ($data->role == '4')
                                                    Manager
                                                @endif--
                                            <option>
                                            <option value="0">Receptionist</option>
                                            <option value="1">Doctor</option>
                                            <option value="2">Laboratorist</option>
                                            <option value="3">Pharmacist</option>
                                            <option value="4">Manager </option>
                                            {{-- <option>Nurse</option> --}}
                                            {{-- <option>Accountant</option> --}}

                                        </select>
                                    </div>
                                </div>
                                @if ($data->role == '1')
                                    <div class="col-sm-6">
                                        <div class="form-group">
                                            <label>Speciality </label>
                                            <input class="form-control" style="border-color: gray" type="text"
                                                name="speciality" autocomplete="speciality"
                                                value="{{ $data->speciality }}">
                                        </div>
                                    </div>
                                @endif

                                <div class="col-sm-6">
                                    <div class="form-group">
                                        <label>Nationality</label>
                                        <select class="select" name="nationality">

                                            <option value="{{ $data->nationality }}">
                                                --{{ $data->nationality }} --
                                            </option>
                                            <option value="Ethiopian">Ethiopian</option>
                                            <option value="other">Other</option>

                                            {{-- <option>Nurse</option> --}}
                                            {{-- <option>Accountant</option> --}}

                                        </select>
                                    </div>
                                </div>





                            </div>

                            <div class="m-t-20 text-center">
                                <button class="btn btn-primary submit-btn">Update Employee</button>
                                {{-- <x-jet-button class="ml-4">
                                    {{ __('Register') }}
                                </x-jet-button> --}}
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            <div class="notification-box">
                <div class="msg-sidebar notifications msg-noti">
                    <div class="topnav-dropdown-header">
                        <span>Messages</span>
                    </div>
                    <div class="drop-scroll msg-list-scroll" id="msg_list">
                        <ul class="list-box">
                            <li>
                                <a href="chat.html">
                                    <div class="list-item">
                                        <div class="list-left">
                                            <span class="avatar">R</span>
                                        </div>
                                        <div class="list-body">
                                            <span class="message-author">Richard Miles </span>
                                            <span class="message-time">12:28 AM</span>
                                            <div class="clearfix"></div>
                                            <span class="message-content">Lorem ipsum dolor sit amet, consectetur
                                                adipiscing</span>
                                        </div>
                                    </div>
                                </a>
                            </li>
                            <li>
                                <a href="chat.html">
                                    <div class="list-item new-message">
                                        <div class="list-left">
                                            <span class="avatar">J</span>
                                        </div>
                                        <div class="list-body">
                                            <span class="message-author">John Doe</span>
                                            <span class="message-time">1 Aug</span>
                                            <div class="clearfix"></div>
                                            <span class="message-content">Lorem ipsum dolor sit amet, consectetur
                                                adipiscing</span>
                                        </div>
                                    </div>
                                </a>
                            </li>
                            <li>
                                <a href="chat.html">
                                    <div class="list-item">
                                        <div class="list-left">
                                            <span class="avatar">T</span>
                                        </div>
                                        <div class="list-body">
                                            <span class="message-author"> Tarah Shropshire </span>
                                            <span class="message-time">12:28 AM</span>
                                            <div class="clearfix"></div>
                                            <span class="message-content">Lorem ipsum dolor sit amet, consectetur
                                                adipiscing</span>
                                        </div>
                                    </div>
                                </a>
                            </li>
                            <li>
                                <a href="chat.html">
                                    <div class="list-item">
                                        <div class="list-left">
                                            <span class="avatar">M</span>
                                        </div>
                                        <div class="list-body">
                                            <span class="message-author">Mike Litorus</span>
                                            <span class="message-time">12:28 AM</span>
                                            <div class="clearfix"></div>
                                            <span class="message-content">Lorem ipsum dolor sit amet, consectetur
                                                adipiscing</span>
                                        </div>
                                    </div>
                                </a>
                            </li>
                            <li>
                                <a href="chat.html">
                                    <div class="list-item">
                                        <div class="list-left">
                                            <span class="avatar">C</span>
                                        </div>
                                        <div class="list-body">
                                            <span class="message-author"> Catherine Manseau </span>
                                            <span class="message-time">12:28 AM</span>
                                            <div class="clearfix"></div>
                                            <span class="message-content">Lorem ipsum dolor sit amet, consectetur
                                                adipiscing</span>
                                        </div>
                                    </div>
                                </a>
                            </li>
                            <li>
                                <a href="chat.html">
                                    <div class="list-item">
                                        <div class="list-left">
                                            <span class="avatar">D</span>
                                        </div>
                                        <div class="list-body">
                                            <span class="message-author"> Domenic Houston </span>
                                            <span class="message-time">12:28 AM</span>
                                            <div class="clearfix"></div>
                                            <span class="message-content">Lorem ipsum dolor sit amet, consectetur
                                                adipiscing</span>
                                        </div>
                                    </div>
                                </a>
                            </li>
                            <li>
                                <a href="chat.html">
                                    <div class="list-item">
                                        <div class="list-left">
                                            <span class="avatar">B</span>
                                        </div>
                                        <div class="list-body">
                                            <span class="message-author"> Buster Wigton </span>
                                            <span class="message-time">12:28 AM</span>
                                            <div class="clearfix"></div>
                                            <span class="message-content">Lorem ipsum dolor sit amet, consectetur
                                                adipiscing</span>
                                        </div>
                                    </div>
                                </a>
                            </li>
                            <li>
                                <a href="chat.html">
                                    <div class="list-item">
                                        <div class="list-left">
                                            <span class="avatar">R</span>
                                        </div>
                                        <div class="list-body">
                                            <span class="message-author"> Rolland Webber </span>
                                            <span class="message-time">12:28 AM</span>
                                            <div class="clearfix"></div>
                                            <span class="message-content">Lorem ipsum dolor sit amet, consectetur
                                                adipiscing</span>
                                        </div>
                                    </div>
                                </a>
                            </li>
                            <li>
                                <a href="chat.html">
                                    <div class="list-item">
                                        <div class="list-left">
                                            <span class="avatar">C</span>
                                        </div>
                                        <div class="list-body">
                                            <span class="message-author"> Claire Mapes </span>
                                            <span class="message-time">12:28 AM</span>
                                            <div class="clearfix"></div>
                                            <span class="message-content">Lorem ipsum dolor sit amet, consectetur
                                                adipiscing</span>
                                        </div>
                                    </div>
                                </a>
                            </li>
                            <li>
                                <a href="chat.html">
                                    <div class="list-item">
                                        <div class="list-left">
                                            <span class="avatar">M</span>
                                        </div>
                                        <div class="list-body">
                                            <span class="message-author">Melita Faucher</span>
                                            <span class="message-time">12:28 AM</span>
                                            <div class="clearfix"></div>
                                            <span class="message-content">Lorem ipsum dolor sit amet, consectetur
                                                adipiscing</span>
                                        </div>
                                    </div>
                                </a>
                            </li>
                            <li>
                                <a href="chat.html">
                                    <div class="list-item">
                                        <div class="list-left">
                                            <span class="avatar">J</span>
                                        </div>
                                        <div class="list-body">
                                            <span class="message-author">Jeffery Lalor</span>
                                            <span class="message-time">12:28 AM</span>
                                            <div class="clearfix"></div>
                                            <span class="message-content">Lorem ipsum dolor sit amet, consectetur
                                                adipiscing</span>
                                        </div>
                                    </div>
                                </a>
                            </li>
                            <li>
                                <a href="chat.html">
                                    <div class="list-item">
                                        <div class="list-left">
                                            <span class="avatar">L</span>
                                        </div>
                                        <div class="list-body">
                                            <span class="message-author">Loren Gatlin</span>
                                            <span class="message-time">12:28 AM</span>
                                            <div class="clearfix"></div>
                                            <span class="message-content">Lorem ipsum dolor sit amet, consectetur
                                                adipiscing</span>
                                        </div>
                                    </div>
                                </a>
                            </li>
                            <li>
                                <a href="chat.html">
                                    <div class="list-item">
                                        <div class="list-left">
                                            <span class="avatar">T</span>
                                        </div>
                                        <div class="list-body">
                                            <span class="message-author">Tarah Shropshire</span>
                                            <span class="message-time">12:28 AM</span>
                                            <div class="clearfix"></div>
                                            <span class="message-content">Lorem ipsum dolor sit amet, consectetur
                                                adipiscing</span>
                                        </div>
                                    </div>
                                </a>
                            </li>
                        </ul>
                    </div>
                    <div class="topnav-dropdown-footer">
                        <a href="chat.html">See all messages</a>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div class="sidebar-overlay" data-reff=""></div>
    <script src="assets/js/jquery-3.2.1.min.js"></script>
    <script src="assets/js/popper.min.js"></script>
    <script src="assets/js/bootstrap.min.js"></script>
    <script src="assets/js/jquery.slimscroll.js"></script>
    <script src="assets/js/select2.min.js"></script>
    <script src="assets/js/app.js"></script>
    <script src="assets/js/moment.min.js"></script>
    <script src="assets/js/bootstrap-datetimepicker.min.js"></script>
    <script>
        $(function() {
            $('.date').datepicker();
        });
    </script>
</body>


<!-- add-employee24:07-->

</html>
