<!DOCTYPE html>
<html lang="en">
{{-- {{ dd($id) }} --}}
@if (!Auth::user())
    @php
        header('Location: ' . URL::to('/login'), true, 302);
        exit();
    @endphp
@endif

<!-- add-patient24:06-->

@include('head');

<body>

    <div class="main-wrapper">
        @include('navbar');
        @include('reception.sidebar');
        <div class="page-wrapper">
            <div class="content">
                <div class="row">
                    <div class="col-lg-8 offset-lg-2">
                        <h4 class="page-title">Add Patient with ID number <span class="text-success">'
                                {{ $id }} '</span> </h4>
                    </div>
                </div>
                <center>
                    @if ($errors->any())
                        <div class="w-4/8 m-auto text-center">
                            @foreach ($errors->all() as $error)
                                <li class="text-red-500 list-box">
                                    {{ $error }}
                                </li>
                            @endforeach
                    @endif

                </center>
                <div class="row">
                    <div class="col-lg-8 offset-lg-2">
                        <form action="/add_patient" method="get" enctype="multipart/form-data">
                            @csrf
                            <div class="row">
                                <div class="col-sm-6">
                                    <div class="form-group">
                                        <label>FUll Name <span class="text-danger">*</span></label>
                                        <input class="form-control" type="text" name="name" required
                                            onkeypress="return /[a-z]/i.test(event.key)">
                                        <input class="form-control" type="hidden" name="stud_id"
                                            value="{{ $id }}">
                                    </div>
                                </div>
                                <div class="col-sm-6">
                                    <div class="form-group">
                                        <label>Medical Record Number (MRN)<span class="text-danger">*</span>
                                        </label>
                                        <input class="form-control" type="number" name="MRN" min="0"
                                            minlength="5" required>
                                    </div>
                                </div>


                                <div class="col-sm-6">
                                    <div class="form-group">
                                        <label>Date of Birth <span class="text-danger">*</span></label>
                                        <div class="cal-icon">
                                            <input type="date" class="form-control datetimepicker" name="birthday"
                                                required>
                                        </div>
                                    </div>
                                </div>

                                {{-- GENDEr --}}
                                <div class="col-sm-6">
                                    <div class="form-group">
                                        <label class="display-block">Gender <span class="text-danger">*</span></label>
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
                                    </div>
                                </div>




                                <div class="col-sm-6">
                                    <div class="form-group">
                                        <label>Departement <span class="text-danger">*</span></label>
                                        <input type="text" class="form-control" required name="dept"
                                            autocomplete="dept" onkeypress="return /[a-z]/i.test(event.key)">
                                    </div>
                                </div>
                                <div class="col-sm-6">
                                    <div class="form-group">
                                        <label>Year <span class="text-danger">*</span></label>
                                        <input type="number" class="form-control" required name="year"
                                            autocomplete="number" min="1" max="7">
                                    </div>
                                </div>
                                <div class="col-sm-6">
                                    <div class="form-group">
                                        <label>Block Name<span class="text-danger">*</span>
                                        </label>
                                        <input class="form-control" type="text" name="block" required
                                            onkeypress="return /[a-z]/i.test(event.key)">
                                    </div>
                                </div>
                                <div class="col-sm-6">
                                    <div class="form-group">
                                        <label>DORM Number<span class="text-danger">*</span>
                                        </label>
                                        <input class="form-control" type="text" name="dorm" required>
                                    </div>
                                </div>

                                <div class="col-sm-6">
                                    <div class="form-group">
                                        <label>Address <span class="text-danger">*</span></label>
                                        <input type="text" class="form-control" required name="address"
                                            autocomplete="address">
                                    </div>

                                </div>
                                <div class="col-sm-6">
                                    <div class="form-group">
                                        <label>Region <span class="text-danger">*</span></label>
                                        <select class="select" name="region" style="width:420px;">
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
                                            <option value="South West Ethiopia Peoples' Region">South West Ethiopia
                                                Peoples' Region </option>
                                            <option value="Southern Nations, Nationalities, and Peoples' Region">
                                                Southern Nations, Nationalities, and Peoples' Region
                                            </option>
                                            <option value="South West Ethiopia Peoples' Region">South West Ethiopia
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
                                            name="phone" autocomplete="phone">
                                    </div>
                                </div>




                                <div class="col-sm-6">
                                    <div class="form-group">
                                        <label>Nationality</label>
                                        <select class="select" name="nationality" class="form-select"
                                            style="width:425px;">
                                            <option value="Ethiopian">Ethiopian</option>
                                            <option value="other">Other</option>

                                            {{-- <option>Nurse</option> --}}
                                            {{-- <option>Accountant</option> --}}

                                        </select>
                                    </div>
                                </div>
                                <div class="col-sm-6">
                                    <div class="form-group">
                                        <label>Blood Type </label>
                                        <input type="text" class="form-control" required name="bloodtype"
                                            autocomplete="bloodtype">
                                    </div>

                                </div>


                                <div class="col-sm-6">
                                    <div class="form-group">
                                        <label>Assign to Doctor</label>
                                        <select class="select" name="doc_id" class="form-select"
                                            style="width:425px;">
                                            @foreach ($doctors as $doctor)
                                                <option value="{{ $doctor->id }}">{{ $doctor->name }}</option>
                                            @endforeach

                                            {{-- <option>Nurse</option> --}}
                                            {{-- <option>Accountant</option> --}}

                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div class="m-t-20 text-center">
                                <input type="submit" class="btn btn-primary submit-btn" style="background: #16a085;"
                                    value="Create Patient">
                            </div>
                        </form>
                    </div>
                </div>
            </div>

        </div>
    </div>

</body>


<!-- add-patient24:07-->

</html>
