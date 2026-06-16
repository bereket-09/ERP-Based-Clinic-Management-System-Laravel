<x-guest-layout>
    <div class="min-h-screen w-full flex items-stretch">

        {{-- LEFT: branded green panel (hidden on small screens) --}}
        <div class="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col justify-between p-12 text-white"
            style="background: linear-gradient(135deg, #16a085 0%, #128a72 45%, #0e6e5c 100%);">

            {{-- decorative CSS shapes --}}
            <div class="pointer-events-none absolute -top-24 -right-24 w-96 h-96 rounded-full"
                style="background: rgba(255,255,255,0.08);"></div>
            <div class="pointer-events-none absolute top-1/3 -left-16 w-72 h-72 rounded-full"
                style="background: rgba(255,255,255,0.06);"></div>
            <div class="pointer-events-none absolute -bottom-28 right-1/4 w-80 h-80 rounded-full"
                style="background: rgba(14,110,92,0.45);"></div>
            <div class="pointer-events-none absolute bottom-16 right-12 w-24 h-24 rounded-2xl rotate-12"
                style="background: rgba(255,255,255,0.05);"></div>

            {{-- brand / logo --}}
            <div class="relative z-10 flex items-center gap-3">
                <div class="flex items-center justify-center w-12 h-12 rounded-xl"
                    style="background: rgba(255,255,255,0.15);">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-7 h-7" fill="none" viewBox="0 0 24 24"
                        stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round"
                            d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                </div>
                <span class="text-lg font-bold tracking-wide">Dire Dawa University Clinic Center</span>
            </div>

            {{-- tagline --}}
            <div class="relative z-10 max-w-md">
                <h1 class="text-4xl font-extrabold leading-tight">
                    Care, coordinated.
                </h1>
                <p class="mt-4 text-base text-white/80 leading-relaxed">
                    One secure portal for the entire clinic, from front desk to lab,
                    pharmacy and management.
                </p>

                {{-- feature bullets --}}
                <ul class="mt-8 space-y-4">
                    @foreach ([
                        'Patient registration & records',
                        'Lab & pharmacy workflow',
                        'Role-based dashboards',
                        'Staff, leave & property management',
                    ] as $feature)
                        <li class="flex items-center gap-3">
                            <span class="flex items-center justify-center w-6 h-6 rounded-full shrink-0"
                                style="background: rgba(255,255,255,0.18);">
                                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none"
                                    viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                            </span>
                            <span class="text-sm font-medium text-white/90">{{ $feature }}</span>
                        </li>
                    @endforeach
                </ul>
            </div>

            {{-- footer note --}}
            <div class="relative z-10 text-xs text-white/60">
                &copy; {{ date('Y') }} Dire Dawa University Clinic Center
            </div>
        </div>

        {{-- RIGHT: login form --}}
        <div class="w-full lg:w-1/2 flex items-center justify-center px-6 py-12 sm:px-12">
            <div class="w-full max-w-md">

                {{-- mobile logo --}}
                <div class="lg:hidden flex items-center gap-3 mb-8">
                    <div class="flex items-center justify-center w-11 h-11 rounded-xl"
                        style="background: linear-gradient(135deg,#16a085,#0e6e5c);">
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-white" fill="none"
                            viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                    </div>
                    <span class="text-base font-bold" style="color:#0e6e5c;">DDU Clinic Center</span>
                </div>

                <div class="mb-8">
                    <h2 class="text-3xl font-bold" style="color:#0e6e5c;">Welcome back</h2>
                    <p class="text-sm text-gray-500 mt-2">Sign in to the DDU Clinic portal</p>
                </div>

                <x-jet-validation-errors class="mb-4" />

                @if (session('status'))
                    <div class="mb-4 font-medium text-sm text-green-600">
                        {{ session('status') }}
                    </div>
                @endif

                <form method="POST" action="{{ route('login') }}">
                    @csrf

                    <div>
                        <x-jet-label for="email" value="{{ __('Email') }}" />
                        <x-jet-input id="email" class="block mt-1 w-full" type="email" name="email"
                            :value="old('email')" required autofocus />
                    </div>

                    <div class="mt-4">
                        <x-jet-label for="password" value="{{ __('Password') }}" />
                        <x-jet-input id="password" class="block mt-1 w-full" type="password" name="password" required
                            autocomplete="current-password" />
                    </div>

                    <div class="flex items-center justify-between mt-4">
                        <label for="remember_me" class="flex items-center">
                            <x-jet-checkbox id="remember_me" name="remember" />
                            <span class="ml-2 text-sm text-gray-600">{{ __('Remember me') }}</span>
                        </label>

                        @if (Route::has('password.request'))
                            <a class="text-sm hover:underline" style="color:#138d75;"
                                href="{{ route('password.request') }}">
                                {{ __('Forgot your password?') }}
                            </a>
                        @endif
                    </div>

                    <div class="mt-6">
                        <button type="submit"
                            class="w-full flex justify-center items-center px-4 py-3 rounded-lg text-white text-sm font-semibold uppercase tracking-wide shadow-sm transition focus:outline-none focus:ring-2 focus:ring-offset-2"
                            style="background-color:#16a085;"
                            onmouseover="this.style.backgroundColor='#138d75'"
                            onmouseout="this.style.backgroundColor='#16a085'">
                            {{ __('Log in') }}
                        </button>
                    </div>

                    @if (Route::has('register'))
                        <p class="mt-6 text-center text-sm text-gray-500">
                            {{ __("Don't have an account?") }}
                            <a href="{{ route('register') }}" class="font-semibold hover:underline"
                                style="color:#16a085;">
                                {{ __('Register') }}
                            </a>
                        </p>
                    @endif
                </form>
            </div>
        </div>
    </div>
</x-guest-layout>
