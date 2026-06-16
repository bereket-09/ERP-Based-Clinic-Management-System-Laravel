@extends('layouts.portal')

@section('title', 'Education Experience')

@section('content')
    @php($userNames = $user->pluck('name', 'id'))

    <div class="page-head">
        <div>
            <h4 class="page-title">Education Experience of Employees</h4>
            <div class="page-sub">{{ count($edu_exp) }} record{{ count($edu_exp) == 1 ? '' : 's' }}</div>
        </div>
        <a href="{{ url('/add-edu-exp') }}" class="btn btn-primary btn-rounded">
            <i class="fa fa-plus"></i> Add Education Experience
        </a>
    </div>

    <div class="card table-card">
        <div class="table-responsive">
            <table class="table table-striped custom-table mb-0">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>User Name</th>
                        <th style="min-width:200px;">Institution Name</th>
                        <th>Level</th>
                        <th>Field of Study</th>
                        <th>From</th>
                        <th>To</th>
                    </tr>
                </thead>
                <tbody>
                    @forelse ($edu_exp as $data)
                        <tr>
                            <td>{{ $data->id }}</td>
                            <td>{{ $userNames[$data->u_id] ?? '—' }}</td>
                            <td>{{ $data->inst }}</td>
                            <td>{{ $data->level }}</td>
                            <td>{{ $data->field }}</td>
                            <td>{{ $data->from }}</td>
                            <td>{{ $data->to }}</td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="7">
                                <div class="empty-state">
                                    <div class="empty-icon"><i class="fa fa-graduation-cap"></i></div>
                                    <h5>No education records found</h5>
                                    <p>Add an education experience to get started.</p>
                                </div>
                            </td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>
    </div>
@endsection
