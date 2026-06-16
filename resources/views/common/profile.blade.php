@extends('layouts.portal')

@section('title', $data->name ?? 'Profile')

@php
    $edu = \App\Models\Edu_info::where('u_id', $data->id)->get();
    $work = \App\Models\Work_exp::where('u_id', $data->id)->get();
    $roleNames = ['0' => 'Receptionist', '1' => 'Doctor', '2' => 'Labratorist', '3' => 'Pharmacist', '4' => 'Manager'];
    $roleLabel = $roleNames[(string) $data->role] ?? 'Staff';
@endphp

@section('content')
    <div class="profile-shell fade-in">
        {{-- Cover / header band --}}
        <div class="profile-cover">
            <div class="profile-cover-band"></div>
            <div class="profile-cover-body">
                <div class="profile-avatar-wrap">
                    <img class="profile-avatar"
                        src="{{ $data->profile_photo_path ? '/storage/' . $data->profile_photo_path : '/images/avatar.png' }}"
                        onerror="this.onerror=null;this.src='/images/avatar.png'" alt="{{ $data->name }}">
                </div>
                <div class="profile-identity">
                    <h1 class="profile-name">{{ $data->name }}</h1>
                    <div class="profile-role">
                        <span class="profile-role-tag">{{ $roleLabel }}</span>
                        @if (!empty($data->speciality))
                            <span class="profile-speciality">{{ $data->speciality }}</span>
                        @endif
                    </div>
                    <div class="profile-chips">
                        @if (!empty($data->phone))
                            <span class="profile-chip"><i class="fa fa-phone"></i> {{ $data->phone }}</span>
                        @endif
                        @if (!empty($data->email))
                            <span class="profile-chip"><i class="fa fa-envelope-o"></i> {{ $data->email }}</span>
                        @endif
                        @if (!empty($data->region))
                            <span class="profile-chip"><i class="fa fa-map-marker"></i> {{ $data->region }}</span>
                        @endif
                    </div>
                </div>
                <div class="profile-cover-actions">
                    @if (Auth::user()->role == '4')
                        <a href="{{ url('/updateEmployee', $data->id) }}" class="btn btn-primary btn-rounded">
                            <i class="fa fa-pencil"></i> Edit profile
                        </a>
                    @elseif ($data->id == Auth::user()->id)
                        <a href="/user/profile" class="btn btn-primary btn-rounded">
                            <i class="fa fa-pencil"></i> Edit profile
                        </a>
                    @endif
                </div>
            </div>
        </div>

        {{-- Tabbed section --}}
        <div class="card profile-tabs-card">
            <ul class="nav nav-tabs profile-nav" id="profileTabs" role="tablist">
                <li class="nav-item"><a class="nav-link active" href="#tab-about" data-toggle="tab"><i class="fa fa-user-o"></i> About</a></li>
                <li class="nav-item"><a class="nav-link" href="#tab-education" data-toggle="tab"><i class="fa fa-graduation-cap"></i> Education</a></li>
                <li class="nav-item"><a class="nav-link" href="#tab-experience" data-toggle="tab"><i class="fa fa-briefcase"></i> Experience</a></li>
            </ul>

            <div class="tab-content profile-tab-content">
                {{-- About --}}
                <div class="tab-pane fade show active" id="tab-about">
                    <h3 class="profile-section-title">Personal information</h3>
                    <dl class="profile-dl">
                        <div class="profile-dl-row"><dt>Employee ID</dt><dd class="tnum">{{ $data->id }}</dd></div>
                        <div class="profile-dl-row"><dt>Full name</dt><dd>{{ $data->name }}</dd></div>
                        <div class="profile-dl-row"><dt>Email</dt><dd>{{ $data->email ?: '—' }}</dd></div>
                        <div class="profile-dl-row"><dt>Phone</dt><dd>{{ $data->phone ?: '—' }}</dd></div>
                        <div class="profile-dl-row"><dt>Gender</dt><dd>{{ $data->gender ?: '—' }}</dd></div>
                        <div class="profile-dl-row"><dt>Birthday</dt><dd class="tnum">{{ $data->birthday ?: '—' }}</dd></div>
                        <div class="profile-dl-row"><dt>Nationality</dt><dd>{{ $data->nationality ?: '—' }}</dd></div>
                        <div class="profile-dl-row"><dt>Region</dt><dd>{{ $data->region ?: '—' }}</dd></div>
                        <div class="profile-dl-row"><dt>Address</dt><dd>{{ $data->address ?: '—' }}</dd></div>
                        <div class="profile-dl-row"><dt>Speciality</dt><dd>{{ $data->speciality ?: '—' }}</dd></div>
                        <div class="profile-dl-row"><dt>Joined</dt><dd class="tnum">{{ $data->joinned_at ?: '—' }}</dd></div>
                    </dl>
                </div>

                {{-- Education --}}
                <div class="tab-pane fade" id="tab-education">
                    <h3 class="profile-section-title">Education</h3>
                    @if (count($edu))
                        <ul class="profile-timeline">
                            @foreach ($edu as $e)
                                <li class="profile-timeline-item">
                                    <span class="profile-timeline-dot"></span>
                                    <div class="profile-timeline-body">
                                        <div class="profile-timeline-title">{{ $e->inst ?: 'Institution' }}</div>
                                        <div class="profile-timeline-sub">
                                            {{ $e->field ?: '—' }}@if (!empty($e->level)) <span class="profile-badge">{{ $e->level }}</span>@endif
                                        </div>
                                        <div class="profile-timeline-time tnum">{{ $e->from ?: '—' }} &ndash; {{ $e->to ?: 'Present' }}</div>
                                    </div>
                                </li>
                            @endforeach
                        </ul>
                    @else
                        <div class="empty-state">
                            <div class="empty-icon"><i class="fa fa-graduation-cap"></i></div>
                            <h5>No education records</h5>
                            <p>This user has not added any education history.</p>
                        </div>
                    @endif
                </div>

                {{-- Experience --}}
                <div class="tab-pane fade" id="tab-experience">
                    <h3 class="profile-section-title">Experience</h3>
                    @if (count($work))
                        <ul class="profile-timeline">
                            @foreach ($work as $w)
                                <li class="profile-timeline-item">
                                    <span class="profile-timeline-dot"></span>
                                    <div class="profile-timeline-body">
                                        <div class="profile-timeline-title">{{ $w->field ?: 'Role' }}</div>
                                        <div class="profile-timeline-sub">{{ $w->inst ?: '—' }}</div>
                                        <div class="profile-timeline-time tnum">{{ $w->started ?: '—' }} &ndash; Present</div>
                                    </div>
                                </li>
                            @endforeach
                        </ul>
                    @else
                        <div class="empty-state">
                            <div class="empty-icon"><i class="fa fa-briefcase"></i></div>
                            <h5>No experience records</h5>
                            <p>This user has not added any work experience.</p>
                        </div>
                    @endif
                </div>
            </div>
        </div>
    </div>
@endsection

@push('styles')
@include('common.profile-styles')
@endpush
