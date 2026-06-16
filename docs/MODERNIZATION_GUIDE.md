# DDU Clinic — Modernization Guide (READ FIRST)

You are one of several agents modernizing this Laravel 9 clinic ERP **in parallel**.
A shared foundation already exists. **Follow these patterns exactly** so all modules stay consistent.

## Goal
1. Modern, polished UI on top of the existing Bootstrap theme — anchored on brand green `#16a085`.
2. Convert lists & forms to **Livewire 2** so actions happen **without a full page refresh**.
3. Remove leftover dummy/placeholder data and dead `.html` links.

## The brand & design system
- Brand green is `#16a085`. The refined palette + all component classes live in
  `public/assets/css/enhance.css` (CSS variables like `--c-primary`, helpers like
  `.page-head`, `.dash-widget`, `.stat-icon.is-info`, `.status-pill.is-queued`, `.empty-state`,
  `.list-toolbar`, `.lw-spinner`, `.profile-widget`, `.table-card`).
- **Reuse these classes.** Only add a scoped `<style>` block inside YOUR OWN view if you truly
  need something new. **Never edit `enhance.css`, `style.css`, or `layouts/portal.blade.php`** —
  those are owned by the foundation. If you need a new shared class, add it scoped in your view.

## The layout — every page must use it
Replace each standalone view's `<!DOCTYPE>`…`</html>` boilerplate (and its inline `@include('head')`,
`@include('navbar')`, role sidebar, and `<script>` tags) with:

```blade
@extends('layouts.portal')
@section('title', 'Page Name')
@section('content')
    {{-- page body / @livewire(...) here --}}
@endsection
```

`layouts/portal.blade.php` already provides: `<head>` + all CSS/JS, navbar, the correct
role-based sidebar (auto-selected by `Auth::user()->role`), SweetAlert2, `@livewireStyles/Scripts`,
toast + confirm + redirect bridges. **Do not re-include head/navbar/sidebar/scripts yourself.**

> Auth guard: the old views use a raw `@php header('Location'...) @endphp` hack. Delete that block —
> routes/middleware handle auth. Do not reintroduce it.

## Toast / confirm / redirect (already global)
- Success/error toast from a Livewire component:
  `$this->dispatchBrowserEvent('notify', ['type' => 'success', 'message' => '…']);`
  (`type` = success | error | warning | info)
- Server controller flash also auto-toasts: `return redirect(...)->with('success','…');`
- Confirm-before-delete from a Blade button:
  ```html
  onclick="event.preventDefault(); clinicConfirm({title:'Delete X?', text:'…', component:@this, method:'delete', params:[{{ $id }}]})"
  ```
- Show a toast then navigate after save:
  `$this->dispatchBrowserEvent('redirect-after', ['url' => '/somewhere']);`

## Canonical reference components (COPY THESE)
- **List** (search + sortable columns + pagination + delete, all no-refresh):
  - `app/Http/Livewire/Staff/StaffList.php` + `resources/views/livewire/staff/staff-list.blade.php`
  - Wired into `resources/views/common/doctotsList.blade.php` — a working example end to end.
- **Form** (real-time validation + save no-refresh + toast):
  - `app/Http/Livewire/Departments/DepartmentForm.php` + `resources/views/livewire/departments/department-form.blade.php`

### List component rules
- `use Livewire\WithPagination;` + `protected $paginationTheme = 'bootstrap';`
- Live search: `wire:model.debounce.350ms="search"`, reset paginator in `updatingSearch()`.
- Sortable headers via `sortBy($field)`; add `th.sortable` / `.active` classes.
- Always render an `.empty-state` for the no-results case.
- Add `wire:key="row-{{ $row->id }}"` to looped rows.
- Loading affordance: `wire:loading.class="lw-overlay"` on the table/grid, plus a `.lw-spinner`.

### Form component rules
- `protected function rules()`, validate in `updated($field) => $this->validateOnly($field)`.
- `wire:submit.prevent="save"`, disable the button via `wire:loading.attr="disabled" wire:target="save"`.
- Show field errors with `@error('field') <div class="field-error">{{ $message }}</div> @enderror`
  and add `is-invalid` to the input.

## Integrating without touching routes
Keep existing routes/controllers. Convert the **view** the controller returns into a thin wrapper
that `@extends('layouts.portal')` and embeds your Livewire component with `@livewire('namespace.name', [...])`.
Components can self-fetch data, so controller-passed variables are optional. **Do not edit
`routes/web.php`** unless your brief explicitly says so (avoids parallel conflicts).

## Database schema (real column names — note the original typos, keep them)
- **users**: `name, email, role, password, joinned_at, phone, gender, speciality, desc, address,
  nationality, region, birthday, profile_photo_path`. Roles: `0`=Reception, `1`=Doctor,
  `2`=Labratorist, `3`=Pharmacist, `4`=Manager/Admin.
- **patients**: `stud_id, mrn, name, gender, birthday, dept, block, dorm, year, address, region,
  phone, nationality, bloodtype`.
- **visits**: `p_id, doc_id, symptoms, diagnosis, deasease, lab_order_id, lab_result_id,
  order_drug_id, statues` (values: `Queued`, `Pending`, `Completed`).
- Models exist for: User, Patient, Visit, Departement, Labtest, LabOrder, LabResult, Medcine,
  Medcine_Name, DrugOrder, DrugOrdered, Items, Items_total, ItemAssign, ItemRequest, WorkLeave,
  Edu_info, Work_exp. (Keep the misspellings — they match DB columns.)

## Avatar / images
User photos: `<img src="/storage/{{ $u->profile_photo_path }}" onerror="this.onerror=null;this.src='/images/avatar.png'">`

## Quality bar
- Run `php -l` on every PHP file you create/edit (must report no syntax errors).
- Don't break existing routes or controller method signatures.
- Match the surrounding Blade style; keep it readable.
- Replace dummy/lorem-ipsum content with real data or remove the section.
- Icons: FontAwesome 4 (`fa fa-…`) is what's loaded — use it.
- **File ownership is disjoint per agent — only edit the files in YOUR brief.**
