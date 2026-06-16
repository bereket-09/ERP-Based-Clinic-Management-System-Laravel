@extends('layouts.portal')

@section('title', 'Register Patient')

@push('styles')
<style>
    /* scoped: register patient */
    .rp-wrap { max-width: 1140px; margin: 0 auto; padding-bottom: 96px; }
    .rp-hero {
        display: flex; align-items: center; gap: 18px; flex-wrap: wrap;
        background: linear-gradient(135deg, var(--c-primary-50), #ffffff 60%);
        border: 1px solid var(--c-primary-100);
        border-radius: var(--radius);
        box-shadow: 0 14px 40px rgba(22, 160, 133, .10);
        padding: 22px 26px; margin-bottom: 22px;
        animation: rpIn .32s var(--ease) both;
    }
    .rp-hero .rp-ic {
        width: 58px; height: 58px; min-width: 58px; border-radius: 16px;
        display: grid; place-items: center; color: #fff; font-size: 24px;
        background: linear-gradient(135deg, var(--c-primary), var(--c-primary-700));
        box-shadow: var(--shadow-sm);
    }
    .rp-hero .rp-eyebrow {
        text-transform: uppercase; letter-spacing: .14em; font-size: 11px;
        font-weight: 800; color: var(--c-primary-700);
    }
    .rp-hero h3 { font-weight: 800; color: var(--c-ink); margin: 4px 0 0; letter-spacing: -.015em; }
    .rp-hero .rp-idtag {
        margin-top: 8px; display: inline-flex; align-items: center; gap: 7px;
        background: #fff; border: 1px solid var(--c-primary-100);
        border-radius: var(--radius-pill); padding: 4px 14px;
        font-weight: 800; color: var(--c-primary-700); font-size: 13px;
    }
    .rp-idtag .tnum { font-variant-numeric: tabular-nums; }

    .rp-nav { position: sticky; top: 18px; }
    .rp-nav .rp-nav-card { padding: 8px; }
    .rp-nav a {
        display: flex; align-items: center; gap: 12px;
        padding: 11px 13px; border-radius: var(--radius-sm);
        color: var(--c-ink-soft); font-weight: 700; font-size: 13.5px;
        transition: background var(--t-fast), color var(--t-fast);
    }
    .rp-nav a:hover { background: var(--c-primary-50); color: var(--c-primary-700); text-decoration: none; }
    .rp-nav a .rp-n-ic {
        width: 30px; height: 30px; min-width: 30px; border-radius: 9px;
        display: grid; place-items: center; font-size: 13px;
        background: var(--c-primary-50); color: var(--c-primary-700);
    }
    .rp-nav a .rp-n-step { margin-left: auto; font-size: 11px; color: var(--c-ink-muted); font-weight: 800; }

    .rp-card { scroll-margin-top: 18px; animation: rpIn .35s var(--ease) both; }
    .rp-card .card-title { display: flex; align-items: center; gap: 10px; }
    .rp-card .rp-h-ic {
        width: 34px; height: 34px; min-width: 34px; border-radius: 10px;
        display: grid; place-items: center; font-size: 14px;
        background: var(--c-primary-50); color: var(--c-primary-700);
    }
    .rp-card .rp-h-sub { font-weight: 600; color: var(--c-ink-muted); font-size: 12.5px; margin-top: 2px; }
    .rp-card:nth-of-type(1) { animation-delay: .04s; }
    .rp-card:nth-of-type(2) { animation-delay: .09s; }
    .rp-card:nth-of-type(3) { animation-delay: .14s; }
    .rp-card:nth-of-type(4) { animation-delay: .19s; }

    .rp-actionbar {
        position: sticky; bottom: 0; z-index: 5;
        display: flex; align-items: center; justify-content: flex-end; gap: 12px;
        background: rgba(255, 255, 255, .9);
        backdrop-filter: blur(8px);
        border: 1px solid var(--c-border);
        border-radius: var(--radius);
        box-shadow: 0 -8px 24px rgba(16, 44, 38, .08);
        padding: 14px 20px; margin-top: 20px;
    }
    .rp-actionbar .rp-bar-note { margin-right: auto; color: var(--c-ink-muted); font-size: 12.5px; font-weight: 600; }
    .rp-actionbar .rp-bar-note i { color: var(--c-primary); }

    @keyframes rpIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
</style>
@endpush

@section('content')
    <div class="rp-wrap fade-in">
        <div class="page-head">
            <div>
                <h4 class="page-title">Register new patient</h4>
                <div class="page-sub">Complete each section, then create the record to start the first visit.</div>
            </div>
            <a href="/search_patient" class="btn btn-light-soft"><i class="fa fa-arrow-left"></i> Back to search</a>
        </div>

        {{-- Hero: the student ID being registered --}}
        <div class="rp-hero">
            <div class="rp-ic"><i class="fa fa-user-plus"></i></div>
            <div>
                <div class="rp-eyebrow">New registration</div>
                <h3>Creating a patient record</h3>
                <span class="rp-idtag"><i class="fa fa-id-badge"></i> Student ID <span class="tnum">{{ $id }}</span></span>
            </div>
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

        <form action="/add_patient" method="get" enctype="multipart/form-data">
            @csrf
            <input type="hidden" name="stud_id" value="{{ $id }}">

            <div class="row">
                {{-- Section navigation --}}
                <div class="col-lg-3 d-none d-lg-block">
                    <div class="rp-nav">
                        <div class="card rp-nav-card">
                            <a href="#sec-personal"><span class="rp-n-ic"><i class="fa fa-user-o"></i></span> Personal <span class="rp-n-step">01</span></a>
                            <a href="#sec-campus"><span class="rp-n-ic"><i class="fa fa-graduation-cap"></i></span> Campus <span class="rp-n-step">02</span></a>
                            <a href="#sec-contact"><span class="rp-n-ic"><i class="fa fa-map-marker"></i></span> Contact <span class="rp-n-step">03</span></a>
                            <a href="#sec-assign"><span class="rp-n-ic"><i class="fa fa-user-md"></i></span> Doctor <span class="rp-n-step">04</span></a>
                        </div>
                    </div>
                </div>

                <div class="col-lg-9">
                    {{-- Personal details --}}
                    <div class="card rp-card" id="sec-personal">
                        <div class="card-header">
                            <h5 class="card-title mb-0"><span class="rp-h-ic"><i class="fa fa-user-o"></i></span> Personal details</h5>
                            <div class="rp-h-sub">Identity, demographics and clinical basics.</div>
                        </div>
                        <div class="card-body">
                            <div class="row">
                                <div class="col-sm-6">
                                    <div class="form-group">
                                        <label class="form-label">Full name <span class="text-danger">*</span></label>
                                        <input class="form-control @error('name') is-invalid @enderror" type="text"
                                            name="name" value="{{ old('name') }}" required
                                            onkeypress="return /[a-z ]/i.test(event.key)">
                                        @error('name') <div class="field-error">{{ $message }}</div> @enderror
                                    </div>
                                </div>
                                <div class="col-sm-6">
                                    <div class="form-group">
                                        <label class="form-label">Medical record number (MRN) <span class="text-danger">*</span></label>
                                        <input class="form-control @error('MRN') is-invalid @enderror" type="text"
                                            name="MRN" value="{{ old('MRN') }}" placeholder="e.g. MRN-1001" required>
                                        <div class="input-hint">Must be unique across all patients.</div>
                                        @error('MRN') <div class="field-error">{{ $message }}</div> @enderror
                                    </div>
                                </div>
                                <div class="col-sm-6">
                                    <div class="form-group">
                                        <label class="form-label">Date of birth <span class="text-danger">*</span></label>
                                        <div class="cal-icon">
                                            <input type="date" class="form-control @error('birthday') is-invalid @enderror"
                                                name="birthday" value="{{ old('birthday') }}" required>
                                        </div>
                                        @error('birthday') <div class="field-error">{{ $message }}</div> @enderror
                                    </div>
                                </div>
                                <div class="col-sm-6">
                                    <div class="form-group">
                                        <label class="form-label display-block">Gender <span class="text-danger">*</span></label>
                                        <div class="form-check form-check-inline">
                                            <input class="form-check-input" type="radio" name="gender"
                                                id="gender_male" value="Male" checked>
                                            <label class="form-check-label" for="gender_male">Male</label>
                                        </div>
                                        <div class="form-check form-check-inline">
                                            <input class="form-check-input" type="radio" name="gender"
                                                id="gender_female" value="Female">
                                            <label class="form-check-label" for="gender_female">Female</label>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-sm-6">
                                    <div class="form-group">
                                        <label class="form-label">Blood type <span class="text-danger">*</span></label>
                                        <input type="text" class="form-control" name="bloodtype"
                                            value="{{ old('bloodtype') }}" autocomplete="bloodtype" required>
                                        <div class="input-hint">e.g. O+, A−, AB+.</div>
                                    </div>
                                </div>
                                <div class="col-sm-6">
                                    <div class="form-group">
                                        <label class="form-label">Nationality</label>
                                        <select class="select form-select" name="nationality">
                                            <option value="Ethiopian">Ethiopian</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {{-- Academic / campus details --}}
                    <div class="card rp-card" id="sec-campus">
                        <div class="card-header">
                            <h5 class="card-title mb-0"><span class="rp-h-ic"><i class="fa fa-graduation-cap"></i></span> Campus details</h5>
                            <div class="rp-h-sub">Department, year and residence on campus.</div>
                        </div>
                        <div class="card-body">
                            <div class="row">
                                <div class="col-sm-6">
                                    <div class="form-group">
                                        <label class="form-label">Department <span class="text-danger">*</span></label>
                                        <input type="text" class="form-control" name="dept" value="{{ old('dept') }}"
                                            autocomplete="dept" onkeypress="return /[a-z ]/i.test(event.key)" required>
                                    </div>
                                </div>
                                <div class="col-sm-6">
                                    <div class="form-group">
                                        <label class="form-label">Year <span class="text-danger">*</span></label>
                                        <input type="number" class="form-control" name="year" value="{{ old('year') }}"
                                            min="1" max="7" required>
                                        <div class="input-hint">Year of study (1–7).</div>
                                    </div>
                                </div>
                                <div class="col-sm-6">
                                    <div class="form-group">
                                        <label class="form-label">Block name <span class="text-danger">*</span></label>
                                        <input class="form-control" type="text" name="block" value="{{ old('block') }}"
                                            onkeypress="return /[a-z0-9 ]/i.test(event.key)" required>
                                    </div>
                                </div>
                                <div class="col-sm-6">
                                    <div class="form-group">
                                        <label class="form-label">Dorm number <span class="text-danger">*</span></label>
                                        <input class="form-control" type="text" name="dorm" value="{{ old('dorm') }}" required>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {{-- Contact / address --}}
                    <div class="card rp-card" id="sec-contact">
                        <div class="card-header">
                            <h5 class="card-title mb-0"><span class="rp-h-ic"><i class="fa fa-map-marker"></i></span> Contact &amp; address</h5>
                            <div class="rp-h-sub">Where to reach the patient.</div>
                        </div>
                        <div class="card-body">
                            <div class="row">
                                <div class="col-sm-6">
                                    <div class="form-group">
                                        <label class="form-label">Address <span class="text-danger">*</span></label>
                                        <input type="text" class="form-control" name="address" value="{{ old('address') }}"
                                            autocomplete="address" required>
                                    </div>
                                </div>
                                <div class="col-sm-6">
                                    <div class="form-group">
                                        <label class="form-label">Region <span class="text-danger">*</span></label>
                                        <select class="select form-select" name="region">
                                            <option value="Dire Dawa (city) ">Dire Dawa (city)</option>
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
                                <div class="col-sm-6">
                                    <div class="form-group">
                                        <label class="form-label">Phone</label>
                                        <input class="form-control" type="tel" name="phone" value="{{ old('phone') }}"
                                            autocomplete="tel">
                                        <div class="input-hint">Optional — used for follow-up reminders.</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {{-- Assignment --}}
                    <div class="card rp-card" id="sec-assign">
                        <div class="card-header">
                            <h5 class="card-title mb-0"><span class="rp-h-ic"><i class="fa fa-user-md"></i></span> Assign doctor</h5>
                            <div class="rp-h-sub">The first visit will be queued for this doctor.</div>
                        </div>
                        <div class="card-body">
                            <div class="row">
                                <div class="col-sm-6">
                                    <div class="form-group">
                                        <label class="form-label">Assign to doctor</label>
                                        <select class="select form-select" name="doc_id">
                                            @foreach ($doctors as $doctor)
                                                <option value="{{ $doctor->id }}">{{ $doctor->name }}</option>
                                            @endforeach
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {{-- Sticky action bar --}}
                    <div class="rp-actionbar">
                        <span class="rp-bar-note"><i class="fa fa-info-circle"></i> Fields marked <span class="text-danger">*</span> are required.</span>
                        <a href="/search_patient" class="btn btn-light-soft">Cancel</a>
                        <button type="submit" class="btn btn-primary"><i class="fa fa-check"></i> Create patient</button>
                    </div>
                </div>
            </div>
        </form>
    </div>
@endsection
