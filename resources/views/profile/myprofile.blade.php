@extends('layouts.portal')

@section('title', 'My Profile')

@php
    $me = \App\Models\User::find($user);
    $roleNames = ['0' => 'Receptionist', '1' => 'Doctor', '2' => 'Labratorist', '3' => 'Pharmacist', '4' => 'Manager'];
    $roleLabel = $roleNames[(string) ($me->role ?? '')] ?? 'Staff';
@endphp

@section('content')
    <div class="profile-shell fade-in">
        {{-- Cover / header band --}}
        <div class="profile-cover">
            <div class="profile-cover-band"></div>
            <div class="profile-cover-body">
                <div class="profile-avatar-wrap">
                    <img class="profile-avatar"
                        src="{{ $me && $me->profile_photo_path ? '/storage/' . $me->profile_photo_path : '/images/avatar.png' }}"
                        onerror="this.onerror=null;this.src='/images/avatar.png'" alt="{{ $me->name ?? 'User' }}">
                </div>
                <div class="profile-identity">
                    <h1 class="profile-name">{{ $me->name ?? 'Unknown user' }}</h1>
                    <div class="profile-role">
                        <span class="profile-role-tag">{{ $roleLabel }}</span>
                        @if (!empty($me->speciality))
                            <span class="profile-speciality">{{ $me->speciality }}</span>
                        @endif
                    </div>
                    <div class="profile-chips">
                        @if (!empty($me->phone))
                            <span class="profile-chip"><i class="fa fa-phone"></i> {{ $me->phone }}</span>
                        @endif
                        @if (!empty($me->email))
                            <span class="profile-chip"><i class="fa fa-envelope-o"></i> {{ $me->email }}</span>
                        @endif
                        @if (!empty($me->region))
                            <span class="profile-chip"><i class="fa fa-map-marker"></i> {{ $me->region }}</span>
                        @endif
                    </div>
                </div>
                <div class="profile-cover-actions">
                    <a href="{{ url('/edit-basic-info', $me->id ?? $user) }}" class="btn btn-primary btn-rounded">
                        <i class="fa fa-pencil"></i> Edit profile
                    </a>
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
                        <div class="profile-dl-row"><dt>Employee ID</dt><dd class="tnum">{{ $me->id ?? '—' }}</dd></div>
                        <div class="profile-dl-row"><dt>Full name</dt><dd>{{ $me->name ?? '—' }}</dd></div>
                        <div class="profile-dl-row"><dt>Email</dt><dd>{{ $me->email ?: '—' }}</dd></div>
                        <div class="profile-dl-row"><dt>Phone</dt><dd>{{ $me->phone ?: '—' }}</dd></div>
                        <div class="profile-dl-row"><dt>Gender</dt><dd>{{ $me->gender ?: '—' }}</dd></div>
                        <div class="profile-dl-row"><dt>Birthday</dt><dd class="tnum">{{ $me->birthday ?: '—' }}</dd></div>
                        <div class="profile-dl-row"><dt>Nationality</dt><dd>{{ $me->nationality ?: '—' }}</dd></div>
                        <div class="profile-dl-row"><dt>Region</dt><dd>{{ $me->region ?: '—' }}</dd></div>
                        <div class="profile-dl-row"><dt>Address</dt><dd>{{ $me->address ?: '—' }}</dd></div>
                        <div class="profile-dl-row"><dt>Speciality</dt><dd>{{ $me->speciality ?: '—' }}</dd></div>
                        <div class="profile-dl-row"><dt>Joined</dt><dd class="tnum">{{ $me->joinned_at ?: '—' }}</dd></div>
                    </dl>
                </div>

                {{-- Education --}}
                <div class="tab-pane fade" id="tab-education">
                    <div class="profile-section-head">
                        <h3 class="profile-section-title mb-0">Education</h3>
                        <a href="/add-edu-exp" class="btn btn-sm btn-primary btn-rounded"><i class="fa fa-plus"></i> Add education</a>
                    </div>
                    @if ($Edu && count($Edu))
                        <ul class="profile-timeline">
                            @foreach ($Edu as $edu)
                                <li class="profile-timeline-item">
                                    <span class="profile-timeline-dot"></span>
                                    <div class="profile-timeline-body">
                                        <div class="profile-timeline-title">{{ $edu->inst ?: 'Institution' }}</div>
                                        <div class="profile-timeline-sub">
                                            {{ $edu->field ?: '—' }}@if (!empty($edu->level)) <span class="profile-badge">{{ $edu->level }}</span>@endif
                                        </div>
                                        <div class="profile-timeline-time tnum">{{ $edu->from ?: '—' }} &ndash; {{ $edu->to ?: 'Present' }}</div>
                                    </div>
                                </li>
                            @endforeach
                        </ul>
                    @else
                        <div class="empty-state">
                            <div class="empty-icon"><i class="fa fa-graduation-cap"></i></div>
                            <h5>No education records yet</h5>
                            <p>Add your education history to complete your profile.</p>
                            <a href="/add-edu-exp" class="btn btn-primary btn-rounded mt-2"><i class="fa fa-plus"></i> Add education</a>
                        </div>
                    @endif
                </div>

                {{-- Experience --}}
                <div class="tab-pane fade" id="tab-experience">
                    <div class="profile-section-head">
                        <h3 class="profile-section-title mb-0">Experience</h3>
                        <a href="/add-work-exp" class="btn btn-sm btn-primary btn-rounded"><i class="fa fa-plus"></i> Add experience</a>
                    </div>
                    @if ($Work && count($Work))
                        <ul class="profile-timeline">
                            @foreach ($Work as $work)
                                <li class="profile-timeline-item">
                                    <span class="profile-timeline-dot"></span>
                                    <div class="profile-timeline-body">
                                        <div class="profile-timeline-title">{{ $work->field ?: 'Role' }}</div>
                                        <div class="profile-timeline-sub">{{ $work->inst ?: '—' }}</div>
                                        <div class="profile-timeline-time tnum">{{ $work->started ?: '—' }} &ndash; Present</div>
                                    </div>
                                </li>
                            @endforeach
                        </ul>
                    @else
                        <div class="empty-state">
                            <div class="empty-icon"><i class="fa fa-briefcase"></i></div>
                            <h5>No experience records yet</h5>
                            <p>Add your work experience to complete your profile.</p>
                            <a href="/add-work-exp" class="btn btn-primary btn-rounded mt-2"><i class="fa fa-plus"></i> Add experience</a>
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
