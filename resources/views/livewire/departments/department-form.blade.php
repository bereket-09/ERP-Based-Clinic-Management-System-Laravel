<div class="row">
    <div class="col-lg-8 offset-lg-2">
        <div class="page-head">
            <h4 class="page-title">{{ $departmentId ? 'Edit' : 'Add' }} Department</h4>
        </div>

        <div class="card">
            <div class="card-body">
                <form wire:submit.prevent="save">
                    <div class="form-group">
                        <label class="form-label">Department name</label>
                        <input type="text" class="form-control @error('name') is-invalid @enderror"
                            wire:model.lazy="name" placeholder="e.g. Outpatient Department">
                        @error('name') <div class="field-error">{{ $message }}</div> @enderror
                    </div>

                    <div class="form-group">
                        <label class="form-label">Description</label>
                        <textarea class="form-control @error('desc') is-invalid @enderror" rows="3"
                            wire:model.lazy="desc" placeholder="What does this department handle?"></textarea>
                        @error('desc') <div class="field-error">{{ $message }}</div> @enderror
                    </div>

                    <div class="form-group">
                        <label class="form-label">Status</label>
                        <select class="form-select" wire:model="status">
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                        </select>
                        @error('status') <div class="field-error">{{ $message }}</div> @enderror
                    </div>

                    <div class="d-flex gap-2 mt-4">
                        <button type="submit" class="btn btn-primary" wire:loading.attr="disabled" wire:target="save">
                            <span wire:loading wire:target="save" class="lw-spinner"></span>
                            <span wire:loading.remove wire:target="save"><i class="fa fa-check"></i></span>
                            {{ $departmentId ? 'Save changes' : 'Create department' }}
                        </button>
                        <a href="/view-departement" class="btn btn-light-soft">Cancel</a>
                    </div>
                </form>
            </div>
        </div>
    </div>
</div>
