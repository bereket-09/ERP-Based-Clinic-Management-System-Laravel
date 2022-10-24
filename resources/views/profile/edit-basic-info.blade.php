<!DOCTYPE html>
<html lang="en">

@if (!Auth::user())
    @php
        header('Location: ' . URL::to('/login'), true, 302);
        exit();
    @endphp
@endif


<!-- edit-profile23:03-->

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
        <div class="sidebar" id="sidebar">
            <div class="sidebar-inner slimscroll">
                <div id="sidebar-menu" class="sidebar-menu">
                    <ul>
                        <li class="menu-title">Main</li>
                        <li>
                            <a href="/home"><i class="fa fa-home"></i> <span>Back To Home</span></a>
                        </li>


                    </ul>
                </div>
            </div>
        </div>


        <div class="page-wrapper">

            <div class="content">

                <div class="row">
                    <div class="col-sm-12">
                        <h4 class="page-title">Edit Profile</h4>
                    </div>


                </div>
                <div class="">

                    <center>
                        <x-jet-validation-errors class="" />
                    </center>
                </div>

                <form action="{{ url('/update_basic_info', $data->id) }}" method="POST"
                    enctype="multipart/form-data">
                    @csrf
                    <div class="card-box">
                        <h3 class="card-title">Basic Informations</h3>
                        <div class="row">
                            <div class="col-md-12">
                                <div class="profile-img-wrap">

                                    <img class="avatar" id="currentPhoto" src="{{ Auth::user()->profile_photo_url }}"
                                        onerror="this.onerror=null; this.src='/images/avatar.png'" alt="">

                                    {{-- <div class="fileupload btn">
                                        <span class="btn-text">edit</span>
                                        <a class="upload" href="/mypr">
                                    </div> --}}
                                </div>
                                <div class="profile-basic">
                                    <div class="row">
                                        <div class="col-md-6">
                                            <div class="form-group form-focus">
                                                <label class="focus-label">Full Name</label>
                                                <input type="text" class="form-control floating"
                                                    value="{{ $data->name }} " name="name">
                                            </div>
                                        </div>
                                        <div class="col-md-6">
                                            <div class="form-group form-focus">
                                                <label class="focus-label">Birth Date</label>
                                                <input type="text" class="form-control floating datetimepicker"
                                                    value="{{ $data->birthday }}" name="birthday">
                                            </div>
                                        </div>
                                        <div class="col-md-6">
                                            <div class="form-group form-focus">
                                                <label class="focus-label">Joinned Date</label>
                                                <div class="cal-icon">
                                                    <input class="form-control floating datetimepicker" type="text"
                                                        value="{{ $data->joinned_at }}" name="joinned_at">
                                                </div>
                                            </div>
                                        </div>
                                        <div class="col-md-6">
                                            <label class="focus-label">Gender</label> <br>
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
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="card-box">
                        <h3 class="card-title">Contact Informations</h3>
                        <div class="row">
                            <div class="col-md-6">
                                <div class="form-group form-focus">
                                    <label class="focus-label">Address</label>
                                    <input type="text" class="form-control floating" name="address"
                                        value="{{ $data->address }}">
                                </div>
                            </div>

                            <div class="col-md-6">
                                <div class="form-group form-focus">
                                    <label class="focus-label">Nationality</label>
                                    <input type="text" class="form-control floating" name="nationality"
                                        value="{{ $data->nationality }}">
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="form-group form-focus select-focus">
                                    <label class="focus-label">Region</label><br>
                                    <select class=" select form-control floating" name="region">
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
                            <div class="col-md-6">
                                <div class="form-group form-focus">
                                    <label class="focus-label">Phone Number</label>
                                    <input type="text" class="form-control floating" name="phone"
                                        value="{{ $data->phone }}">
                                </div>
                            </div>

                        </div>

                        {{-- <div class="card-box">
                            <h3 class="card-title">Education Informations</h3>
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="form-group form-focus">
                                        <label class="focus-label">Institution</label>
                                        <input type="text" class="form-control floating" value="Oxford University">
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="form-group form-focus">
                                        <label class="focus-label">Subject</label>
                                        <input type="text" class="form-control floating" value="Computer Science">
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="form-group form-focus">
                                        <label class="focus-label">Starting Date</label>
                                        <div class="cal-icon">
                                            <input type="text" class="form-control floating datetimepicker"
                                                value="01/06/2002">
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="form-group form-focus">
                                        <label class="focus-label">Complete Date</label>
                                        <div class="cal-icon">
                                            <input type="text" class="form-control floating datetimepicker"
                                                value="31/05/2006">
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="form-group form-focus">
                                        <label class="focus-label">Degree</label>
                                        <input type="text" class="form-control floating" value="BE Computer Science">
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="form-group form-focus">
                                        <label class="focus-label">Grade</label>
                                        <input type="text" class="form-control floating" value="Grade A">
                                    </div>
                                </div>
                            </div>
                            <div class="add-more">
                                <a href="#" class="btn btn-primary"><i class="fa fa-plus"></i> Add More
                                    Institute</a>
                            </div>
                        </div>
                        <div class="card-box">
                            <h3 class="card-title">Experience Informations</h3>
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="form-group form-focus">
                                        <label class="focus-label">Company Name</label>
                                        <input type="text" class="form-control floating"
                                            value="Digital Devlopment Inc">
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="form-group form-focus">
                                        <label class="focus-label">Location</label>
                                        <input type="text" class="form-control floating" value="United States">
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="form-group form-focus">
                                        <label class="focus-label">Job Position</label>
                                        <input type="text" class="form-control floating" value="Web Developer">
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="form-group form-focus">
                                        <label class="focus-label">Period From</label>
                                        <div class="cal-icon">
                                            <input type="text" class="form-control floating datetimepicker"
                                                value="01/07/2007">
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="form-group form-focus">
                                        <label class="focus-label">Period To</label>
                                        <div class="cal-icon">
                                            <input type="text" class="form-control floating datetimepicker"
                                                value="08/06/2018">
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="add-more">
                                <a href="#" class="btn btn-primary"><i class="fa fa-plus"></i> Add More
                                    Experience</a>
                            </div>
                        </div> --}}
                        <div class="text-center m-t-20">
                            <button class="btn btn-primary submit-btn" style="background-color:#16a085"
                                type="submit">Save</button>
                        </div>
                </form>
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
    <script src="assets/js/moment.min.js"></script>
    <script src="assets/js/bootstrap-datetimepicker.min.js"></script>
    <script src="assets/js/app.js"></script>
</body>


<!-- edit-profile23:05-->

</html>
