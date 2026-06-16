@extends('layouts.portal')

@section('title', 'Work Experience')

@section('content')
    @php($userNames = $user->pluck('name', 'id'))

    <div class="page-head">
        <div>
            <h4 class="page-title">Work Experience of Employees</h4>
            <div class="page-sub">{{ count($work_exp) }} record{{ count($work_exp) == 1 ? '' : 's' }}</div>
        </div>
        <a href="{{ url('/add-work-exp') }}" class="btn btn-primary btn-rounded">
            <i class="fa fa-plus"></i> Add Work Experience
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
                        <th>Field</th>
                        <th>Since</th>
                    </tr>
                </thead>
                <tbody>
                    @forelse ($work_exp as $data)
                        <tr>
                            <td>{{ $data->id }}</td>
                            <td>{{ $userNames[$data->u_id] ?? '—' }}</td>
                            <td>{{ $data->inst }}</td>
                            <td>{{ $data->field }}</td>
                            <td>{{ $data->started }}</td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="5">
                                <div class="empty-state">
                                    <div class="empty-icon"><i class="fa fa-briefcase"></i></div>
                                    <h5>No work records found</h5>
                                    <p>Add a work experience to get started.</p>
                                </div>
                            </td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>
    </div>
@endsection
