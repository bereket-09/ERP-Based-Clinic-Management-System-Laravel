@extends('layouts.portal')

@section('title', 'Edit Employee')

@section('content')
    <div class="row">
        <div class="col-lg-8 offset-lg-2">
            <div class="page-head">
                <h4 class="page-title">Edit Employee</h4>
            </div>

            @if ($errors->any())
                <div class="alert alert-danger">
                    <ul class="mb-0 pl-3">
                        @foreach ($errors->all() as $error)
                            <li>{{ $error }}</li>
                        @endforeach
                    </ul>
                </div>
            @endif

            <div class="card">
                <div class="card-body">
                    <form action="{{ url('/updateAemployee', $data->id) }}" method="POST" enctype="multipart/form-data">
                        @csrf
                        <div class="row">
                            <div class="col-sm-6">
                                <div class="form-group">
                                    <label class="form-label">Full Name <span class="text-danger">*</span></label>
                                    <input type="text" class="form-control @error('name') is-invalid @enderror"
                                        name="name" value="{{ $data->name }}" required autofocus autocomplete="name">
                                    @error('name') <div class="field-error">{{ $message }}</div> @enderror
                                </div>
                            </div>
                            <div class="col-sm-6">
                                <div class="form-group">
                                    <label class="form-label">Email <span class="text-danger">*</span></label>
                                    <input type="email" class="form-control @error('email') is-invalid @enderror"
                                        name="email" value="{{ $data->email }}" required>
                                    @error('email') <div class="field-error">{{ $message }}</div> @enderror
                                </div>
                            </div>
                            <div class="col-sm-6">
                                <div class="form-group">
                                    <label class="form-label">Birth Date <span class="text-danger">*</span></label>
                                    <input class="form-control" type="date" name="birthday" value="{{ $data->birthday }}">
                                </div>
                            </div>
                            <div class="col-sm-6">
                                <div class="form-group">
                                    <label class="form-label">Joining Date <span class="text-danger">*</span></label>
                                    <input class="form-control" type="date" name="joinned_at" value="{{ $data->joinned_at }}">
                                </div>
                            </div>
                            <div class="col-sm-6">
                                <div class="form-group">
                                    <label class="form-label">Address <span class="text-danger">*</span></label>
                                    <input type="text" class="form-control" required name="address"
                                        value="{{ $data->address }}" autocomplete="address">
                                </div>
                            </div>
                            <div class="col-sm-6">
                                <div class="form-group">
                                    <label class="form-label">Region</label>
                                    <select class="form-control" name="region">
                                        <option value="{{ $data->region }}">-- {{ $data->region }} --</option>
                                        <option value="Dire Dawa (city) "> Dire Dawa (city) </option>
                                        <option value="Addis Ababa (city)">Addis Ababa (city)</option>
                                        <option value="Afar Region"> Afar Region</option>
                                        <option value="Amhara Region">Amhara Region</option>
                                        <option value="Benishangul-Gumuz Region">Benishangul-Gumuz Region</option>
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
                                        <option value="Tigray Region"> Tigray Region</option>
                                    </select>
                                </div>
                            </div>
                            <div class="col-sm-6">
                                <div class="form-group">
                                    <label class="form-label">Phone</label>
                                    <input class="form-control" type="phone" name="phone" autocomplete="phone"
                                        value="{{ $data->phone }}">
                                </div>
                            </div>
                            <div class="col-sm-6">
                                <div class="form-group">
                                    <label class="form-label display-block">Gender</label>
                                    @if ($data->gender == 'Male')
                                        <div class="form-check form-check-inline">
                                            <input class="form-check-input" type="radio" name="gender"
                                                id="employee_active" value="Male" checked>
                                            <label class="form-check-label" for="employee_active">Male</label>
                                        </div>
                                        <div class="form-check form-check-inline">
                                            <input class="form-check-input" type="radio" name="gender"
                                                id="employee_inactive" value="Female">
                                            <label class="form-check-label" for="employee_inactive">Female</label>
                                        </div>
                                    @else
                                        <div class="form-check form-check-inline">
                                            <input class="form-check-input" type="radio" name="gender"
                                                id="employee_active" value="Male">
                                            <label class="form-check-label" for="employee_active">Male</label>
                                        </div>
                                        <div class="form-check form-check-inline">
                                            <input class="form-check-input" type="radio" name="gender"
                                                id="employee_inactive" value="Female" checked>
                                            <label class="form-check-label" for="employee_inactive">Female</label>
                                        </div>
                                    @endif
                                </div>
                            </div>
                            <div class="col-sm-6">
                                <div class="form-group">
                                    <label class="form-label">Role</label>
                                    <select class="form-control" name="role">
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
                                            @endif --
                                        </option>
                                        <option value="0">Receptionist</option>
                                        <option value="1">Doctor</option>
                                        <option value="2">Laboratorist</option>
                                        <option value="3">Pharmacist</option>
                                        <option value="4">Manager</option>
                                    </select>
                                </div>
                            </div>
                            @if ($data->role == '1')
                                <div class="col-sm-6">
                                    <div class="form-group">
                                        <label class="form-label">Speciality</label>
                                        <input class="form-control" type="text" name="speciality"
                                            autocomplete="speciality" value="{{ $data->speciality }}">
                                    </div>
                                </div>
                            @endif
                            <div class="col-sm-6">
                                <div class="form-group">
                                    <label class="form-label">Nationality</label>
                                    <select class="form-control" name="nationality">
                                        <option value="{{ $data->nationality }}">--{{ $data->nationality }} --</option>
                                        <option value="Ethiopian">Ethiopian</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div class="d-flex gap-2 mt-4">
                            <button type="submit" class="btn btn-primary"><i class="fa fa-check"></i> Update Employee</button>
                            <a href="/employeeList" class="btn btn-light-soft">Cancel</a>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
@endsection
