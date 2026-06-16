<div class="header">
    <div class="header-left">
        <a href="/home" class="logo">
            <img src="assets/img/logo.png" width="35" height="35" alt="DDU Clinic">
            <span>Dire Dawa Clinic Center</span>
        </a>
    </div>

    <a id="toggle_btn" href="javascript:void(0);"><i class="fa fa-bars"></i></a>
    <a id="mobile_btn" class="mobile_btn float-left" href="#sidebar"><i class="fa fa-bars"></i></a>

    @auth
        @php
            $__user = Auth::user();
            $__roleLabels = [
                '0' => 'Reception',
                '1' => 'Doctor',
                '2' => 'Labratorist',
                '3' => 'Pharmacist',
                '4' => 'Manager',
            ];
            $__roleIcons = [
                '0' => 'fa-headphones',
                '1' => 'fa-user-md',
                '2' => 'fa-flask',
                '3' => 'fa-medkit',
                '4' => 'fa-shield',
            ];
            $__role = (string) ($__user->role ?? '');
            $__roleLabel = $__roleLabels[$__role] ?? 'Staff';
            $__roleIcon = $__roleIcons[$__role] ?? 'fa-user';
            $__first = strtok(trim($__user->name ?? 'there'), ' ');
            $__hour = (int) now()->format('G');
            $__hello = $__hour < 12 ? 'Good morning' : ($__hour < 17 ? 'Good afternoon' : 'Good evening');
            $__avatar = $__user->profile_photo_path ? '/storage/' . $__user->profile_photo_path : '/images/avatar.png';

            // Build role-aware notification list from the shared $navCounts.
            $__c = $navCounts ?? [];
            $__notes = [];
            if ($__role === '1') {
                if (($__c['labReady'] ?? 0) > 0) $__notes[] = ['t' => $__c['labReady'].' lab result'.($__c['labReady']>1?'s':'').' ready for review', 'u' => '/lab_results_ready', 'i' => 'fa-flask', 'c' => 'is-primary'];
                if (($__c['queued'] ?? 0) > 0)   $__notes[] = ['t' => $__c['queued'].' patient'.($__c['queued']>1?'s':'').' waiting in queue', 'u' => '/queued_patients', 'i' => 'fa-stethoscope', 'c' => 'is-warning'];
            } elseif ($__role === '0') {
                if (($__c['queued'] ?? 0) > 0) $__notes[] = ['t' => $__c['queued'].' patient'.($__c['queued']>1?'s':'').' in the queue', 'u' => '/queued_patients', 'i' => 'fa-stethoscope', 'c' => 'is-warning'];
            } elseif ($__role === '2') {
                if (($__c['labQueue'] ?? 0) > 0)   $__notes[] = ['t' => $__c['labQueue'].' new lab order'.($__c['labQueue']>1?'s':''), 'u' => '/view_lab_order', 'i' => 'fa-flask', 'c' => 'is-primary'];
                if (($__c['labPending'] ?? 0) > 0) $__notes[] = ['t' => $__c['labPending'].' result'.($__c['labPending']>1?'s':'').' in progress', 'u' => '/view_pending_lab_results', 'i' => 'fa-hourglass-half', 'c' => 'is-info'];
            } elseif ($__role === '3') {
                if (($__c['drugNew'] ?? 0) > 0)     $__notes[] = ['t' => $__c['drugNew'].' new medication order'.($__c['drugNew']>1?'s':''), 'u' => '/view_orderd_drugs', 'i' => 'fa-medkit', 'c' => 'is-primary'];
                if (($__c['drugPending'] ?? 0) > 0) $__notes[] = ['t' => $__c['drugPending'].' order'.($__c['drugPending']>1?'s':'').' in progress', 'u' => '/view_orderd_drugs', 'i' => 'fa-hourglass-half', 'c' => 'is-info'];
            } elseif ($__role === '4') {
                if (($__c['leaves'] ?? 0) > 0) $__notes[] = ['t' => $__c['leaves'].' pending leave request'.($__c['leaves']>1?'s':''), 'u' => '/view-leave-request', 'i' => 'fa-plane', 'c' => 'is-info'];
            }
            $__noteCount = $__c['total'] ?? 0;
        @endphp

        {{-- Center: greeting + live date/clock --}}
        <div class="hdr-context d-none d-lg-flex">
            <span class="hdr-hello">{{ $__hello }}, {{ $__first }}</span>
            <span class="hdr-dot"></span>
            <span class="hdr-when">
                <i class="fa fa-calendar-o"></i>
                <span id="hdrDate">{{ now()->format('D, d M Y') }}</span>
                <span class="hdr-time" id="hdrClock">{{ now()->format('g:i A') }}</span>
            </span>
        </div>

        <ul class="nav user-menu float-right">
            {{-- Notifications bell --}}
            <li class="nav-item dropdown hdr-bell-li">
                <a href="#" class="dropdown-toggle nav-link hdr-bell" data-toggle="dropdown" aria-expanded="false" title="Notifications">
                    <i class="fa fa-bell-o"></i>
                    @if ($__noteCount > 0)<span class="hdr-bell-dot">{{ $__noteCount > 9 ? '9+' : $__noteCount }}</span>@endif
                </a>
                <div class="dropdown-menu dropdown-menu-right hdr-menu hdr-noti">
                    <div class="hdr-noti-head">
                        <span>Notifications</span>
                        @if ($__noteCount > 0)<span class="hdr-noti-count">{{ $__noteCount }} new</span>@endif
                    </div>
                    @forelse ($__notes as $n)
                        <a class="hdr-noti-item" href="{{ $n['u'] }}">
                            <span class="hdr-noti-ic stat-icon {{ $n['c'] }}"><i class="fa {{ $n['i'] }}"></i></span>
                            <span class="hdr-noti-txt">{{ $n['t'] }}</span>
                            <i class="fa fa-angle-right hdr-noti-go"></i>
                        </a>
                    @empty
                        <div class="hdr-noti-empty">
                            <i class="fa fa-check-circle"></i>
                            <p>You're all caught up.</p>
                        </div>
                    @endforelse
                </div>
            </li>

            {{-- Role badge --}}
            <li class="nav-item d-none d-md-flex align-items-center">
                <span class="hdr-role"><i class="fa {{ $__roleIcon }}"></i> {{ $__roleLabel }}</span>
            </li>

            {{-- User pill + dropdown --}}
            <li class="nav-item dropdown has-arrow user-dropdown">
                <a href="#" class="dropdown-toggle nav-link hdr-user" data-toggle="dropdown" aria-expanded="false">
                    <span class="user-img">
                        <img class="rounded-circle" src="{{ $__avatar }}" alt="{{ $__user->name }}"
                            onerror="this.onerror=null;this.src='/images/avatar.png'">
                        <span class="status online"></span>
                    </span>
                    <span class="hdr-user-meta d-none d-sm-flex">
                        <span class="hdr-user-name">{{ $__user->name ?? 'Account' }}</span>
                        <span class="hdr-user-role">{{ $__roleLabel }}</span>
                    </span>
                    <i class="fa fa-angle-down hdr-caret"></i>
                </a>
                <div class="dropdown-menu dropdown-menu-right hdr-menu">
                    <div class="user-header">
                        <img class="user-header-img" src="{{ $__avatar }}" alt="{{ $__user->name }}"
                            onerror="this.onerror=null;this.src='/images/avatar.png'">
                        <div class="user-text">
                            <h6>{{ $__user->name ?? 'User' }}</h6>
                            <p>{{ $__user->email }}</p>
                            <span class="hdr-menu-role"><i class="fa {{ $__roleIcon }}"></i> {{ $__roleLabel }}</span>
                        </div>
                    </div>
                    <a class="dropdown-item" href="/myprofile"><i class="fa fa-user-o"></i> My profile</a>
                    <a class="dropdown-item" href="/home"><i class="fa fa-th-large"></i> Dashboard</a>
                    <div class="dropdown-divider"></div>
                    <form method="POST" action="{{ route('logout') }}" class="m-0">
                        @csrf
                        <button type="submit" class="dropdown-item is-logout"><i class="fa fa-sign-out"></i> Log out</button>
                    </form>
                </div>
            </li>
        </ul>

        {{-- Mobile compact menu --}}
        <div class="dropdown mobile-user-menu float-right">
            <a href="#" class="dropdown-toggle" data-toggle="dropdown" aria-expanded="false"><i class="fa fa-ellipsis-v"></i></a>
            <div class="dropdown-menu dropdown-menu-right hdr-menu">
                <a class="dropdown-item" href="/myprofile"><i class="fa fa-user-o"></i> My profile</a>
                <a class="dropdown-item" href="/home"><i class="fa fa-th-large"></i> Dashboard</a>
                <div class="dropdown-divider"></div>
                <form method="POST" action="{{ route('logout') }}" class="m-0">
                    @csrf
                    <button type="submit" class="dropdown-item is-logout"><i class="fa fa-sign-out"></i> Log out</button>
                </form>
            </div>
        </div>
    @endauth
</div>

@push('scripts')
<script>
    (function () {
        var clock = document.getElementById('hdrClock');
        if (!clock) return;
        function tick() {
            var d = new Date();
            var h = d.getHours(), m = d.getMinutes();
            var ap = h >= 12 ? 'PM' : 'AM';
            h = h % 12; if (h === 0) h = 12;
            clock.textContent = h + ':' + (m < 10 ? '0' + m : m) + ' ' + ap;
        }
        tick();
        setInterval(tick, 30000);
    })();

    // Once-per-session summary toast of pending items (not on every page load).
    (function () {
        @auth
        var notes = @json($__notes);
        var role = @json($__role);
        if (!notes || !notes.length) { return; }
        try {
            var key = 'ddu_noti_' + role + '_' + notes.length + '_' + notes[0].t;
            if (sessionStorage.getItem(key)) { return; }
            sessionStorage.setItem(key, '1');
        } catch (e) {}
        document.addEventListener('DOMContentLoaded', function () {
            if (typeof Toast === 'undefined') { return; }
            setTimeout(function () {
                Toast.fire({ icon: 'info', title: notes[0].t });
            }, 900);
        });
        @endauth
    })();
</script>
@endpush
