<!DOCTYPE html>
<html lang="en">

<head>
    <base href="/public">
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <link rel="shortcut icon" type="image/x-icon" href="assets/img/favicon.ico">
    <title>@yield('title', 'Dire Dawa University Clinic Center')</title>

    {{-- Fonts --}}
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap" rel="stylesheet">
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">

    {{-- Theme assets (existing) --}}
    <link rel="stylesheet" type="text/css" href="assets/css/bootstrap.min.css">
    <link rel="stylesheet" type="text/css" href="assets/css/font-awesome.min.css">
    <link rel="stylesheet" type="text/css" href="assets/css/select2.min.css">
    <link rel="stylesheet" type="text/css" href="assets/css/bootstrap-datetimepicker.min.css">
    <link rel="stylesheet" type="text/css" href="assets/css/style.css">

    {{-- Modern refinement layer (must load AFTER style.css) --}}
    <link rel="stylesheet" type="text/css" href="assets/css/enhance.css">

    {{-- SweetAlert2 for toasts / confirm dialogs --}}
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/sweetalert2@11/dist/sweetalert2.min.css">

    @livewireStyles
    @stack('styles')
</head>

<body>
    <div class="main-wrapper">
        @include('navbar')

        @auth
            @php($__role = Auth::user()->role)
            @if ($__role == '4')
                @include('admin.sidebar')
            @elseif ($__role == '0')
                @include('reception.sidebar')
            @elseif ($__role == '1')
                @include('doctor.sidebar')
            @elseif ($__role == '2')
                @include('lab.sidebar')
            @elseif ($__role == '3')
                @include('pharmacy.sidebar')
            @endif
        @endauth

        <div class="page-wrapper">
            <div class="content fade-in">
                @auth
                    @include('partials.leave-notice')
                @endauth
                @yield('content')
            </div>
        </div>
    </div>

    <div class="sidebar-overlay" data-reff=""></div>

    {{-- Core theme JS --}}
    <script src="assets/js/jquery-3.2.1.min.js"></script>
    <script src="assets/js/popper.min.js"></script>
    <script src="assets/js/bootstrap.min.js"></script>
    <script src="assets/js/jquery.slimscroll.js"></script>
    <script src="assets/js/select2.min.js"></script>
    <script src="assets/js/moment.min.js"></script>
    <script src="assets/js/bootstrap-datetimepicker.min.js"></script>
    <script src="assets/js/Chart.bundle.js"></script>
    <script src="assets/js/app.js"></script>

    {{-- SweetAlert2 --}}
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11/dist/sweetalert2.all.min.js"></script>

    @livewireScripts

    {{-- ===== Global UX bridge: toasts, confirm dialogs, Livewire <-> theme glue ===== --}}
    <script>
        window.Toast = Swal.mixin({
            toast: true, position: 'top-end', showConfirmButton: false,
            timer: 3200, timerProgressBar: true,
            didOpen: t => { t.addEventListener('mouseenter', Swal.stopTimer); t.addEventListener('mouseleave', Swal.resumeTimer); }
        });

        function clinicNotify(detail) {
            detail = detail || {};
            window.Toast.fire({ icon: detail.type || 'success', title: detail.message || 'Done' });
        }

        // Livewire dispatches: $this->dispatchBrowserEvent('notify', ['type'=>'success','message'=>'...'])
        window.addEventListener('notify', e => clinicNotify(e.detail));

        // Livewire dispatches: $this->dispatchBrowserEvent('redirect-after', ['url'=>'/...'])
        // Lets a toast show briefly before navigating after a save.
        window.addEventListener('redirect-after', e => setTimeout(() => window.location = e.detail.url, 700));

        // Confirm-then-emit pattern. Use in Blade:
        // <button onclick="clinicConfirm({title:'Delete?', method:'deleteRow', params:[id], component:'@@this'})">
        function clinicConfirm(opts) {
            opts = opts || {};
            Swal.fire({
                title: opts.title || 'Are you sure?',
                text: opts.text || 'This action cannot be undone.',
                icon: opts.icon || 'warning',
                showCancelButton: true,
                confirmButtonColor: '#ef4f5a',
                cancelButtonColor: '#93a2b1',
                confirmButtonText: opts.confirmText || 'Yes, continue',
                reverseButtons: true
            }).then(res => {
                if (res.isConfirmed && opts.component && opts.method) {
                    opts.component.call(opts.method, ...(opts.params || []));
                }
            });
        }

        document.addEventListener('livewire:load', function () {
            // Re-init select2 + datepickers after Livewire DOM updates
            if (window.Livewire) {
                Livewire.hook('message.processed', (message, component) => {
                    if (window.jQuery) {
                        jQuery('.select2:not(.select2-hidden-accessible)').select2({ width: '100%' });
                    }
                });
            }
        });
    </script>

    {{-- Server-side flash messages -> toast --}}
    @if (session('success'))
        <script>document.addEventListener('DOMContentLoaded', () => clinicNotify({ type: 'success', message: @json(session('success')) }));</script>
    @endif
    @if (session('error'))
        <script>document.addEventListener('DOMContentLoaded', () => clinicNotify({ type: 'error', message: @json(session('error')) }));</script>
    @endif

    @stack('scripts')
</body>

</html>
