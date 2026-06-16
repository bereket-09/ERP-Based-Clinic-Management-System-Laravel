<div>
    <div class="page-head">
        <div>
            <h4 class="page-title">Lab Test Types</h4>
            <div class="page-sub">{{ $tests->total() }} test type{{ $tests->total() == 1 ? '' : 's' }} configured</div>
        </div>
        <a href="{{ url('add_lab_test') }}" class="btn btn-primary btn-rounded">
            <i class="fa fa-plus"></i> Add Lab Test
        </a>
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
                            Test Name <span class="sort-ind"><i class="fa fa-sort"></i></span>
                        </th>
                        <th style="min-width:220px;">Description</th>
                        <th class="sortable {{ $sortField === 'status' ? 'active' : '' }}" wire:click="sortBy('status')">
                            Status <span class="sort-ind"><i class="fa fa-sort"></i></span>
                        </th>
                        <th class="text-right">Action</th>
                    </tr>
                </thead>
                <tbody>
                    @forelse ($tests as $test)
                        <tr wire:key="test-{{ $test->id }}" class="lw-row" style="--i: {{ $loop->index }}">
                            <td class="num">{{ $test->id }}</td>
                            <td>{{ $test->name }}</td>
                            <td>{{ $test->desc }}</td>
                            <td>
                                <span class="status-pill {{ $test->status === 'Active' ? 'is-completed' : 'is-danger' }}">
                                    {{ $test->status }}
                                </span>
                            </td>
                            <td class="text-right">
                                <div class="dropdown dropdown-action">
                                    <a href="#" class="action-icon dropdown-toggle" data-toggle="dropdown"
                                        aria-expanded="false"><i class="fa fa-ellipsis-v"></i></a>
                                    <div class="dropdown-menu dropdown-menu-right">
                                        <a class="dropdown-item" href="{{ url('/edit_tests', $test->id) }}">
                                            <i class="fa fa-pencil m-r-5"></i> Edit
                                        </a>
                                        <a class="dropdown-item text-danger" href="#"
                                            onclick="event.preventDefault(); clinicConfirm({title:'Delete {{ addslashes($test->name) }}?', text:'This lab test type will be permanently removed.', component:@this, method:'delete', params:[{{ $test->id }}]})">
                                            <i class="fa fa-trash-o m-r-5"></i> Delete
                                        </a>
                                    </div>
                                </div>
                            </td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="5">
                                <div class="empty-state">
                                    <div class="empty-icon"><i class="fa fa-flask"></i></div>
                                    <h5>No lab test types found</h5>
                                    <p>{{ $search !== '' ? 'Try a different search term.' : 'Add your first lab test to get started.' }}</p>
                                </div>
                            </td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>
    </div>

    <div class="mt-3">
        {{ $tests->links() }}
    </div>

    @push('styles')
        <style>
            .lw-row { animation: fadeIn .3s var(--ease) backwards; animation-delay: calc(var(--i, 0) * .035s); }
            .table td.num { font-variant-numeric: tabular-nums; }
        </style>
    @endpush
</div>
