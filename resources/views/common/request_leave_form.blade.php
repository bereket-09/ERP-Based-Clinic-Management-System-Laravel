@extends('layouts.portal')

@section('title', 'Request Leave')

@section('content')
    <div class="row">
        <div class="col-lg-8 offset-lg-2">
            <div class="page-head">
                <h4 class="page-title">Request Work Leave</h4>
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

            <div class="card">
                <div class="card-body">
                    <form action="/send_leave_request" method="POST" enctype="multipart/form-data">
                        @csrf
                        <input type="hidden" value="{{ Auth::user()->id }}" name="u_id">
                        <div class="row">
                            <div class="col-sm-6">
                                <div class="form-group">
                                    <label class="form-label">From <span class="text-danger">*</span></label>
                                    <input type="date" class="form-control" name="from" required>
                                </div>
                            </div>
                            <div class="col-sm-6">
                                <div class="form-group">
                                    <label class="form-label">Upto <span class="text-danger">*</span></label>
                                    <input type="date" class="form-control" name="to" required>
                                </div>
                            </div>
                            <div class="col-sm-12">
                                <div class="form-group">
                                    <label class="form-label">Reason for this leave request <span class="text-danger">*</span></label>
                                    <textarea class="form-control" rows="4" required name="desc" autocomplete="off" placeholder="Briefly explain why you need this leave"></textarea>
                                </div>
                            </div>
                        </div>

                        <div class="d-flex gap-2 mt-3">
                            <button type="submit" class="btn btn-primary"><i class="fa fa-paper-plane"></i> Request Leave</button>
                            <a href="/my-leave-requests" class="btn btn-light-soft">Cancel</a>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
@endsection
