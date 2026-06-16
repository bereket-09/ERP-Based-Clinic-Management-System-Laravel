@push('styles')
<style>
    /* scoped: patient search */
    .ps-shell { max-width: 860px; margin: 0 auto; }
    .ps-hero {
        background: linear-gradient(135deg, var(--c-primary-50), #ffffff 65%);
        border: 1px solid var(--c-primary-100);
        border-radius: var(--radius);
        box-shadow: 0 14px 40px rgba(22, 160, 133, .10);
        padding: 30px 30px 26px;
    }
    .ps-hero .ps-eyebrow {
        text-transform: uppercase; letter-spacing: .14em; font-size: 11px;
        font-weight: 800; color: var(--c-primary-700);
    }
    .ps-hero h3 { font-weight: 800; color: var(--c-ink); margin: 6px 0 4px; letter-spacing: -.015em; }
    .ps-hero p { color: var(--c-ink-soft); margin: 0; font-size: 14px; }

    .ps-search { position: relative; margin-top: 22px; }
    .ps-search > i.ps-glass {
        position: absolute; left: 20px; top: 50%; transform: translateY(-50%);
        color: var(--c-primary); font-size: 19px; pointer-events: none;
    }
    .ps-search input.ps-field {
        width: 100%;
        height: 62px;
        border: 1.5px solid var(--c-border) !important;
        border-radius: var(--radius) !important;
        background: #fff;
        padding: 0 52px 0 52px;
        font-size: 16.5px; font-weight: 600; color: var(--c-ink);
        box-shadow: var(--shadow-xs);
        transition: border-color var(--t-fast), box-shadow var(--t-fast);
    }
    .ps-search input.ps-field::placeholder { color: var(--c-ink-muted); font-weight: 500; }
    .ps-search input.ps-field:focus {
        outline: 0;
        border-color: var(--c-primary) !important;
        box-shadow: 0 0 0 5px var(--c-primary-100);
    }
    .ps-search .ps-spin { position: absolute; right: 20px; top: 50%; transform: translateY(-50%); }
    .ps-hint { color: var(--c-ink-muted); font-size: 12.5px; margin-top: 12px; display: flex; gap: 16px; flex-wrap: wrap; }
    .ps-hint kbd {
        background: #fff; border: 1px solid var(--c-border); border-radius: 6px;
        padding: 1px 7px; font-size: 11px; font-weight: 700; color: var(--c-ink-soft);
    }

    .ps-results { margin-top: 18px; }
    .ps-count { font-size: 12.5px; font-weight: 700; color: var(--c-ink-muted); text-transform: uppercase; letter-spacing: .05em; margin: 0 4px 10px; }

    .ps-row {
        display: flex; align-items: center; gap: 16px;
        background: var(--c-surface);
        border: 1px solid var(--c-border);
        border-radius: var(--radius);
        box-shadow: var(--shadow-xs);
        padding: 14px 18px;
        margin-bottom: 10px;
        transition: transform var(--t-fast), box-shadow var(--t-fast), border-color var(--t-fast);
        animation: psIn .32s var(--ease) both;
    }
    .ps-row:hover {
        transform: translateY(-2px);
        box-shadow: 0 12px 28px rgba(22, 160, 133, .12);
        border-color: var(--c-primary-100);
    }
    .ps-row .avatar-initials { width: 48px; height: 48px; min-width: 48px; font-size: 16px; }
    .ps-row .ps-meta { flex: 1; min-width: 0; }
    .ps-row .ps-name { font-weight: 800; color: var(--c-ink); font-size: 15px; line-height: 1.2; }
    .ps-row .ps-chips { display: flex; gap: 7px; flex-wrap: wrap; margin-top: 6px; }
    .ps-chip {
        display: inline-flex; align-items: center; gap: 5px;
        background: var(--c-bg); border: 1px solid var(--c-border);
        border-radius: var(--radius-pill); padding: 3px 10px;
        font-size: 11.5px; font-weight: 700; color: var(--c-ink-soft);
    }
    .ps-chip i { color: var(--c-primary); font-size: 11px; }
    .ps-chip .tnum { font-variant-numeric: tabular-nums; letter-spacing: .01em; }
    .ps-row .ps-go { white-space: nowrap; }

    .ps-newcta {
        display: flex; align-items: center; gap: 16px; flex-wrap: wrap;
        justify-content: space-between;
        background: linear-gradient(135deg, var(--c-primary-50), #fff);
        border: 1px dashed var(--c-primary-300);
        border-radius: var(--radius);
        padding: 18px 22px; margin-top: 6px;
    }
    .ps-newcta .ps-newtxt h6 { font-weight: 800; color: var(--c-ink); margin: 0 0 2px; }
    .ps-newcta .ps-newtxt p { margin: 0; color: var(--c-ink-soft); font-size: 13px; }
    .ps-newcta .ps-newtxt .tnum { font-variant-numeric: tabular-nums; }

    /* stagger */
    .ps-row:nth-child(1) { animation-delay: .02s; }
    .ps-row:nth-child(2) { animation-delay: .06s; }
    .ps-row:nth-child(3) { animation-delay: .10s; }
    .ps-row:nth-child(4) { animation-delay: .14s; }
    .ps-row:nth-child(5) { animation-delay: .18s; }
    @keyframes psIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
</style>
@endpush

@php($term = trim($search))

<div class="ps-shell fade-in">
    <div class="page-head">
        <div>
            <h4 class="page-title">Find a patient</h4>
            <div class="page-sub">Search by student ID, MRN or name to add a visit or register someone new.</div>
        </div>
    </div>

    <div class="ps-hero">
        <div class="ps-eyebrow">Reception &middot; patient lookup</div>
        <h3>Who are we seeing today?</h3>
        <p>Start typing and matching records appear instantly — no need to press enter.</p>

        <div class="ps-search">
            <i class="fa fa-search ps-glass"></i>
            <input type="text" class="ps-field" autofocus
                placeholder="Student ID, MRN or full name…"
                wire:model.debounce.350ms="search"
                aria-label="Search patients">
            <span class="ps-spin" wire:loading.delay wire:target="search">
                <span class="lw-spinner spinner-ink"></span>
            </span>
        </div>

        <div class="ps-hint">
            <span><kbd>ID</kbd> e.g. student number</span>
            <span><kbd>MRN</kbd> medical record number</span>
            <span><kbd>Name</kbd> full or partial</span>
        </div>
    </div>

    @if ($term === '')
        <div class="empty-state">
            <div class="empty-icon"><i class="fa fa-id-card-o"></i></div>
            <h5>Look up a patient to begin</h5>
            <p>Type a student ID, MRN or name in the field above.</p>
        </div>
    @else
        <div class="ps-results" wire:loading.class="lw-overlay" wire:target="search">
            @if (count($matches))
                <p class="ps-count">{{ count($matches) }} {{ Str::plural('match', count($matches)) }} for &ldquo;{{ $term }}&rdquo;</p>

                @foreach ($matches as $patient)
                    @php($initials = collect(explode(' ', trim($patient->name)))->filter()->take(2)->map(fn ($w) => Str::upper(Str::substr($w, 0, 1)))->implode(''))
                    <div class="ps-row" wire:key="match-{{ $patient->id }}">
                        <span class="avatar-initials">{{ $initials !== '' ? $initials : '?' }}</span>
                        <div class="ps-meta">
                            <div class="ps-name">{{ $patient->name }}</div>
                            <div class="ps-chips">
                                <span class="ps-chip"><i class="fa fa-id-badge"></i> <span class="tnum">{{ $patient->stud_id }}</span></span>
                                <span class="ps-chip"><i class="fa fa-hashtag"></i> MRN <span class="tnum">{{ $patient->mrn }}</span></span>
                                @if (!empty($patient->gender))
                                    <span class="ps-chip"><i class="fa fa-venus-mars"></i> {{ $patient->gender }}</span>
                                @endif
                                @if (!empty($patient->dept))
                                    <span class="ps-chip"><i class="fa fa-graduation-cap"></i> {{ $patient->dept }}</span>
                                @endif
                            </div>
                        </div>
                        <a href="{{ url('/searchPatient') }}?stud_id={{ urlencode($patient->stud_id) }}" class="btn btn-primary ps-go">
                            <i class="fa fa-plus"></i> Add visit
                        </a>
                    </div>
                @endforeach
            @else
                <div class="ps-newcta">
                    <div class="ps-newtxt">
                        <h6>No patient matches &ldquo;{{ $term }}&rdquo;</h6>
                        <p>Register a new record for student ID <span class="tnum">{{ $term }}</span>.</p>
                    </div>
                    <a href="{{ url('/searchPatient') }}?stud_id={{ urlencode($term) }}" class="btn btn-primary">
                        <i class="fa fa-user-plus"></i> Register new patient
                    </a>
                </div>
            @endif
        </div>
    @endif
</div>
