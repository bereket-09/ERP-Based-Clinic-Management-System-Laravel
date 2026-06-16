@extends('layouts.portal')

@section('title', 'Add Work Experience')

@section('content')
    <div class="row">
        <div class="col-lg-8 offset-lg-2">
            <div class="page-head">
                <h4 class="page-title">Add Work Experience</h4>
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
                    <form action="/add-work-exp" method="POST" enctype="multipart/form-data">
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
                            <label class="form-label">Institution Name</label>
                            <input class="form-control" type="text" name="inst"
                                placeholder="Enter institution name" onkeypress="return /[a-z]/i.test(event.key)" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Field of Study</label>
                            <input class="form-control" type="text" placeholder="Enter field of work"
                                name="field" onkeypress="return /[a-z]/i.test(event.key)" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Started Date</label>
                            <input class="form-control" type="date" name="started" required>
                        </div>
                        <div class="d-flex gap-2 mt-4">
                            <button type="submit" class="btn btn-primary"><i class="fa fa-check"></i> Add Work Experience</button>
                            <a href="/view-work-exp" class="btn btn-light-soft">Cancel</a>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
@endsection
