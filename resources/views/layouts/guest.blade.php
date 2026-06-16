<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">

        <title>{{ config('app.name', 'Laravel') }}</title>

        <!-- Fonts -->
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700&display=swap">

        <!-- Styles -->
        <link rel="stylesheet" href="{{ mix('css/app.css') }}">

        <!-- Scripts -->
        <script src="{{ mix('js/app.js') }}" defer></script>
    </head>
    <body>
        <div class="font-sans text-gray-900 antialiased"
            style="min-height:100vh; background:
                radial-gradient(900px 500px at 80% -10%, rgba(22,160,133,.18), transparent 60%),
                radial-gradient(700px 500px at 0% 110%, rgba(22,160,133,.12), transparent 55%),
                linear-gradient(180deg,#f4f7f9 0%,#eafaf4 100%);">
            {{ $slot }}
        </div>
    </body>
</html>
