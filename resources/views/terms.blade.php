<x-guest-layout>
    <div class="pt-4 bg-gray-100">
        <div class="min-h-screen flex flex-col items-center pt-6 sm:pt-0">
            <div>
                <x-jet-authentication-card-logo />
            </div>

            <div class="w-full sm:max-w-2xl mt-6 p-8 bg-white shadow-md overflow-hidden sm:rounded-lg prose max-w-none"
                style="border-top:4px solid #16a085;">
                <h1 style="color:#0e6e5c;">Terms of Service</h1>
                {!! $terms !!}
            </div>
        </div>
    </div>
</x-guest-layout>
