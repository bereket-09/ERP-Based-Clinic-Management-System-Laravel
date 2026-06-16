<div>
    <div class="page-head">
        <div>
            <h4 class="page-title">{{ $title }}</h4>
            <div class="page-sub">{{ $staff->total() }} {{ Str::lower($title) }} registered</div>
        </div>
        @if (Auth::user()->role == '4')
            <a href="{{ url('add-employee') }}" class="btn btn-primary btn-rounded">
                <i class="fa fa-plus"></i> Add {{ Str::singular($title) }}
            </a>
        @endif
    </div>

    {{-- Toolbar: live search --}}
    <div class="list-toolbar">
        <div class="search-box">
            <i class="fa fa-search"></i>
            <input type="text" class="form-control" placeholder="Search by name, email, phone…"
                wire:model.debounce.350ms="search">
        </div>
        <span wire:loading.delay class="text-muted-2"><span class="lw-spinner spinner-ink"></span> Searching…</span>
    </div>

    {{-- Grid of staff cards --}}
    <div class="row doctor-grid" wire:loading.class="lw-overlay">
        @forelse ($staff as $member)
            <div class="col-md-4 col-sm-6 col-lg-3" wire:key="staff-{{ $member->id }}">
                <div class="profile-widget">
                    @if (Auth::user()->role == '4')
                        <div class="dropdown profile-action">
                            <a href="#" class="action-icon dropdown-toggle" data-toggle="dropdown"><i class="fa fa-ellipsis-v"></i></a>
                            <div class="dropdown-menu dropdown-menu-right">
                                <a class="dropdown-item" href="{{ url('/updateEmployee', $member->id) }}"><i class="fa fa-pencil m-r-5"></i> Edit</a>
                                <a class="dropdown-item text-danger" href="#"
                                    onclick="event.preventDefault(); clinicConfirm({title:'Delete {{ addslashes($member->name) }}?', text:'This staff member will be permanently removed.', component:@this, method:'delete', params:[{{ $member->id }}]})">
                                    <i class="fa fa-trash-o m-r-5"></i> Delete
                                </a>
                            </div>
                        </div>
                    @endif

                    <div class="doctor-img">
                        <a href="{{ url('/profile', $member->id) }}">
                            <img class="rounded-circle" src="/storage/{{ $member->profile_photo_path }}"
                                onerror="this.onerror=null;this.src='/images/avatar.png'" alt="{{ $member->name }}">
                        </a>
                    </div>
                    <h4 class="doctor-name text-ellipsis"><a href="{{ url('/profile', $member->id) }}">{{ $member->name }}</a></h4>
                    <div class="doc-prof">{{ $member->speciality ?: 'General' }}</div>
                    <div class="user-country"><i class="fa fa-map-marker"></i> {{ $member->address }}{{ $member->region ? ', '.$member->region : '' }}</div>
                </div>
            </div>
        @empty
            <div class="col-12">
                <div class="empty-state">
                    <div class="empty-icon"><i class="fa fa-user-md"></i></div>
                    <h5>No {{ Str::lower($title) }} found</h5>
                    <p>Try a different search term.</p>
                </div>
            </div>
        @endforelse
    </div>

    <div class="mt-3">
        {{ $staff->links() }}
    </div>
</div>
