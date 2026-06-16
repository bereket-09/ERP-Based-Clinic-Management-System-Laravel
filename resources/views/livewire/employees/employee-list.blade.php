<div>
    <div class="page-head">
        <div>
            <h4 class="page-title">All Employees</h4>
            <div class="page-sub">{{ $employees->total() }} staff member{{ $employees->total() == 1 ? '' : 's' }} registered</div>
        </div>
        <a href="{{ url('add-employee') }}" class="btn btn-primary btn-rounded">
            <i class="fa fa-plus"></i> Add Employee
        </a>
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

    <div class="card table-card">
        <div class="table-responsive" wire:loading.class="lw-overlay">
            <table class="table table-striped custom-table mb-0">
                <thead>
                    <tr>
                        <th class="sortable {{ $sortField === 'name' ? 'active' : '' }}" wire:click="sortBy('name')">
                            Name <span class="sort-ind"><i class="fa fa-sort"></i></span>
                        </th>
                        <th class="sortable {{ $sortField === 'role' ? 'active' : '' }}" wire:click="sortBy('role')">
                            Role <span class="sort-ind"><i class="fa fa-sort"></i></span>
                        </th>
                        <th class="sortable {{ $sortField === 'email' ? 'active' : '' }}" wire:click="sortBy('email')">
                            Email <span class="sort-ind"><i class="fa fa-sort"></i></span>
                        </th>
                        <th>Phone</th>
                        <th class="sortable {{ $sortField === 'joinned_at' ? 'active' : '' }}" wire:click="sortBy('joinned_at')">
                            Joined <span class="sort-ind"><i class="fa fa-sort"></i></span>
                        </th>
                        <th class="text-right">Action</th>
                    </tr>
                </thead>
                <tbody>
                    @forelse ($employees as $emp)
                        <tr wire:key="emp-{{ $emp->id }}">
                            <td>
                                <img width="36" height="36" class="rounded-circle m-r-5"
                                    src="/storage/{{ $emp->profile_photo_path }}"
                                    onerror="this.onerror=null;this.src='/images/avatar.png'" alt="{{ $emp->name }}">
                                {{ $emp->name }}
                            </td>
                            <td>
                                <span class="status-pill is-completed">{{ $roleLabels[$emp->role] ?? 'Unknown' }}</span>
                            </td>
                            <td>{{ $emp->email }}</td>
                            <td>{{ $emp->phone }}</td>
                            <td>{{ $emp->joinned_at }}</td>
                            <td class="text-right">
                                <div class="dropdown dropdown-action">
                                    <a href="#" class="action-icon dropdown-toggle" data-toggle="dropdown"
                                        aria-expanded="false"><i class="fa fa-ellipsis-v"></i></a>
                                    <div class="dropdown-menu dropdown-menu-right">
                                        <a class="dropdown-item" href="{{ url('/updateEmployee', $emp->id) }}">
                                            <i class="fa fa-pencil m-r-5"></i> Edit
                                        </a>
                                        <a class="dropdown-item text-danger" href="#"
                                            onclick="event.preventDefault(); clinicConfirm({title:'Delete {{ addslashes($emp->name) }}?', text:'This employee will be permanently removed.', component:@this, method:'delete', params:[{{ $emp->id }}]})">
                                            <i class="fa fa-trash-o m-r-5"></i> Delete
                                        </a>
                                    </div>
                                </div>
                            </td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="6">
                                <div class="empty-state">
                                    <div class="empty-icon"><i class="fa fa-users"></i></div>
                                    <h5>No employees found</h5>
                                    <p>Try a different search term.</p>
                                </div>
                            </td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>
    </div>

    <div class="mt-3">
        {{ $employees->links() }}
    </div>
</div>
