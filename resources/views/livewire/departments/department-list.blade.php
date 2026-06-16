<div>
    <div class="page-head">
        <div>
            <h4 class="page-title">Departments</h4>
            <div class="page-sub">{{ $departments->total() }} department{{ $departments->total() == 1 ? '' : 's' }} registered</div>
        </div>
        @if (Auth::user()->role == '4')
            <a href="{{ url('/add-departement') }}" class="btn btn-primary btn-rounded">
                <i class="fa fa-plus"></i> Add Department
            </a>
        @endif
    </div>

    {{-- Toolbar: live search --}}
    <div class="list-toolbar">
        <div class="search-box">
            <i class="fa fa-search"></i>
            <input type="text" class="form-control" placeholder="Search by name, description, status…"
                wire:model.debounce.350ms="search">
        </div>
        <span wire:loading.delay class="text-muted-2"><span class="lw-spinner spinner-ink"></span> Searching…</span>
    </div>

    <div class="card table-card">
        <div class="table-responsive" wire:loading.class="lw-overlay">
            <table class="table table-striped custom-table mb-0">
                <thead>
                    <tr>
                        <th class="sortable {{ $sortField === 'id' ? 'active' : '' }}" wire:click="sortBy('id')">
                            # <span class="sort-ind"><i class="fa fa-sort"></i></span>
                        </th>
                        <th class="sortable {{ $sortField === 'name' ? 'active' : '' }}" wire:click="sortBy('name')">
                            Name <span class="sort-ind"><i class="fa fa-sort"></i></span>
                        </th>
                        <th style="min-width:200px;">Description</th>
                        <th class="sortable {{ $sortField === 'status' ? 'active' : '' }}" wire:click="sortBy('status')">
                            Status <span class="sort-ind"><i class="fa fa-sort"></i></span>
                        </th>
                        @if (Auth::user()->role == '4')
                            <th class="text-right">Actions</th>
                        @endif
                    </tr>
                </thead>
                <tbody>
                    @forelse ($departments as $dept)
                        <tr wire:key="dept-{{ $dept->id }}">
                            <td>{{ $dept->id }}</td>
                            <td>{{ $dept->name }}</td>
                            <td>{{ $dept->desc }}</td>
                            <td>
                                @if ($dept->status == 'Active')
                                    <span class="status-pill is-completed">{{ $dept->status }}</span>
                                @else
                                    <span class="status-pill is-danger">{{ $dept->status }}</span>
                                @endif
                            </td>
                            @if (Auth::user()->role == '4')
                                <td class="text-right">
                                    <div class="dropdown dropdown-action">
                                        <a href="#" class="action-icon dropdown-toggle" data-toggle="dropdown"
                                            aria-expanded="false"><i class="fa fa-ellipsis-v"></i></a>
                                        <div class="dropdown-menu dropdown-menu-right">
                                            <a class="dropdown-item" href="{{ url('/edit-departement', $dept->id) }}">
                                                <i class="fa fa-pencil m-r-5"></i> Edit
                                            </a>
                                            <a class="dropdown-item text-danger" href="#"
                                                onclick="event.preventDefault(); clinicConfirm({title:'Delete {{ addslashes($dept->name) }}?', text:'This department will be permanently removed.', component:@this, method:'delete', params:[{{ $dept->id }}]})">
                                                <i class="fa fa-trash-o m-r-5"></i> Delete
                                            </a>
                                        </div>
                                    </div>
                                </td>
                            @endif
                        </tr>
                    @empty
                        <tr>
                            <td colspan="{{ Auth::user()->role == '4' ? 5 : 4 }}">
                                <div class="empty-state">
                                    <div class="empty-icon"><i class="fa fa-hospital-o"></i></div>
                                    <h5>No departments found</h5>
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
        {{ $departments->links() }}
    </div>
</div>
