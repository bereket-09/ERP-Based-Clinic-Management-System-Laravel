@extends('layouts.portal')

@section('title', 'Add Education Experience')

@section('content')
    <div class="row">
        <div class="col-lg-8 offset-lg-2">
            <div class="page-head">
                <h4 class="page-title">Add Education Experience</h4>
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
                    <form action="/add-edu-exp" method="POST" enctype="multipart/form-data">
                        @csrf
                        <div class="form-group">
                            <label class="form-label">Select User</label>
                            <select class="form-control" name="u_id">
                                @foreach ($users as $user)
                                    <option value="{{ $user->id }}">{{ $user->name }}</option>
                                @endforeach
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Select Education Level</label>
                            <select class="form-control" name="level">
                                <option value="UG">Under Graduate (Bacheler Degree)</option>
                                <option value="PG">POST Graduate (Masters Degree)</option>
                                <option value="Phd">Doctorate (Phd)</option>
                                <option value="TVET">TVET</option>
                                <option value="Preparatory">Preparatory</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Institution Name</label>
                            <input class="form-control" type="text" onkeypress="return /[a-z]/i.test(event.key)"
                                name="inst" placeholder="Enter institution name" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Field of Study</label>
                            <input class="form-control" onkeypress="return /[a-z]/i.test(event.key)" type="text"
                                placeholder="Enter field" name="field" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Started Date</label>
                            <input class="form-control" type="date" name="Started_Date" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Ended Date</label>
                            <input class="form-control" type="date" name="Ended_Date" required>
                        </div>
                        <div class="d-flex gap-2 mt-4">
                            <button type="submit" class="btn btn-primary"><i class="fa fa-check"></i> Add Information</button>
                            <a href="/view-edu-exp" class="btn btn-light-soft">Cancel</a>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
@endsection
