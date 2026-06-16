@extends('layouts.portal')

@section('title', 'Leave Request')

@section('content')
    <div class="page-head">
        <div>
            <h4 class="page-title">Leave Request</h4>
            <div class="page-sub">Review and decide on this request</div>
        </div>
        <a href="/view-leave-request" class="btn btn-light-soft">Back to list</a>
    </div>

    <div class="row">
        <div class="col-lg-4">
            <div class="card profile-card text-center">
                <div class="card-body">
                    <img class="rounded-circle profile-avatar"
                        src="{{ $user->profile_photo_path ? '/storage/'.$user->profile_photo_path : $user->profile_photo_url }}"
                        onerror="this.onerror=null;this.src='/images/avatar.png'" alt="{{ $user->name }}">
                    <h4 class="mt-3 mb-1">{{ $user->name }}</h4>
                    <div class="text-muted-2">
                        @switch($user->role)
                            @case('0') Reception @break
                            @case('1') Doctor @break
                            @case('2') Labratorist @break
                            @case('3') Pharmacist @break
                            @case('4') Manager @break
                            @default Staff
                        @endswitch
                    </div>
                    <hr>
                    <ul class="info-rows text-left">
                        <li><span class="info-label">Email</span><span class="info-val">{{ $user->email }}</span></li>
                        <li><span class="info-label">Gender</span><span class="info-val">{{ $user->gender ?: '—' }}</span></li>
                        <li><span class="info-label">Phone</span><span class="info-val">{{ $user->phone ?: '—' }}</span></li>
                    </ul>
                </div>
            </div>
        </div>

        <div class="col-lg-8">
            <div class="card">
                <div class="card-body">
                    <h3 class="card-title">Requested Period</h3>
                    <div class="row mb-3">
                        <div class="col-md-6">
                            <span class="text-muted-2">From</span>
                            <div class="info-val">{{ $work_leave->from }}</div>
                        </div>
                        <div class="col-md-6">
                            <span class="text-muted-2">Upto</span>
                            <div class="info-val">{{ $work_leave->to }}</div>
                        </div>
                    </div>
                    <span class="text-muted-2">Reason</span>
                    <p>{{ $work_leave->desc }}</p>

                    <hr>

                    <form action="/submit_request_result/{{ $work_leave->id }}" method="POST" enctype="multipart/form-data">
                        @csrf
                        <div class="form-group">
                            <label class="form-label">Comment</label>
                            <textarea cols="30" rows="4" class="form-control" name="comment">{{ $work_leave->comment }}</textarea>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Decision</label>
                            <select class="form-select" id="status" name="status" required>
                                <option value="Accepted">Accept Request</option>
                                <option value="Rejected">Reject Request</option>
                            </select>
                        </div>
                        <div class="d-flex gap-2 mt-3">
                            <button class="btn btn-primary" type="submit"><i class="fa fa-check"></i> Submit Decision</button>
                            <a href="/view-leave-request" class="btn btn-light-soft">Cancel</a>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
@endsection

@push('styles')
<style>
    .profile-avatar { width: 110px; height: 110px; object-fit: cover; border: 4px solid #fff; box-shadow: 0 2px 10px rgba(0,0,0,.1); }
    .info-rows { list-style: none; padding: 0; margin: 0; }
    .info-rows li { display: flex; justify-content: space-between; gap: 1rem; padding: .55rem 0; border-bottom: 1px solid rgba(0,0,0,.05); font-size: .9rem; }
    .info-rows li:last-child { border-bottom: 0; }
    .info-label { color: #6b7c8d; }
    .info-val { font-weight: 600; }
    .text-left { text-align: left; }
</style>
@endpush
