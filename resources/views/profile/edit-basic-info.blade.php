@extends('layouts.portal')

@section('title', 'Edit Profile')

@section('content')
    <div class="page-head">
        <div>
            <h4 class="page-title">Edit Basic Information</h4>
            <div class="page-sub">Update your personal and contact details</div>
        </div>
        <a href="/myprofile" class="btn btn-light-soft">Back to profile</a>
    </div>

    @if ($errors->any())
        <div class="alert alert-danger">
            <ul class="mb-0">
                @foreach ($errors->all() as $error)
                    <li>{{ $error }}</li>
                @endforeach
            </ul>
        </div>
    @endif

    <form action="{{ url('/update_basic_info', $data->id) }}" method="POST" enctype="multipart/form-data">
        @csrf

        <div class="row">
            <div class="col-lg-4">
                <div class="card text-center">
                    <div class="card-body">
                        <img class="rounded-circle profile-avatar"
                            src="{{ $data->profile_photo_path ? '/storage/'.$data->profile_photo_path : $data->profile_photo_url }}"
                            onerror="this.onerror=null;this.src='/images/avatar.png'" alt="{{ $data->name }}">
                        <h5 class="mt-3 mb-0">{{ $data->name }}</h5>
                        <div class="text-muted-2">{{ $data->email }}</div>
                    </div>
                </div>
            </div>

            <div class="col-lg-8">
                <div class="card">
                    <div class="card-body">
                        <h3 class="card-title">Basic Information</h3>
                        <div class="row">
                            <div class="col-md-6">
                                <div class="form-group">
                                    <label class="form-label">Full Name</label>
                                    <input type="text" class="form-control" value="{{ $data->name }}" name="name">
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="form-group">
                                    <label class="form-label">Birth Date</label>
                                    <input type="text" class="form-control datetimepicker" value="{{ $data->birthday }}" name="birthday">
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="form-group">
                                    <label class="form-label">Joinned Date</label>
                                    <input type="text" class="form-control datetimepicker" value="{{ $data->joinned_at }}" name="joinned_at">
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="form-group">
                                    <label class="form-label d-block">Gender</label>
                                    <div class="form-check form-check-inline">
                                        <input class="form-check-input" type="radio" name="gender" id="gender_male" value="Male" @checked($data->gender == 'Male')>
                                        <label class="form-check-label" for="gender_male">Male</label>
                                    </div>
                                    <div class="form-check form-check-inline">
                                        <input class="form-check-input" type="radio" name="gender" id="gender_female" value="Female" @checked($data->gender == 'Female')>
                                        <label class="form-check-label" for="gender_female">Female</label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="card">
                    <div class="card-body">
                        <h3 class="card-title">Contact Information</h3>
                        <div class="row">
                            <div class="col-md-6">
                                <div class="form-group">
                                    <label class="form-label">Address</label>
                                    <input type="text" class="form-control" name="address" value="{{ $data->address }}">
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="form-group">
                                    <label class="form-label">Nationality</label>
                                    <input type="text" class="form-control" name="nationality" value="{{ $data->nationality }}">
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="form-group">
                                    <label class="form-label">Region</label>
                                    <select class="form-select select2" name="region">
                                        <option value="{{ $data->region }}">-- {{ $data->region ?: 'Select region' }} --</option>
                                        <option value="Dire Dawa (city)">Dire Dawa (city)</option>
                                        <option value="Addis Ababa (city)">Addis Ababa (city)</option>
                                        <option value="Afar Region">Afar Region</option>
                                        <option value="Amhara Region">Amhara Region</option>
                                        <option value="Benishangul-Gumuz Region">Benishangul-Gumuz Region</option>
                                        <option value="Gambela Region">Gambela Region</option>
                                        <option value="Harari Region">Harari Region</option>
                                        <option value="Oromia Region">Oromia Region</option>
                                        <option value="Sidama Region">Sidama Region</option>
                                        <option value="Somali Region">Somali Region</option>
                                        <option value="South West Ethiopia Peoples' Region">South West Ethiopia Peoples' Region</option>
                                        <option value="Southern Nations, Nationalities, and Peoples' Region">Southern Nations, Nationalities, and Peoples' Region</option>
                                        <option value="Tigray Region">Tigray Region</option>
                                    </select>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="form-group">
                                    <label class="form-label">Phone Number</label>
                                    <input type="text" class="form-control" name="phone" value="{{ $data->phone }}">
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="card">
                    <div class="card-body">
                        <h3 class="card-title">Confirm with Password</h3>
                        <p class="text-muted-2">Enter your password to save these changes.</p>
                        <div class="row">
                            <div class="col-md-6">
                                <div class="form-group">
                                    <label class="form-label">Password</label>
                                    <input type="password" class="form-control" name="password">
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="form-group">
                                    <label class="form-label">Confirm Password</label>
                                    <input type="password" class="form-control" name="password_confirmation">
                                </div>
                            </div>
                        </div>
                        <div class="d-flex gap-2 mt-2">
                            <button class="btn btn-primary" type="submit"><i class="fa fa-check"></i> Save</button>
                            <a href="/myprofile" class="btn btn-light-soft">Cancel</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </form>
@endsection

@push('styles')
<style>
    .profile-avatar { width: 110px; height: 110px; object-fit: cover; border: 4px solid #fff; box-shadow: 0 2px 10px rgba(0,0,0,.1); }
</style>
@endpush

@push('scripts')
<script>
    document.addEventListener('DOMContentLoaded', function () {
        if (window.jQuery) {
            jQuery('.datetimepicker').datetimepicker({ format: 'YYYY-MM-DD', useCurrent: false });
            jQuery('.select2').select2({ width: '100%' });
        }
    });
</script>
@endpush
