@extends('layouts.portal')

@section('title', 'Add Lab Test Type')

@section('content')
    <div class="row">
        <div class="col-lg-8 offset-lg-2">
            <div class="page-head">
                <div>
                    <h4 class="page-title">Add lab test type</h4>
                    <div class="page-sub">Define a new test that doctors can order from the lab.</div>
                </div>
                <a href="/view_all_tests" class="btn btn-light-soft btn-rounded">
                    <i class="fa fa-arrow-left"></i> Back to list
                </a>
            </div>

            <div class="card">
                <div class="card-body">
                    @if ($errors->any())
                        <div class="alert alert-danger">
                            <ul class="mb-0">
                                @foreach ($errors->all() as $error)
                                    <li>{{ $error }}</li>
                                @endforeach
                            </ul>
                        </div>
                    @endif

                    <form action="/add_test_type" method="POST" enctype="multipart/form-data">
                        @csrf
                        <div class="form-group">
                            <label class="form-label">Test name</label>
                            <input class="form-control @error('name') is-invalid @enderror" type="text" name="name"
                                value="{{ old('name') }}" placeholder="e.g. Complete Blood Count">
                            @error('name') <div class="field-error">{{ $message }}</div> @enderror
                        </div>

                        <div class="form-group">
                            <label class="form-label">Description</label>
                            <textarea cols="30" rows="4" class="form-control @error('desc') is-invalid @enderror"
                                name="desc" placeholder="What does this test measure?">{{ old('desc') }}</textarea>
                            <div class="input-hint">Optional — a short note shown to doctors and lab staff.</div>
                            @error('desc') <div class="field-error">{{ $message }}</div> @enderror
                        </div>

                        <div class="form-group">
                            <label class="form-label display-block">Test status</label>
                            <div class="form-check form-check-inline">
                                <input class="form-check-input" type="radio" name="status" id="product_active"
                                    value="Active" {{ old('status', 'Active') === 'Active' ? 'checked' : '' }}>
                                <label class="form-check-label" for="product_active">Active</label>
                            </div>
                            <div class="form-check form-check-inline">
                                <input class="form-check-input" type="radio" name="status" id="product_inactive"
                                    value="Inactive" {{ old('status') === 'Inactive' ? 'checked' : '' }}>
                                <label class="form-check-label" for="product_inactive">Inactive</label>
                            </div>
                        </div>

                        <div class="d-flex gap-2 mt-4">
                            <button type="submit" class="btn btn-primary">
                                <i class="fa fa-check"></i> Create Lab Test
                            </button>
                            <a href="/view_all_tests" class="btn btn-light-soft">Cancel</a>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
@endsection
